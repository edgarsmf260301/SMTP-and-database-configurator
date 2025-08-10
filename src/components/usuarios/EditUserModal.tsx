
import React, { useState, useRef, useEffect } from "react";
import InputField from "./InputField";
import RolesDropdown from "./RolesDropdown";
import ErrorMessage from "./ErrorMessage";
import ModalHeader from "./ModalHeader";
import SubmitCancelButtons from "./SubmitCancelButtons";
import AdminVerification from "./AdminVerification";

interface EditUserModalProps {
  show: boolean;
  user: any;
  onClose: () => void;
  onUserUpdated: () => void;
}


const EditUserModal: React.FC<EditUserModalProps> = ({ show, user, onClose, onUserUpdated }) => {
  // Si no hay usuario, no renderizar nada
  if (!show || !user) return null;

  const [form, setForm] = useState<any>({ ...user });
  const [adminVerificationSent, setAdminVerificationSent] = useState(false);
  const [adminVerificationError, setAdminVerificationError] = useState("");
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [adminVerificationExpired, setAdminVerificationExpired] = useState(false);
  const adminCodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);

  // Detectar cambio de correo para reiniciar verificación
  useEffect(() => {
    setForm((f: any) => ({ ...f, emailVerified: user.emailVerified }));
  }, [user.emailVerified]);

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    // Si cambia el correo, reiniciar verificación
    if (name === "email" && value !== form.email) {
      setForm({ ...form, [name]: value, emailVerified: false });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleEdit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    if (!form.name?.trim() || !form.email?.trim()) {
      setError("Nombre y correo son obligatorios");
      setSaving(false);
      return;
    }
    if (!form.roles || form.roles.length === 0) {
      setError("Debes seleccionar al menos un rol");
      setSaving(false);
      return;
    }
    if (form.roles.includes('admin') && !form.emailVerified) {
      setError("Para asignar el rol de administrador, primero debes verificar el correo electrónico.");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          roles: form.roles,
          isActive: form.isActive
        }),
        credentials: "include"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Usuario y/o correo ya está siendo utilizado");
        setSaving(false);
        return;
      }
      onClose();
      setTimeout(() => onUserUpdated(), 300);
    } catch (err: any) {
      setError("Usuario y/o correo ya está siendo utilizado");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.55)' }}>
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleEdit}
        className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 flex flex-col gap-6 border border-orange-700/40 shadow-2xl animate-fade-in"
      >
        <ModalHeader
          onClose={() => {
            onClose();
            setForm({ ...user });
            setAdminVerificationSent(false);
            setAdminVerificationError("");
            setAdminVerificationExpired(false);
            if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
          }}
          title="Editar Usuario"
        />
        <div className="flex flex-col gap-4">
          <InputField name="name" value={form.name || ""} onChange={handleInput} required placeholder="Nombre" />
          <InputField name="email" value={form.email || ""} onChange={handleInput} required placeholder="Correo" />
          <RolesDropdown roles={form.roles || []} setRoles={(roles: string[]) => setForm((f: any) => ({ ...f, roles }))} rolesDropdownOpen={rolesDropdownOpen} setRolesDropdownOpen={setRolesDropdownOpen} />
          <div className="relative min-h-[0px]">
            {Array.isArray(form.roles) && form.roles.includes('admin') && !form.emailVerified && (
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
          </div>
          <ErrorMessage message={error} />
          {/* Botón principal dinámico según el estado de verificación y rol */}
          {Array.isArray(form.roles) && form.roles.includes('admin') && !form.emailVerified ? null : (
            <SubmitCancelButtons
              onCancel={() => {
                onClose();
                setForm({ ...user });
                setAdminVerificationSent(false);
                setAdminVerificationError("");
                setAdminVerificationExpired(false);
                if (adminCodeTimerRef.current) clearTimeout(adminCodeTimerRef.current);
              }}
              saving={saving}
              disabled={
                saving ||
                !form.name?.trim() ||
                !form.email?.trim() ||
                !form.roles?.length
              }
              submitLabel={"Guardar Cambios"}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default EditUserModal;
