'use client';

import { useState, useEffect } from 'react';
import fs from 'fs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import { motion, AnimatePresence, easeInOut, easeOut, easeIn } from 'framer-motion';
=======
import { motion, AnimatePresence, cubicBezier } from 'framer-motion';
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349

// Esquemas de validación
const mongodbSchema = z.object({
  uri: z.string().url('Debe ser una URL válida de MongoDB'),
});

const smtpSchema = z.object({
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(1, 'La contraseña de aplicación es requerida'),
});

const adminSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

<<<<<<< HEAD
type Step = 'welcome' | 'mongodb' | 'smtp' | 'admin' | 'complete' | 'checking';
=======
type Step = 'welcome' | 'mongodb' | 'smtp' | 'admin' | 'admin-exists' | 'complete';
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349

interface SetupData {
  mongodb: { uri: string };
  smtp: { email: string; password: string };
  admin: { name: string; email: string; password: string };
}

export default function SetupWizard() {
<<<<<<< HEAD
  // Detectar si existe .env.local y cargar sus valores
  const [currentStep, setCurrentStep] = useState<Step>('checking');
  useEffect(() => {
    let mounted = true;
    async function checkEnvLocal() {
      try {
        const res = await fetch('/api/setup/check-env', { method: 'GET' });
        if (res.ok) {
          const env = await res.json();
          if (env.mongodb && env.smtp) {
            setSetupData({
              mongodb: { uri: env.mongodb },
              smtp: { email: env.smtp.email, password: env.smtp.password },
              admin: { name: '', email: '', password: '' },
            });
            // Verificar si existe usuario admin y base de datos
            const checkRes = await fetch('/api/setup/test-mongodb', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uri: env.mongodb }),
            });
            const checkData = await checkRes.json();
            if (checkData.success && checkData.adminExists) {
              // Si todo está correcto, redirigir al login inmediatamente desde la pantalla de carga
              window.location.replace('/login');
              return;
            }
            // Si no existe admin, saltar directamente al paso de creación de admin
            if (mounted) setCurrentStep('admin');
            return;
          }
        }
        if (mounted) setCurrentStep('welcome');
      } catch {
        if (mounted) setCurrentStep('welcome');
      }
    }
    checkEnvLocal();
    return () => { mounted = false; };
  }, []);
=======
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  // Verificación local para evitar verificación repetida
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const verified = localStorage.getItem('setup_verified');
      if (verified === 'true') {
        router.replace('/login');
      }
    }
  }, []);

  // Guardar verificación en localStorage al llegar al paso 'complete'
  useEffect(() => {
    if (currentStep === 'complete' && typeof window !== 'undefined') {
      localStorage.setItem('setup_verified', 'true');
    }
  }, [currentStep]);
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
  const [direction, setDirection] = useState(0); // Para controlar la dirección de la animación
  // Estado para saber si ya existe admin
  const [adminExists, setAdminExists] = useState<null | boolean>(null);
  const [setupData, setSetupData] = useState<SetupData>({
    mongodb: { uri: '' },
    smtp: { email: '', password: '' },
    admin: { name: '', email: '', password: '' },
  });
  // Verificar si ya existe admin al llegar al paso 'admin'
  useEffect(() => {
    if (currentStep === 'admin') {
      setIsLoading(true);
      setError('');
      fetch('/api/setup/admin-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mongodb: setupData.mongodb,
          smtp: setupData.smtp
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al verificar admin');
          }
          return res.json();
        })
        .then((data) => {
          if (data.exists) {
            setAdminExists(true);
            setTimeout(() => {
              goToNextStep('admin-exists');
            }, 2000);
          } else {
            setAdminExists(false);
          }
        })
        .catch((err) => {
          setError(err.message || 'Error al verificar admin');
        })
        .finally(() => setIsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, setupData.mongodb]);

  // Variantes de animación para las transiciones
<<<<<<< HEAD

=======
  const customEase = cubicBezier(0.4, 0.0, 0.2, 1);
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
  const pageVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
