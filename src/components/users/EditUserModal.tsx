import React, { useState, useEffect, useRef } from 'react';
import InputField from '../ui/InputField';
import RolesDropdown from '../forms/RolesDropdown';
import ErrorMessage from '../ui/ErrorMessage';
import ModalHeader from '../ui/ModalHeader';
import SubmitCancelButtons from '../ui/SubmitCancelButtons';
import AdminVerification from '../forms/AdminVerification';

interface EditUserModalProps {
  show: boolean;
  user: any;
  onClose: () => void;
  onUserUpdated: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  user,
  onClose,
  onUserUpdated,
}) => {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    roles: string[];
    isActive: boolean;
    emailVerified: boolean;
  }>({
    name: '',
    email: '',
    roles: [],
    isActive: true,
    emailVerified: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);

  // Estados para verificación de admin
  const [adminVerificationSent, setAdminVerificationSent] = useState(false);
  const [adminVerificationError, setAdminVerificationError] = useState('');
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [adminVerificationExpired, setAdminVerificationExpired] =
    useState(false);
  const adminCodeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        roles: user.roles || [],
        isActive: user.isActive !== undefined ? user.isActive : true,
        emailVerified: user.emailVerified || false,
      });

      // Resetear estados de verificación cuando cambia el usuario
      setAdminVerificationSent(false);
      setAdminVerificationError('');
      setVerifyingAdmin(false);
      setAdminVerificationExpired(false);
    }
  }, [user]);

  const handleInput = (e: any) => {
    const { name, value, type, checked } = e.target;
    const newForm = { ...form, [name]: type === 'checkbox' ? checked : value };

    // Si se cambia el email, resetear emailVerified a false
    if (name === 'email' && value !== user.email) {
      newForm.emailVerified = false;
    }

    setForm(newForm);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Verificar si el usuario quiere ser admin y necesita verificación
    const wantsToBeAdmin = form.roles.includes('admin');
    const needsVerification = wantsToBeAdmin && !form.emailVerified;

    if (needsVerification) {
      setError(
        'Para asignar el rol de administrador, el correo electrónico debe estar verificado.'
      );
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      if (res.ok) {
        onClose();
        setTimeout(() => onUserUpdated(), 300);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Error al actualizar usuario');
      }
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (!show || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.55)' }}
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 flex flex-col gap-6 border border-orange-700/40 shadow-2xl animate-fade-in"
      >
        <ModalHeader onClose={onClose} title="Editar Usuario" />
        <div className="flex flex-col gap-4">
          <InputField
            name="name"
            value={form.name}
            onChange={handleInput}
            required
            placeholder="Nombre"
          />
          <InputField
            name="email"
            value={form.email}
            onChange={handleInput}
            required
            placeholder="Correo"
          />
          <RolesDropdown
            roles={form.roles}
            setRoles={(roles: string[]) =>
              setForm(f => ({ ...f, roles: roles }))
            }
            rolesDropdownOpen={rolesDropdownOpen}
            setRolesDropdownOpen={setRolesDropdownOpen}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={handleInput}
              className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
            />
            <label
              htmlFor="isActive"
              className="text-gray-300 text-sm font-medium"
            >
              Usuario está activo
            </label>
          </div>

          {/* Mostrar estado de verificación de email */}
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div
              className={`w-3 h-3 rounded-full ${form.emailVerified ? 'bg-green-400' : 'bg-red-400'}`}
            ></div>
            <span className="text-sm text-gray-300">
              {form.emailVerified
                ? 'Correo verificado'
                : 'Correo no verificado'}
            </span>
          </div>

          {/* Componente de verificación de admin */}
          {form.roles.includes('admin') && !form.emailVerified && (
            <AdminVerification
              form={form}
              setForm={setForm}
              adminVerificationSent={adminVerificationSent}
              setAdminVerificationSent={setAdminVerificationSent}
              adminVerificationError={adminVerificationError}
              setAdminVerificationError={setAdminVerificationError}
              verifyingAdmin={verifyingAdmin}
              setVerifyingAdmin={setVerifyingAdmin}
              adminVerificationExpired={adminVerificationExpired}
              setAdminVerificationExpired={setAdminVerificationExpired}
              adminCodeTimerRef={adminCodeTimerRef}
              userId={user._id}
              adminIntent={true}
            />
          )}

          <ErrorMessage message={error} />
          <SubmitCancelButtons
            onCancel={onClose}
            saving={saving}
            disabled={
              !form.name.trim() || !form.email.trim() || !form.roles.length
            }
          />
        </div>
      </form>
    </div>
  );
};

export default EditUserModal;
