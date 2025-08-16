'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../layout/Footer';

const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface RateLimitInfo {
  blocked: boolean;
  remainingTime: number;
  attemptsLeft: number;
}

interface Notification {
  id: string;
  type: 'error' | 'info' | 'warning';
  message: string;
  details?: any;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(
    null
  );
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Función para agregar notificaciones
  const addNotification = (
    type: 'error' | 'info' | 'warning',
    message: string,
    details?: any
  ) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message, details }]);

    // Auto-remover notificaciones después de 5 segundos (excepto bloqueos)
    if (type !== 'warning') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
  };

  // Función para remover notificaciones
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Contador regresivo para el bloqueo
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (rateLimitInfo?.blocked && rateLimitInfo.remainingTime > 0) {
      setCountdown(rateLimitInfo.remainingTime);

      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setRateLimitInfo(null);
            setNotifications([]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rateLimitInfo]);

  const onSubmit = async (data: LoginFormData) => {
    if (rateLimitInfo?.blocked) {
      addNotification(
        'error',
        `Demasiados intentos fallidos. Intenta nuevamente en ${countdown} segundos.`
      );
      return;
    }

    setIsLoading(true);
    setNotifications([]);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.message === 'Login exitoso') {
        // Login exitoso
        router.push('/dashboard');
      } else {
        // Error en el login
        if (
          result.error &&
          result.error.includes('Demasiados intentos fallidos')
        ) {
          // Extraer el tiempo restante del mensaje de error
          const timeMatch = result.error.match(/(\d+) segundos/);
          const remainingTime = timeMatch ? parseInt(timeMatch[1]) : 240;

          setRateLimitInfo({
            blocked: true,
            remainingTime,
            attemptsLeft: 0,
          });
          addNotification('warning', 'Cuenta temporalmente bloqueada', {
            remainingTime,
            attemptsLeft: 0,
          });
        } else {
          setRateLimitInfo({
            blocked: false,
            remainingTime: 0,
            attemptsLeft: 3,
          });

          addNotification('error', result.error || 'Error en el login');
        }
      }
    } catch (error) {
      addNotification('error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderizar notificaciones
  const renderNotifications = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="absolute -top-4 left-0 right-0 space-y-2">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              className={`rounded-lg p-3 border backdrop-blur-sm ${
                notification.type === 'error'
                  ? 'bg-red-900/90 border-red-500/50 text-red-300'
                  : notification.type === 'warning'
                    ? 'bg-orange-900/90 border-orange-500/50 text-orange-300'
                    : 'bg-blue-900/90 border-blue-500/50 text-blue-300'
              }`}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-center flex-1">
                  {notification.message}
                </p>
                {notification.type !== 'warning' && (
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-2 text-current hover:opacity-70 transition-opacity"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Mostrar detalles especiales para bloqueos */}
              {notification.type === 'warning' && notification.details && (
                <div className="mt-2 text-center">
                  <div className="text-lg font-bold mb-2">
                    {formatTime(countdown)}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-orange-500 h-2 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: countdown, ease: 'linear' }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo/Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-2xl">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h1>
        </motion.div>

        {/* Formulario de Login */}
        <motion.div
          className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Notificaciones */}
          {renderNotifications()}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de Usuario o Email
              </label>
              <input
                {...register('username')}
                type="text"
                disabled={rateLimitInfo?.blocked || isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 transition-all duration-200 ${
                  errors.username ? 'border-red-500' : 'border-gray-600'
                } ${rateLimitInfo?.blocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Ingresa tu nombre o email"
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                disabled={rateLimitInfo?.blocked || isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 transition-all duration-200 ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                } ${rateLimitInfo?.blocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Ingresa tu contraseña"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón de Login */}
            <motion.button
              type="submit"
              disabled={isLoading || rateLimitInfo?.blocked}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 transform ${
                rateLimitInfo?.blocked
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:scale-105 active:scale-95'
              } shadow-lg`}
              whileHover={!rateLimitInfo?.blocked ? { scale: 1.02 } : {}}
              whileTap={!rateLimitInfo?.blocked ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : rateLimitInfo?.blocked ? (
                'Espera para intentar nuevamente'
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center">
            <a
              href="/forgot-password"
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Footer />
        </motion.div>
      </motion.div>
    </div>
  );
}
