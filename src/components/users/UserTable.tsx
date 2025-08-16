import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getRoleLabel,
  getRoleBadgeClasses,
  getRoleDotColor,
} from '@/lib/roles';

interface UserTableProps {
  users: any[];
  currentUser: any;
  onEdit: (user: any) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUser,
  onEdit,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRolesForUser, setShowRolesForUser] = useState<string | null>(null);
  const [rolesPanelPos, setRolesPanelPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const usersPerPage = 10;
  const rolesPanelRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };
  const scheduleHide = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = window.setTimeout(() => {
      setShowRolesForUser(null);
    }, 180);
  };

  // Cerrar panel al presionar ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowRolesForUser(null);
    };
    if (showRolesForUser) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showRolesForUser]);

  // Filtrar usuarios por búsqueda
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    return users.filter(
      user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Cambiar página
  const goToPage = (page: number) => {
    setCurrentPage(page);
    setShowRolesForUser(null); // Cerrar panel de roles al cambiar página
  };

  // Abrir panel y guardar posición cerca del botón (hover)
  const openRolesPanel = (
    userId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    clearHoverTimeout();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setRolesPanelPos({
      x: Math.round(rect.left),
      y: Math.round(rect.bottom + 8),
    });
    setShowRolesForUser(userId);
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800/50 via-gray-800/60 to-gray-900/50 rounded-2xl border border-gray-700/40 overflow-hidden backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Barra de búsqueda */}
      <div className="p-4 sm:p-6 border-b border-gray-700/40 bg-gradient-to-r from-gray-800/80 to-gray-700/80">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Resetear a primera página al buscar
              }}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-700/50 border border-gray-600/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200 text-sm sm:text-base"
            />
          </div>
          <div className="text-sm text-gray-400 text-center sm:text-left whitespace-nowrap">
            {filteredUsers.length} de {users.length} usuarios
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700/60">
          <thead className="bg-gradient-to-r from-gray-900/90 to-gray-800/90">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Nombre
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Correo
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Rol
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
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
                  Estado
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Verificación
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700/60">
            {currentUsers.map((user, index) => {
              const isCurrentUser = !!(
                currentUser && user.email === currentUser.email
              );
              return (
                <motion.tr
                  key={user._id}
                  className={`${isCurrentUser ? 'opacity-60 bg-gray-900/50' : 'hover:bg-gray-700/30'} transition-all duration-200 relative`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-base font-semibold text-white">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-base text-gray-200 font-medium">
                      {user.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap min-w-[180px]">
                    <div className="flex items-center gap-2">
                      {/* Mostrar solo el primer rol */}
                      {user.roles &&
                        user.roles.length > 0 &&
                        (() => {
                          const firstRole = user.roles[0];
                          const roleName = getRoleLabel(firstRole);
                          const roleClasses = getRoleBadgeClasses(firstRole);
                          return (
                            <span
                              className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg shadow transition-all duration-200 ${roleClasses}`}
                            >
                              {roleName}
                            </span>
                          );
                        })()}
                      {/* Indicador +N (hover abre el panel) */}
                      {user.roles && user.roles.length > 1 && (
                        <button
                          className="group relative"
                          onMouseEnter={e => openRolesPanel(user._id, e)}
                          onMouseLeave={scheduleHide}
                        >
                          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-gray-500/20 text-gray-300 border border-gray-400/40 group-hover:bg-gray-500/30 group-hover:border-gray-300/50 transition-all duration-200 cursor-default">
                            +{user.roles.length - 1}
                          </span>

                          {/* Tooltip con los roles restantes */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900/95 text-white text-sm rounded-lg shadow-2xl border border-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            <div className="text-xs text-gray-300 mb-1 font-medium">
                              Roles adicionales
                            </div>
                            <div className="flex flex-col gap-1.5 items-start">
                              {user.roles
                                .slice(1)
                                .map((role: string, idx: number) => {
                                  const roleName = getRoleLabel(role);
                                  return (
                                    <div
                                      key={idx}
                                      className="inline-flex items-center gap-2"
                                    >
                                      <span
                                        className={`w-[10px] h-[10px] rounded-full ${getRoleDotColor(role)}`}
                                      ></span>
                                      <span className="text-sm text-gray-200">
                                        {roleName}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
                          </div>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-500/20 text-green-300 border border-green-400/40'
                          : 'bg-red-500/20 text-red-300 border border-red-400/40'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          user.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      ></span>
                      {user.isActive ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                        user.emailVerified
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/40'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          user.emailVerified ? 'bg-blue-400' : 'bg-yellow-400'
                        }`}
                      ></span>
                      {user.emailVerified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isCurrentUser ? (
                      <button
                        disabled
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-gray-400 bg-gray-600/50 cursor-not-allowed transition-all duration-200 shadow-lg"
                        title="No puedes editar tu propio usuario"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Editar
                      </button>
                    ) : (
                      <button
                        onClick={() => onEdit(user)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Editar
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-t border-gray-700/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400 text-center sm:text-left">
              Mostrando {startIndex + 1} a{' '}
              {Math.min(endIndex, filteredUsers.length)} de{' '}
              {filteredUsers.length} usuarios
            </div>

            <div className="flex items-center gap-2">
              {/* Botón Anterior */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPage === 1
                    ? 'text-gray-500 cursor-not-allowed bg-gray-700/30 border border-gray-600/30'
                    : 'text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 border border-gray-500/40 hover:border-gray-400/50'
                }`}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">Anterior</span>
              </button>

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => {
                    // Mostrar solo algunas páginas para no saturar
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                            page === currentPage
                              ? 'text-white bg-gradient-to-r from-orange-500 to-red-600 border border-orange-400/50 shadow-lg'
                              : 'text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/40 hover:border-gray-500/50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="text-gray-500 px-1 sm:px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              {/* Botón Siguiente */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'text-gray-500 cursor-not-allowed bg-gray-700/30 border border-gray-600/30'
                    : 'text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 border border-gray-500/40 hover:border-gray-400/50'
                }`}
              >
                <span className="hidden sm:inline">Siguiente</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay fijo para el panel de roles (hover). No afecta layout */}
      <div className="fixed inset-0 z-[1000] pointer-events-none">
        <AnimatePresence>
          {showRolesForUser && rolesPanelPos && (
            <motion.div
              ref={rolesPanelRef}
              onMouseEnter={clearHoverTimeout}
              onMouseLeave={scheduleHide}
              initial={{ opacity: 0, scale: 0.98, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute pointer-events-auto bg-gradient-to-br from-gray-800/95 via-gray-800/98 to-gray-900/95 backdrop-blur-sm border border-gray-600/50 rounded-xl shadow-2xl p-4 min-w-[280px]"
              style={{ left: rolesPanelPos.x, top: rolesPanelPos.y }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white">
                  Roles del Usuario
                </h4>
                <span className="text-[10px] text-gray-400">
                  hover para mantener
                </span>
              </div>
              {(() => {
                const user = users.find(u => u._id === showRolesForUser);
                if (!user) return null;
                return (
                  <div className="space-y-2">
                    {user.roles.map((role: string, index: number) => {
                      const roleName = getRoleLabel(role);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/30 border border-gray-600/30"
                        >
                          <div
                            className={`${getRoleDotColor(role)} w-3 h-3 rounded-full`}
                          ></div>
                          <span className="text-sm font-medium text-gray-200">
                            {roleName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default UserTable;
