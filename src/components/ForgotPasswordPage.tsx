'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        {/* Login Form */}
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-700">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Recuperar Contraseña
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Ingresa tu correo electrónico para recibir un código de verificación
            </p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg text-green-300 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-700 text-white placeholder-gray-400 text-sm sm:text-base"
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  <span className="text-xs sm:text-sm">Enviando...</span>
                </div>
              ) : (
                'Enviar Código de Verificación'
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <a href="/login" className="text-orange-400 hover:text-orange-300 font-medium text-sm">
              ← Volver al Login
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; 2024 Sistema de Restaurante. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
} 