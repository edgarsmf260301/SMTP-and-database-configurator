"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingPage from "@/components/LoadingPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import PanelLayout from "@/components/PanelLayout";
import { useAuth } from "@/hooks/useAuth";
import UserRegisterModal from "@/components/usuarios/UserRegisterModal";
import UserTable from "@/components/usuarios/UserTable";
import EditUserModal from "@/components/usuarios/EditUserModal";

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
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
            <UserRegisterModal show={showForm} onClose={() => setShowForm(false)} onUserRegistered={fetchUsers} users={users} />
            {isLoading ? <LoadingPage title="Cargando usuarios..." /> : (
              <UserTable users={users} currentUser={currentUser} onEdit={user => { setEditUser(user); setShowEditModal(true); }} />
            )}
            <EditUserModal
              key={editUser?._id || 'none'}
              show={showEditModal}
              user={editUser}
              onClose={() => { setShowEditModal(false); setEditUser(null); }}
              onUserUpdated={fetchUsers}
            />
          </motion.div>
        </div>
      </PanelLayout>
    </ProtectedRoute>
  );
}
