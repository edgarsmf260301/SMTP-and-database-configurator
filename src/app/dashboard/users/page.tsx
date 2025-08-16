'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LoadingPage from '@/components/ui/LoadingPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PanelLayout from '@/components/layout/PanelLayout';
import { useAuth } from '@/hooks/useAuth';
import UserRegisterModal from '@/components/users/UserRegisterModal';
import UserTable from '@/components/users/UserTable';
import EditUserModal from '@/components/users/EditUserModal';

export default function UsersPage() {
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
      const res = await fetch('/api/users');
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
        <motion.div
          className="w-full max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Section */}
          <motion.div
            className="bg-gradient-to-br from-gray-800/80 via-gray-800/90 to-gray-900/80 rounded-2xl shadow-2xl border border-gray-700/40 p-6 md:p-8 mb-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg border border-orange-400/30">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                    <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      Gestión de Usuarios
                    </span>
                  </h1>
                  <p className="text-gray-300 text-sm md:text-base mt-1">
                    Administra los usuarios del sistema
                  </p>
                </div>
              </motion.div>

              <motion.button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:ring-offset-2 focus:ring-offset-gray-800 text-base md:text-lg hover:scale-105 active:scale-95"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Registrar Usuario
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            className="bg-gradient-to-br from-gray-800/80 via-gray-800/90 to-gray-900/80 rounded-2xl shadow-2xl border border-gray-700/40 p-6 md:p-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isLoading ? (
              <LoadingPage
                title="Cargando usuarios..."
                subtitle="Obteniendo información del sistema"
              />
            ) : (
              <div className="space-y-6">
                {/* Stats Cards */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="bg-gradient-to-br from-blue-800/50 to-blue-900/50 rounded-xl p-4 border border-blue-600/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30">
                        <svg
                          className="w-5 h-5 text-blue-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm font-medium">
                          Total Usuarios
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {users.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 rounded-xl p-4 border border-green-600/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-600/20 border border-green-500/30">
                        <svg
                          className="w-5 h-5 text-green-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-green-200 text-sm font-medium">
                          Usuarios Activos
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {users.filter(u => u.isActive).length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-800/50 to-orange-900/50 rounded-xl p-4 border border-orange-600/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-600/20 border border-orange-500/30">
                        <svg
                          className="w-5 h-5 text-orange-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-orange-200 text-sm font-medium">
                          Administradores
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {users.filter(u => u.roles?.includes('admin')).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* User Table */}
                <UserTable
                  users={users}
                  currentUser={currentUser}
                  onEdit={user => {
                    setEditUser(user);
                    setShowEditModal(true);
                  }}
                />
              </div>
            )}
          </motion.div>

          {/* Modals */}
          <UserRegisterModal
            show={showForm}
            onClose={() => setShowForm(false)}
            onUserRegistered={fetchUsers}
            users={users}
          />
          <EditUserModal
            key={editUser?._id || 'none'}
            show={showEditModal}
            user={editUser}
            onClose={() => {
              setShowEditModal(false);
              setEditUser(null);
            }}
            onUserUpdated={fetchUsers}
          />
        </motion.div>
      </PanelLayout>
    </ProtectedRoute>
  );
}
