"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingPage from "@/components/LoadingPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import PanelLayout from "@/components/PanelLayout";
import { useAuth } from "@/hooks/useAuth";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "box", label: "Caja" },
  { value: "kitchen", label: "Cocina" },
  { value: "administration", label: "Administración" },
  { value: "Waiter", label: "Mesonero" },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: ROLES[0].value,
    isActive: true,
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
    setIsLoading(false);
  };

  const handleInput = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    // Validar que el nombre y el correo no estén repetidos
    const nameExists = users.some(u => u.name.trim().toLowerCase() === form.name.trim().toLowerCase());
    const emailExists = users.some(u => u.email.trim().toLowerCase() === form.email.trim().toLowerCase());
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
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          isActive: form.isActive,
          password: form.password
        }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Error al registrar usuario");
      setShowForm(false);
      setForm({ name: "", email: "", role: ROLES[0].value, isActive: true, password: "", confirmPassword: "" });
      // Espera a que el usuario se guarde antes de refrescar la tabla
      setTimeout(() => fetchUsers(), 300);
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    await fetch(`/api/users/${userId}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
      credentials: "include"
    });
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, role: string) => {
    await fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
      credentials: "include"
    });
    fetchUsers();
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <PanelLayout>
        <div className="min-h-screen bg-[#101624] flex flex-col items-center py-8 px-2">
          <motion.div className="w-full max-w-5xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/40 p-8 mb-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h1 className="text-3xl font-extrabold text-white drop-shadow flex items-center gap-3 tracking-tight">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5z" />
                  </svg>
                </span>
                Usuarios
              </h1>
              <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-lg">
                Registrar Usuario
              </button>
            </div>
            {showForm && (
              <>
                {/* Overlay modal */}
                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <form
                    onSubmit={handleRegister}
                    className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 sm:p-7 md:p-8 flex flex-col gap-4 border border-gray-700/40 shadow-2xl animate-fade-in"
                    style={{ minWidth: '320px', maxWidth: '95vw' }}
                  >
                    <button type="button" onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl font-bold focus:outline-none">×</button>
                    <h2 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5z" />
                        </svg>
                      </span>
                      Registrar Usuario
                    </h2>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input name="name" value={form.name} onChange={handleInput} required placeholder="Nombre" className="flex-1 px-3 py-2 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500 text-base font-semibold placeholder-gray-400 min-w-0" />
                        <input name="email" value={form.email} onChange={handleInput} required placeholder="Correo" className="flex-1 px-3 py-2 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500 text-base font-semibold placeholder-gray-400 min-w-0" />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select name="role" value={form.role} onChange={handleInput} className="flex-1 px-3 py-2 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500 text-base font-semibold min-w-0">
                          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <input name="password" value={form.password} onChange={handleInput} required placeholder="Contraseña" type="password" className="flex-1 px-3 py-2 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500 text-base font-semibold placeholder-gray-400 min-w-0" />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input name="confirmPassword" value={form.confirmPassword} onChange={handleInput} required placeholder="Confirmar Contraseña" type="password" className="flex-1 px-3 py-2 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500 text-base font-semibold placeholder-gray-400 min-w-0" />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-pressed={form.isActive}
                          onClick={() => setForm({ ...form, isActive: !form.isActive })}
                          className={`relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none border-2 border-gray-700 ${form.isActive ? 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-500' : 'bg-gray-700 border-gray-600'}`}
                        >
                          <span
                            className={`absolute left-1 top-[2.6px] w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${form.isActive ? 'translate-x-5' : ''}`}
                          />
                        </button>
                        <span className={`text-base font-semibold ${form.isActive ? 'text-orange-400' : 'text-gray-400'}`}>{form.isActive ? 'Activo' : 'Deshabilitado'}</span>
                      </div>
                      {error && <div className="text-red-400 text-base font-semibold">{error}</div>}
                      <div className="flex gap-3 mt-2 flex-col sm:flex-row">
                        <button type="submit" disabled={saving} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 disabled:opacity-60 text-lg hover:scale-105 active:scale-95 w-full sm:w-auto">
                          {saving ? "Guardando..." : "Registrar"}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 text-gray-200 px-6 py-2 rounded-xl font-bold shadow transition-all duration-300 text-lg hover:bg-gray-600 w-full sm:w-auto">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </>
            )}
            {isLoading ? <LoadingPage title="Cargando usuarios..." /> : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900/90">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider">Correo</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.map((user) => {
                      const isCurrentUser = !!(currentUser && user.email === currentUser.email);
                      return (
                        <tr key={user._id} className={isCurrentUser ? 'opacity-60 bg-gray-900' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-white">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-orange-200 font-semibold">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select value={user.role} onChange={e => handleRoleChange(user._id, e.target.value)} className="bg-gray-900 text-orange-300 rounded-xl px-4 py-2 border border-gray-700 text-base font-semibold" disabled={isCurrentUser}>
                              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full shadow transition-all duration-300 ${user.isActive ? 'bg-green-500/20 text-green-300 border border-green-400/40' : 'bg-gray-500/20 text-gray-200 border border-gray-400/40'}`}>{user.isActive ? 'Activo' : 'Inactivo'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base flex gap-2">
                            <button onClick={() => handleToggleActive(user._id, !user.isActive)} className={`px-4 py-2 rounded-xl font-bold text-sm ${user.isActive ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-green-700 text-white hover:bg-green-800'} transition-all`} disabled={isCurrentUser}>
                              {user.isActive ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </PanelLayout>
    </ProtectedRoute>
  );
}
