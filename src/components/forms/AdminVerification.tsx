import React from 'react';

interface AdminVerificationProps {
  form: any;
  setForm: (f: any) => void;
  adminVerificationSent: boolean;
  setAdminVerificationSent: (v: boolean) => void;
  adminVerificationError: string;
  setAdminVerificationError: (v: string) => void;
  verifyingAdmin: boolean;
  setVerifyingAdmin: (v: boolean) => void;
  adminVerificationExpired: boolean;
  setAdminVerificationExpired: (v: boolean) => void;
  adminCodeTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  userId?: string; // For edit mode
  adminIntent?: boolean; // True if intent is to promote to admin
}

const AdminVerification: React.FC<AdminVerificationProps> = ({
  form,
  setForm,
  adminVerificationSent,
  setAdminVerificationSent,
  adminVerificationError,
  setAdminVerificationError,
  verifyingAdmin,
  setVerifyingAdmin,
  adminVerificationExpired,
  setAdminVerificationExpired,
  adminCodeTimerRef,
  userId,
  adminIntent,
}) => {
  // Debug logging for component state
  console.log('🔍 [ADMIN VERIFICATION] Component state:', {
    adminVerificationSent,
    adminVerificationError,
    verifyingAdmin,
    adminVerificationExpired,
    formEmail: form.email,
    formName: form.name,
    userId,
    adminIntent,
  });

  // Expiración del código de verificación
  React.useEffect(() => {
    if (adminVerificationSent && !form.emailVerified) {
      if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
      setAdminVerificationExpired(false);
      adminCodeTimerRef.current = setTimeout(() => {
        setAdminVerificationExpired(true);
      }, 120000);
      return () => {
        if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
      };
    }
    return () => {
      if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
    };
  }, [adminVerificationSent, form.emailVerified]);

  const handleSendVerification = async (e: any) => {
    e.stopPropagation();
    console.log('📧 [ADMIN VERIFICATION] Starting verification process...');
    console.log('📧 [ADMIN VERIFICATION] Form data:', {
      email: form.email,
      name: form.name,
      userId,
      adminIntent,
    });

    setVerifyingAdmin(true);
    setAdminVerificationError('');

    try {
      // Validar usuario/correo únicos antes de enviar
      console.log('📧 [ADMIN VERIFICATION] Checking uniqueness...');
      const res = await fetch('/api/users?checkUnique=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name.trim(),
          userId: userId || undefined,
          adminIntent: adminIntent || undefined,
        }),
      });

      console.log(
        '📧 [ADMIN VERIFICATION] Uniqueness check status:',
        res.status
      );
      const data = await res.json();
      console.log('📧 [ADMIN VERIFICATION] Uniqueness check response:', data);

      if (!res.ok || !data.unique) {
        setAdminVerificationError(
          data.message || 'El usuario o correo ya existe'
        );
        setVerifyingAdmin(false);
        return;
      }

      // Llamar endpoint real para enviar correo
      const normalizedEmail = form.email.trim().toLowerCase();
      console.log(
        '📧 [ADMIN VERIFICATION] Sending verification email to:',
        normalizedEmail
      );

      const sendRes = await fetch('/api/users/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          name: form.name.trim(),
          context: 'user',
        }),
      });

      console.log(
        '📧 [ADMIN VERIFICATION] Send response status:',
        sendRes.status
      );

      if (!sendRes.ok) {
        const errorData = await sendRes.json().catch(() => ({}));
        console.error('📧 [ADMIN VERIFICATION] Send error:', errorData);
        setAdminVerificationError(
          errorData.error || 'No se pudo enviar el correo de verificación'
        );
        setVerifyingAdmin(false);
        return;
      }

      const sendData = await sendRes.json().catch(() => ({}));
      console.log('📧 [ADMIN VERIFICATION] Send success:', sendData);
      setAdminVerificationSent(true);
      setAdminVerificationExpired(false);
      setForm((f: any) => ({ ...f, verificationCode: '' }));
    } catch (e) {
      console.error('📧 [ADMIN VERIFICATION] Exception:', e);
      setAdminVerificationError(
        'Error al enviar verificación: ' +
          (e instanceof Error ? e.message : 'Error desconocido')
      );
    }
    setVerifyingAdmin(false);
  };

  const handleVerifyCode = async (e: any) => {
    e.stopPropagation();
    console.log('🔐 [ADMIN VERIFICATION] Verifying code...');
    setVerifyingAdmin(true);
    setAdminVerificationError('');

    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      console.log(
        '🔐 [ADMIN VERIFICATION] Verifying code for email:',
        normalizedEmail
      );

      const verifyRes = await fetch('/api/users/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          code: form.verificationCode.trim(),
          context: 'user',
        }),
      });

      console.log(
        '🔐 [ADMIN VERIFICATION] Verify response status:',
        verifyRes.status
      );
      const data = await verifyRes.json();
      console.log('🔐 [ADMIN VERIFICATION] Verify response:', data);

      if (!verifyRes.ok || !data.success) {
        setAdminVerificationError(data.error || 'Código incorrecto o expirado');
        setVerifyingAdmin(false);
        return;
      }

      console.log('🔐 [ADMIN VERIFICATION] Code verified successfully!');
      setForm((f: any) => ({ ...f, emailVerified: true }));
      setAdminVerificationError('');
    } catch (e) {
      console.error('🔐 [ADMIN VERIFICATION] Exception:', e);
      setAdminVerificationError(
        'Error al verificar código: ' +
          (e instanceof Error ? e.message : 'Error desconocido')
      );
    }
    setVerifyingAdmin(false);
  };

  const handleResendCode = async (e: any) => {
    e.stopPropagation();
    console.log('📧 [ADMIN VERIFICATION] Resending code...');
    setVerifyingAdmin(true);
    setAdminVerificationError('');

    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const sendRes = await fetch('/api/users/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          name: form.name.trim(),
          context: 'user',
        }),
      });

      if (!sendRes.ok) {
        setAdminVerificationError(
          'No se pudo reenviar el correo de verificación'
        );
        setVerifyingAdmin(false);
        return;
      }

      setAdminVerificationSent(true);
      setAdminVerificationExpired(false);
      setForm((f: any) => ({ ...f, verificationCode: '' }));

      if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
      adminCodeTimerRef.current = setTimeout(() => {
        setAdminVerificationExpired(true);
      }, 120000);
    } catch (e) {
      console.error('📧 [ADMIN VERIFICATION] Resend exception:', e);
      setAdminVerificationError(
        'Error al reenviar verificación: ' +
          (e instanceof Error ? e.message : 'Error desconocido')
      );
    }
    setVerifyingAdmin(false);
  };

  console.log('🔍 [ADMIN VERIFICATION] Rendering with state:', {
    adminVerificationSent,
    adminVerificationExpired,
    verifyingAdmin,
  });

  return (
    <>
      {!adminVerificationSent ? (
        <button
          type="button"
          disabled={verifyingAdmin || !form.email.trim() || !form.name.trim()}
          onClick={handleSendVerification}
          className={
            `bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 text-base hover:scale-105 active:scale-95 animate-fade-in ` +
            `disabled:opacity-60 disabled:cursor-not-allowed`
          }
          style={{ opacity: 1, transition: 'opacity 0.4s' }}
        >
          {verifyingAdmin ? 'Enviando...' : 'Enviar Correo de Verificación'}
        </button>
      ) : (
        <div className="flex flex-col gap-2 animate-fade-in">
          <span className="text-green-400 text-sm">
            Correo de verificación enviado. Ingresa el código recibido:
          </span>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={form.verificationCode || ''}
              onChange={e =>
                setForm((f: any) => ({
                  ...f,
                  verificationCode: e.target.value,
                }))
              }
              placeholder="Código de verificación"
              className="px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500 text-base font-semibold placeholder-gray-400 w-40"
              disabled={adminVerificationExpired}
            />
            <button
              type="button"
              disabled={
                verifyingAdmin ||
                !(
                  form.verificationCode &&
                  form.verificationCode.trim().length > 0
                ) ||
                adminVerificationExpired
              }
              onClick={handleVerifyCode}
              className={
                `bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 text-base hover:scale-105 active:scale-95 ` +
                `disabled:opacity-60 disabled:cursor-not-allowed`
              }
            >
              {verifyingAdmin ? 'Verificando...' : 'Verificar código'}
            </button>
            {adminVerificationExpired && (
              <button
                type="button"
                disabled={verifyingAdmin}
                onClick={handleResendCode}
                className={
                  `bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 text-base hover:scale-105 active:scale-95 ` +
                  `disabled:opacity-60 disabled:cursor-not-allowed`
                }
              >
                {verifyingAdmin ? 'Reenviando...' : 'Reenviar código'}
              </button>
            )}
          </div>
          {adminVerificationExpired && (
            <span className="text-yellow-400 text-sm">
              El código ha expirado. Reenvía para obtener uno nuevo.
            </span>
          )}
        </div>
      )}
      {adminVerificationError && (
        <span className="text-red-400 text-sm">{adminVerificationError}</span>
      )}
    </>
  );
};

export default AdminVerification;
