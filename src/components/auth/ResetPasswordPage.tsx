'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleVerifyCode = async () => {
    if (!token.trim()) {
      setError('El código de verificación es requerido');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Primero verificar el código
      console.log('🔐 [RESET PASSWORD] Verifying code:', token);
      const verifyResponse = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: token.trim() }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || 'Código de verificación inválido');
        setIsLoading(false);
        return;
      }

      console.log(
        '✅ [RESET PASSWORD] Code verified, proceeding to password change'
      );
      setCodeVerified(true);
      setMessage(
        'Código verificado correctamente. Ahora puedes cambiar tu contraseña.'
      );
      setError('');
    } catch (error) {
      console.error('💥 [RESET PASSWORD] Verify code error:', error);
      setError('Error al verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codeVerified) {
      setError('Primero debes verificar el código de verificación');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Luego cambiar la contraseña
      console.log('🔐 [RESET PASSWORD] Changing password...');
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('💥 [RESET PASSWORD] Change password error:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-sm sm:max-w-md w-full">
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-700">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                Error
              </h2>
              <p className="text-gray-300 text-sm sm:text-base mb-4">
                No se proporcionó un correo electrónico válido.
              </p>
              <a
                href="/forgot-password"
                className="text-orange-400 hover:text-orange-300 font-medium text-sm"
              >
                ← Volver a Recuperar Contraseña
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        {/* Reset Password Form */}
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-700">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Cambiar Contraseña
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Ingresa el código de verificación y tu nueva contraseña
            </p>
            <p className="text-gray-400 text-xs mt-2">Correo: {email}</p>
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
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Código de Verificación
              </label>
              <div className="flex space-x-2">
                <input
                  id="token"
                  name="token"
                  type="text"
                  required
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-700 text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="123456"
                  maxLength={6}
                  disabled={codeVerified}
                />
                {!codeVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isLoading || !token.trim()}
                    className="px-4 py-2 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isLoading ? 'Verificando...' : 'Verificar'}
                  </button>
                )}
              </div>
            </div>

            {codeVerified && (
              <>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Nueva Contraseña
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-700 text-white placeholder-gray-400 text-sm sm:text-base"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-700 text-white placeholder-gray-400 text-sm sm:text-base"
                    placeholder="••••••••"
                    minLength={6}
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
                      <span className="text-xs sm:text-sm">
                        Cambiando contraseña...
                      </span>
                    </div>
                  ) : (
                    'Cambiar Contraseña'
                  )}
                </button>
              </>
            )}
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <a
              href="/login"
              className="text-orange-400 hover:text-orange-300 font-medium text-sm"
            >
              ← Volver al Login
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-400">
          {/* Footer eliminado por requerimiento */}
        </div>
      </div>
    </div>
  );
}
