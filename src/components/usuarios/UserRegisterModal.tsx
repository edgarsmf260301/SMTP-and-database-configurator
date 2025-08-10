import React, { useState, useRef, useEffect } from "react";
import InputField from "./InputField";
import RolesDropdown from "./RolesDropdown";
import ErrorMessage from "./ErrorMessage";
import ModalHeader from "./ModalHeader";
import SubmitCancelButtons from "./SubmitCancelButtons";
import AdminVerification from "./AdminVerification";

interface UserRegisterModalProps {
  show: boolean;
  onClose: () => void;
  onUserRegistered: () => void;
  users: any[];
}

const UserRegisterModal: React.FC<UserRegisterModalProps> = ({ show, onClose, onUserRegistered, users }) => {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    roles: string[];
    isActive: boolean;
    password: string;
    confirmPassword: string;
    emailVerified: boolean;
    verificationCode: string;
  }>({
    name: "",
    email: "",
    roles: [],
    isActive: true,
    password: "",
    confirmPassword: "",
    emailVerified: false,
    verificationCode: "",
  });
  const [adminVerificationSent, setAdminVerificationSent] = useState(false);
  const [adminVerificationError, setAdminVerificationError] = useState("");
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [adminVerificationExpired, setAdminVerificationExpired] = useState(false);
  const adminCodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  // Expiración del código de verificación
  useEffect(() => {
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

  // Dropdown click outside is handled inside RolesDropdown



  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };


  const handleRegister = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError("");
  // Validar que el nombre y el correo no estén repetidos
  const normalizedEmail = form.email.trim().toLowerCase();
  const nameExists = users.some(u => u.name.trim().toLowerCase() === form.name.trim().toLowerCase());
  const emailExists = users.some(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (nameExists) {
      setError("El nombre de usuario ya está registrado");
      setSaving(false);
      return;
    }
    if (emailExists) {
      setError("El correo electrónico ya está registrado");
      setSaving(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setSaving(false);
      return;
    }
    if (!form.roles || form.roles.length === 0) {
      setError("Debes seleccionar al menos un rol");
      setSaving(false);
      return;
    }
    // Si es admin, no registrar aquí, solo tras verificación
    if (form.roles.includes('admin')) {
      setError("Para registrar un administrador, primero debes verificar el correo electrónico.");
      setSaving(false);
      return;
    }
    // Usuarios normales
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: normalizedEmail,
          roles: form.roles,
          isActive: form.isActive,
          password: form.password
        }),
        credentials: "include"
      });
      if (res.ok) {
        onClose();
        setForm({ name: "", email: "", roles: [], isActive: true, password: "", confirmPassword: "", emailVerified: false, verificationCode: "" });
        setAdminVerificationSent(false);
        setAdminVerificationError("");
        setAdminVerificationExpired(false);
        if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
        setTimeout(() => onUserRegistered(), 300);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Error al registrar usuario");
      }
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  // Registrar admin tras verificación
  const handleAdminRegister = async () => {
    setSaving(true);
    setError("");
    const normalizedEmail = form.email.trim().toLowerCase();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: normalizedEmail,
          roles: form.roles,
          isActive: form.isActive,
          password: form.password
        }),
        credentials: "include"
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setForm({ name: "", email: "", roles: [], isActive: true, password: "", confirmPassword: "", emailVerified: false, verificationCode: "" });
          setAdminVerificationSent(false);
          setAdminVerificationError("");
          setAdminVerificationExpired(false);
          if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
          onUserRegistered();
          setSuccess(false);
        }, 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Error al registrar usuario");
      }
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.55)' }}>
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={form.roles.includes('admin') ? e => e.preventDefault() : handleRegister}
        className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 flex flex-col gap-6 border border-orange-700/40 shadow-2xl animate-fade-in"
      >
        <ModalHeader
          onClose={() => {
            onClose();
            setForm({ name: "", email: "", roles: [], isActive: true, password: "", confirmPassword: "", emailVerified: false, verificationCode: "" });
            setAdminVerificationSent(false);
            setAdminVerificationError("");
            setAdminVerificationExpired(false);
            setSuccess(false);
            if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
          }}
          title="Registrar Usuario"
        />
        <div className="flex flex-col gap-4">
          <InputField name="name" value={form.name} onChange={handleInput} required placeholder="Nombre" />
          <InputField name="email" value={form.email} onChange={handleInput} required placeholder="Correo" />
          <RolesDropdown roles={form.roles} setRoles={(roles: string[]) => setForm(f => ({ ...f, roles: roles }))} rolesDropdownOpen={rolesDropdownOpen} setRolesDropdownOpen={setRolesDropdownOpen} />
          <InputField name="password" value={form.password} onChange={handleInput} required placeholder="Contraseña" type="password" />
          <InputField name="confirmPassword" value={form.confirmPassword} onChange={handleInput} required placeholder="Confirmar Contraseña" type="password" />
          <div className="relative min-h-[0px] flex flex-col items-center justify-center">
            {form.roles.includes('admin') && !form.emailVerified && (
              <div className="w-full flex justify-center">
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
                />
              </div>
            )}
            {form.roles.includes('admin') && form.emailVerified && !success && (
              <button
                type="button"
                className="w-full max-w-xs mx-auto bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-base hover:scale-105 active:scale-95 animate-fade-in mt-2"
                disabled={saving}
                onClick={handleAdminRegister}
                style={{ display: 'block' }}
              >
                Registrar Administrador
              </button>
            )}
            {success && (
              <div className="text-green-400 text-center font-bold animate-fade-in mt-2">¡Usuario administrador registrado exitosamente!</div>
            )}
          </div>
          <ErrorMessage message={error} />
          {!form.roles.includes('admin') && (
            <SubmitCancelButtons
              onCancel={() => {
                onClose();
                setForm({ name: "", email: "", roles: [], isActive: true, password: "", confirmPassword: "", emailVerified: false, verificationCode: "" });
                setAdminVerificationSent(false);
                setAdminVerificationError("");
                setAdminVerificationExpired(false);
                setSuccess(false);
                if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
              }}
              saving={saving}
              disabled={
                saving ||
                !form.name.trim() ||
                !form.email.trim() ||
                !form.password.trim() ||
                !form.confirmPassword.trim() ||
                form.password !== form.confirmPassword ||
                !form.roles.length
              }
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default UserRegisterModal;