<<<<<<< HEAD
        ease: easeInOut,
=======
        ease: customEase,
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
        staggerChildren: 0.1,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
<<<<<<< HEAD
        ease: easeOut,
=======
        ease: customEase,
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
      },
    }),
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
<<<<<<< HEAD
        ease: easeInOut,
=======
        ease: customEase,
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2,
        ease: easeIn,
      }
    },
  };
  // (Eliminada declaración duplicada de setupData)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // Estados para verificación de email
  const [verificationToken, setVerificationToken] = useState('');
  const [tokenSent, setTokenSent] = useState(false);
  const [tokenExpires, setTokenExpires] = useState<Date | null>(null);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [adminExists, setAdminExists] = useState<'checking' | 'exists' | 'not-exists'>('checking');
  const router = useRouter();

  // Verificar si existe usuario admin al entrar al paso 'admin' usando la URI original
  useEffect(() => {
    if (currentStep === 'admin') {
      setAdminExists('checking');
      setIsLoading(true);
      setError('');
      fetch('/api/setup/test-mongodb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: setupData.mongodb.uri }),
      })
        .then(async res => {
          const data = await res.json();
          if (data.adminExists) {
            setAdminExists('exists');
          } else {
            setAdminExists('not-exists');
          }
        })
        .catch(() => {
          setError('Error verificando usuario administrador');
          setAdminExists('not-exists');
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentStep, setupData.mongodb]);

  // Timer para actualizar el tiempo restante del token
  useEffect(() => {
    if (!tokenExpires) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((tokenExpires.getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tokenExpires]);

  const mongodbForm = useForm({
    resolver: zodResolver(mongodbSchema),
    defaultValues: { uri: '' },
  });

  const smtpForm = useForm({
    resolver: zodResolver(smtpSchema),
    defaultValues: { email: '', password: '' },
  });

  const adminForm = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const steps = [
    { id: 'welcome', title: 'Bienvenida' },
    { id: 'mongodb', title: 'Base de Datos' },
    { id: 'smtp', title: 'Email' },
    { id: 'admin', title: 'Administrador' },
    { id: 'complete', title: 'Completado' },
  ];

  // Funciones para navegación con animaciones
  const goToNextStep = (nextStep: Step) => {
    setDirection(1);
    setCurrentStep(nextStep);
  };

  const goToPreviousStep = (prevStep: Step) => {
    setDirection(-1);
    setCurrentStep(prevStep);
  };

  const handleMongoDBSubmit = async (data: { uri: string }) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/setup/test-mongodb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: data.uri }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con MongoDB');
      }

      setSetupData(prev => ({ ...prev, mongodb: data }));
      goToNextStep('smtp');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSMTPSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/setup/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al verificar configuración SMTP');
      }

      setSetupData(prev => ({ ...prev, smtp: data }));
      goToNextStep('admin');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (token: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/setup/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: setupData.admin.email,
          token,
          mongodb: setupData.mongodb,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al verificar email');
      }

      const result = await response.json();
      
      if (result.success) {
        goToNextStep('complete');
      } else {
        throw new Error(result.error || 'Error al verificar email');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendToken = async () => {
    if (resendAttempts >= 1 && resendCooldown && new Date() < resendCooldown) {
      return; // Aún en cooldown
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/setup/resend-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: setupData.admin.email,
          mongodb: setupData.mongodb,
          smtp: setupData.smtp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al reenviar token');
      }

      const result = await response.json();
      
      if (result.success) {
        setResendAttempts(prev => prev + 1);
        setTokenExpires(new Date(Date.now() + 110000)); // 110 segundos
        
        if (resendAttempts >= 1) {
          // Después del segundo intento, activar cooldown de 5 minutos
          setResendCooldown(new Date(Date.now() + 300000)); // 5 minutos
        }
      } else {
        throw new Error(result.error || 'Error al reenviar token');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (data: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    setError('');
    try {
      // Enviar la URI original del usuario, el backend se encarga de seleccionar la base Restaurant
      const response = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          mongodb: { uri: setupData.mongodb.uri },
          smtp: setupData.smtp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear usuario administrador');
      }

      const result = await response.json();
      if (result.success) {
        setSetupData(prev => ({ ...prev, admin: data }));
        setTokenSent(true);
        setTokenExpires(new Date(Date.now() + 110000)); // 110 segundos
        // No cambiar de paso, permanecer en el mismo paso para verificación
      } else {
        throw new Error(result.error || 'Error al crear usuario administrador');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    if (currentStep === 'checking') {
      // Loader global para verificación inicial
      return (
        <motion.div
          className="flex flex-col items-center justify-center py-16 min-h-[400px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeInOut }}
        >
          <motion.div
            className="w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-700 shadow-2xl animate-pulse"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: [0.9, 1.08, 0.95, 1], opacity: [0.7, 1, 0.8, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2.5" stroke="currentColor" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3" />
            </svg>
          </motion.div>
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Verificando configuración inicial...
          </motion.h2>
          <motion.p
            className="text-base text-gray-400 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Por favor espera unos segundos mientras verificamos tu archivo de entorno y la base de datos.
          </motion.p>
        </motion.div>
      );
    }
    switch (currentStep) {
      case 'welcome':
        return (
          <motion.div 
            className="text-center space-y-6"
            variants={itemVariants}
            initial="initial"
            animate="animate"
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white"
              variants={itemVariants}
            >
              ¡Bienvenido al Sistema de Restaurante!
            </motion.h2>
            <motion.p 
              className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4"
              variants={itemVariants}
            >
              Vamos a configurar tu sistema paso a paso. Este proceso te guiará para establecer la conexión a la base de datos, 
              configurar el envío de emails y crear tu cuenta de administrador.
            </motion.p>
            <motion.button
              onClick={() => goToNextStep('mongodb')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Comenzar Configuración
            </motion.button>
          </motion.div>
        );

      case 'mongodb':
        return (
          <motion.div 
            className="max-w-2xl mx-auto space-y-4 sm:space-y-6"
            variants={itemVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              className="text-center"
              variants={itemVariants}
            >
              <motion.div 
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </motion.div>
              <motion.h2 
                className="text-xl sm:text-2xl font-bold text-white"
                variants={itemVariants}
              >
                Configuración de Base de Datos
              </motion.h2>
              <motion.p 
                className="text-sm sm:text-base text-gray-300"
                variants={itemVariants}
              >
                Ingresa la URI de conexión de MongoDB
              </motion.p>
            </motion.div>

            <motion.div 
              className="bg-gray-700 border border-yellow-500/30 rounded-lg p-3 sm:p-4"
              variants={itemVariants}
            >
              <h3 className="font-semibold text-yellow-400 mb-2 text-sm sm:text-base">🔧 Configuración de IP:</h3>
              <p className="text-gray-300 text-xs sm:text-sm mb-2">
                Para permitir todas las conexiones, configura tu IP como <code className="bg-gray-600 px-1 sm:px-2 py-1 rounded text-yellow-300 text-xs">0.0.0.0/0</code>
              </p>
              <p className="text-gray-300 text-xs sm:text-sm">
                Si tienes conocimientos avanzados y un proveedor con IP fija, configura esa IP específica para mayor seguridad.
              </p>
            </motion.div>

            <motion.form 
              onSubmit={mongodbForm.handleSubmit(handleMongoDBSubmit)} 
              className="space-y-4"
              variants={itemVariants}
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URI de MongoDB
                </label>
                <input
                  {...mongodbForm.register('uri')}
                  type="text"
                  placeholder="mongodb+srv://usuario:contraseña@cluster.mongodb.net/restaurant-system"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 text-sm sm:text-base"
                />
                {mongodbForm.formState.errors.uri && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{mongodbForm.formState.errors.uri.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-xs sm:text-sm">{error}</p>
                </div>
              )}

              <motion.div 
                className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0"
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={() => goToPreviousStep('welcome')}
                  className="px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Atrás
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? 'Verificando...' : 'Verificar Conexión'}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        );

      case 'smtp':
        return (
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Configuración de Email</h2>
              <p className="text-sm sm:text-base text-gray-300">Configura las credenciales de Gmail SMTP</p>
            </div>

            <div className="bg-gray-700 border border-blue-500/30 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-blue-400 mb-2 text-sm sm:text-base">📧 Configuración de Gmail:</h3>
              <ol className="text-gray-300 text-xs sm:text-sm space-y-1">
                <li>1. Ve a tu cuenta de Google</li>
                <li>2. Activa la verificación en dos pasos</li>
                <li>3. Genera una contraseña de aplicación</li>
                <li>4. Usa esa contraseña aquí</li>
              </ol>
            </div>

            <form onSubmit={smtpForm.handleSubmit(handleSMTPSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correo Electrónico de Gmail
                </label>
                <input
                  {...smtpForm.register('email')}
                  type="email"
                  placeholder="tu-email@gmail.com"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 text-sm sm:text-base"
                />
                {smtpForm.formState.errors.email && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{smtpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña de Aplicación
                </label>
                <input
                  {...smtpForm.register('password')}
                  type="password"
                  placeholder="Contraseña de aplicación de Google"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 text-sm sm:text-base"
                />
                {smtpForm.formState.errors.password && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{smtpForm.formState.errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-xs sm:text-sm">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => goToPreviousStep('mongodb')}
                  className="px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                >
                  {isLoading ? 'Verificando...' : 'Verificar SMTP'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'admin':
<<<<<<< HEAD
        // Solo permitir reenviar token cuando el tiempo haya expirado
        const canResend = timeLeft === 0 && (resendAttempts < 1 || (resendCooldown && new Date() > resendCooldown));
        const cooldownLeft = resendCooldown ? Math.max(0, Math.floor((resendCooldown.getTime() - Date.now()) / 1000)) : 0;

        // Loader con icono y animación mejorada
        if (adminExists === 'checking') {
          return (
            <motion.div
              className="flex flex-col items-center justify-center py-10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeInOut }}
            >
              <motion.div
                className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 shadow-xl animate-pulse"
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: [0.9, 1.05, 0.95, 1], opacity: [0.7, 1, 0.8, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
=======
        // Si está cargando la verificación de admin
        if (isLoading && adminExists === null) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-white text-lg font-semibold">Verificando existencia de usuario administrador...</p>
            </div>
          );
        }
        // Si ya existe admin, mostrar mensaje y saltar
        if (adminExists) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-orange-300 text-lg font-semibold text-center">Ya existe un usuario administrador en la base de datos.<br/>Serás redirigido al siguiente paso.</p>
            </div>
          );
        }
        // Si no existe admin, mostrar el formulario normal
        // ...existing code for admin form and verification...
        const canResend = resendAttempts < 1 || (resendCooldown && new Date() > resendCooldown);
        const cooldownLeft = resendCooldown ? Math.max(0, Math.floor((resendCooldown.getTime() - Date.now()) / 1000)) : 0;
        return (
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
                </svg>
              </motion.div>
              <motion.p
                className="text-lg sm:text-xl text-purple-300 font-semibold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Verificando si existe usuario administrador...
              </motion.p>
              <motion.p
                className="text-sm text-gray-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Por favor espera unos segundos mientras verificamos la base de datos.
              </motion.p>
            </motion.div>
          );
        }

        // Mensaje admin existe con icono y diseño destacado
        if (adminExists === 'exists') {
          const handleCompleteWithEnv = async () => {
            setIsLoading(true);
            setError('');
            try {
              // Llama al endpoint para crear el .env.local con formato de env.example
              const response = await fetch('/api/setup/generate-env', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  mongodb: setupData.mongodb,
                  smtp: setupData.smtp,
                  format: 'example',
                }),
              });
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al generar archivo de entorno');
              }
              goToNextStep('complete');
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
              setError(errorMessage);
            } finally {
              setIsLoading(false);
            }
          };
          return (
            <motion.div
              className="flex flex-col items-center justify-center py-10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeInOut }}
            >
              <motion.div
                className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 shadow-xl animate-pulse"
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: [0.9, 1.05, 0.95, 1], opacity: [0.7, 1, 0.8, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <motion.p
                className="text-lg sm:text-xl text-green-300 font-semibold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Usuario administrador ya existe.
              </motion.p>
              <motion.p
                className="text-sm text-gray-400 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Puedes continuar con la configuración o iniciar sesión con tu cuenta de administrador.
              </motion.p>
              {error && (
                <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3 mb-2">
                  <p className="text-red-300 text-xs sm:text-sm">{error}</p>
                </div>
              )}
              <motion.button
                onClick={handleCompleteWithEnv}
                disabled={isLoading}
                className="mt-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {isLoading ? 'Guardando configuración...' : 'Ir al siguiente paso'}
              </motion.button>
            </motion.div>
          );
        }

        // Formulario de creación admin con icono y diseño destacado
        if (adminExists === 'not-exists' && !tokenSent) {
          return (
            <motion.form
              onSubmit={adminForm.handleSubmit(handleAdminSubmit)}
              className="space-y-4 max-w-xl mx-auto bg-gray-800 rounded-2xl shadow-2xl border border-purple-700 p-8 sm:p-12 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeInOut }}
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 shadow-xl animate-pulse"
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: [0.9, 1.05, 0.95, 1], opacity: [0.7, 1, 0.8, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="10" r="7" strokeWidth="2.5" stroke="currentColor" fill="none" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 17c-4 0-7 2-7 4v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1c0-2-3-4-7-4z" />
                </svg>
              </motion.div>
              <motion.h2
                className="text-2xl sm:text-3xl font-bold text-purple-300 text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Crear Usuario Administrador
              </motion.h2>
              <motion.p
                className="text-base text-gray-400 text-center mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Ingresa los datos para crear tu cuenta de administrador.
              </motion.p>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de Usuario
                </label>
                <input
                  {...adminForm.register('name')}
                  type="text"
                  placeholder="Tu nombre de usuario"
                  className="w-full px-4 py-3 border border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-900 text-white placeholder-gray-400 text-base"
                />
                {adminForm.formState.errors.name && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{adminForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                <input
                  {...adminForm.register('email')}
                  type="email"
                  placeholder="admin@restaurante.com"
                  className="w-full px-4 py-3 border border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-900 text-white placeholder-gray-400 text-base"
                />
                {adminForm.formState.errors.email && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{adminForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <input
                  {...adminForm.register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-900 text-white placeholder-gray-400 text-base"
                />
                {adminForm.formState.errors.password && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{adminForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  {...adminForm.register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-900 text-white placeholder-gray-400 text-base"
                />
                {adminForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{adminForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              {error && (
                <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-xs sm:text-sm">{error}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 mt-6 w-full">
                <motion.button
                  type="button"
                  onClick={() => goToPreviousStep('smtp')}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors text-base font-semibold rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Atrás
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all duration-200 shadow-lg text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? 'Creando...' : 'Crear Usuario Admin'}
                </motion.button>
              </div>
            </motion.form>
          );
        }

        // Formulario de verificación con icono y diseño destacado
        if (adminExists === 'not-exists' && tokenSent) {
          return (
            <motion.div
              className="max-w-lg mx-auto bg-gray-800 rounded-xl shadow-2xl border border-blue-700 p-6 sm:p-8 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeInOut }}
            >
              <motion.div
                className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl animate-pulse"
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: [0.9, 1.05, 0.95, 1], opacity: [0.7, 1, 0.8, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 4h.01" />
                </svg>
              </motion.div>
              <motion.h2
                className="text-xl sm:text-2xl font-bold text-blue-300 text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Verifica tu Email
              </motion.h2>
              <motion.p
                className="text-sm text-gray-400 text-center mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Se ha enviado un token de verificación a <span className="text-blue-400 font-medium">{setupData.admin.email}</span>. Revisa tu bandeja de entrada y carpeta de spam. El token expira en <span className="text-blue-400 font-semibold">{timeLeft} segundos</span>.
              </motion.p>
              <motion.form
                onSubmit={(e) => { e.preventDefault(); handleVerifyEmail(verificationToken); }}
                className="space-y-4 w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token de Verificación
                  </label>
                  <input
                    type="text"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    placeholder="Ingresa el token de 6 dígitos"
                    className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-900 text-white placeholder-gray-400 text-base text-center tracking-widest"
                    maxLength={6}
                  />
                </div>
                {error && (
                  <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-300 text-xs sm:text-sm">{error}</p>
                  </div>
                )}
<<<<<<< HEAD
                <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 mt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setTokenSent(false);
                      setVerificationToken('');
                      setError('');
                    }}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors text-base font-semibold rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
=======

                <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    onClick={() => goToPreviousStep('smtp')}
                    className="px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all duration-200 shadow-lg text-sm sm:text-base"
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
                  >
                    Atrás
                  </motion.button>
                  <div className="flex space-x-3">
                    <motion.button
                      type="button"
                      onClick={handleResendToken}
                      disabled={!canResend || isLoading}
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 text-base font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {!canResend && cooldownLeft > 0 
                        ? `Esperar ${Math.floor(cooldownLeft / 60)}:${(cooldownLeft % 60).toString().padStart(2, '0')}`
                        : 'Reenviar Token'
                      }
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isLoading || verificationToken.length !== 6}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200 shadow-lg text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isLoading ? 'Verificando...' : 'Verificar Email'}
                    </motion.button>
                  </div>
<<<<<<< HEAD
                </div>
              </motion.form>
            </motion.div>
          );
        }

        return null;
=======
                </form>
              </>
            )}
          </div>
        );
      case 'admin-exists':
        // Mensaje final si ya existe admin
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-orange-300 text-center mb-2">Ya existe un usuario administrador</h2>
            <p className="text-base sm:text-lg text-gray-300 text-center mb-4">No es necesario crear otro usuario administrador. Puedes continuar con la configuración.</p>
            <button
              onClick={() => goToNextStep('complete')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
            >
              Continuar
            </button>
          </div>
        );
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349



      case 'complete':
<<<<<<< HEAD
        return (
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">¡Configuración Completada!</h2>
            <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
              Tu sistema de restaurante ha sido configurado exitosamente. Ahora puedes iniciar sesión con tu cuenta de administrador para comenzar a usar todas las funcionalidades.
            </p>
            <div className="bg-gray-700 border border-green-500/30 rounded-lg p-3 sm:p-4 max-w-2xl mx-auto">
              <h3 className="font-semibold text-green-400 mb-2 text-sm sm:text-base">✅ Configuración exitosa:</h3>
              <ul className="text-gray-300 text-xs sm:text-sm space-y-1">
                <li>• Conexión a MongoDB establecida</li>
                <li>• Configuración SMTP verificada</li>
                <li>• Usuario administrador creado</li>
                <li>• Base de datos Restaurant inicializada</li>
              </ul>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
            >
              Ir al Login
            </button>
=======
      return (
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">¡Configuración Completada!</h2>
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Tu sistema de restaurante ha sido configurado exitosamente. Ahora puedes iniciar sesión con tu cuenta de administrador para comenzar a usar todas las funcionalidades.
          </p>
          <div className="bg-gray-700 border border-green-500/30 rounded-lg p-3 sm:p-4 max-w-2xl mx-auto">
            <h3 className="font-semibold text-green-400 mb-2 text-sm sm:text-base">✅ Configuración exitosa:</h3>
            <ul className="text-gray-300 text-xs sm:text-sm space-y-1">
              <li>• Conexión a MongoDB establecida</li>
              <li>• Configuración SMTP verificada</li>
              <li>• Usuario administrador creado</li>
              <li>• Base de datos Restaurant_System inicializada</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
          >
            Ir al Login
          </button>
        </div>
      );

      default:
        return null;
    }
  };

  if (currentStep === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center justify-center py-16 min-h-[400px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeInOut }}
        >
          <motion.div
            className="w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-700 shadow-2xl animate-pulse"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: [0.9, 1.08, 0.95, 1], opacity: [0.7, 1, 0.8, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2.5" stroke="currentColor" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3" />
            </svg>
          </motion.div>
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Verificando sistema...
          </motion.h2>
          <motion.p
            className="text-base text-gray-400 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Comprobando configuración y estado del sistema
          </motion.p>
          <motion.ul className="mt-6 space-y-2 text-left">
            <motion.li className="text-blue-400 text-sm font-medium">Verificando archivos de configuración</motion.li>
            <motion.li className="text-blue-400 text-sm font-medium">Comprobando conexión a base de datos</motion.li>
            <motion.li className="text-gray-400 text-sm font-medium">Validando usuario administrador</motion.li>
          </motion.ul>
        </motion.div>
      </div>
    );
  }
  // Si no está en 'checking', renderizar el wizard normal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-6 sm:mb-8"
          variants={itemVariants}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Configuración de Sistema
          </h1>
        </motion.div>
        {/* Progress Steps */}
        <motion.div 
          className="max-w-5xl mx-auto mb-8 sm:mb-12"
          variants={itemVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-6 sm:space-y-0 px-4 sm:px-0">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = index < steps.findIndex(s => s.id === currentStep);
              const isFuture = index > steps.findIndex(s => s.id === currentStep);
              return (
                <motion.div 
                  key={step.id} 
                  className="flex flex-col items-center w-full sm:w-auto relative group"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Title with enhanced styling and animations */}
                  <div className="mb-3 sm:mb-4 transition-all duration-500 ease-out">
                    <p className={`text-xs sm:text-sm lg:text-base font-semibold text-center transition-all duration-300 ${
                      isActive 
                        ? 'text-orange-400 scale-110 animate-step-glow' 
                        : isCompleted 
                        ? 'text-green-400' 
                        : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {/* Step circle with enhanced animations */}
                  <motion.div 
                    className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-2 transition-all duration-500 ease-out transform ${
                      isActive 
                        ? 'bg-gradient-step-active border-orange-400 text-white shadow-step-active scale-110 animate-step-glow' 
                        : isCompleted 
                        ? 'bg-gradient-step-completed border-green-400 text-white shadow-step-completed scale-105' 
                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500 hover:bg-gray-700 hover:scale-105'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Active step glow effect */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-step-active opacity-20 animate-ping"></div>
                    )}
                    {/* Completed step glow effect */}
                    {isCompleted && (
                      <div className="absolute inset-0 rounded-full bg-gradient-step-completed opacity-10 animate-pulse"></div>
                    )}
                    {/* Ripple effect for active step */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-step-active opacity-30 animate-ripple"></div>
                    )}
                    {/* Icon or number with smooth transitions */}
                    <div className="relative z-10 transition-all duration-300">
                      {isCompleted ? (
                        <svg className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white transform scale-100 transition-all duration-500 ${
                          isCompleted ? 'animate-step-complete' : ''
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className={`text-sm sm:text-base lg:text-lg font-bold transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-700"
            variants={itemVariants}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
<<<<<<< HEAD
        {/* Footer solo en bienvenida y finalizado */}
        {(currentStep === 'welcome' || currentStep === 'complete') && (
          <footer className="mt-10 text-center text-gray-400 text-xs sm:text-sm">
            © 2025 Sistema de Restaurante{' '}
=======
        {/* Footer solo en bienvenida */}
        {currentStep === 'welcome' && (
          <footer className="mt-10 text-center text-gray-400 text-xs sm:text-sm">
            © 2025 Sistema de Restaurante |{' '}
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
            <a
              href="https://my-portfolio-lime-zeta-70.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline font-semibold"
            >
              Edgar Martinez - Desarrollador Web
            </a>
          </footer>
        )}
      </div>
    </div>
  );
} 