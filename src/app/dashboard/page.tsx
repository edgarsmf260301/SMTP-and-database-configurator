'use client';

import React, { useState, useEffect } from 'react';
import PanelLayout from '@/components/layout/PanelLayout';
import LoadingPage from '@/components/ui/LoadingPage';
import { motion } from 'framer-motion';

type Order = {
  id: number;
  customer: string;
  total: number;
  status: 'ready' | 'preparing' | 'pending';
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalOrders: 156,
        totalRevenue: 12500.5,
        averageOrderValue: 80.13,
      });
      setRecentOrders([
        { id: 1, customer: 'Juan Pérez', total: 45.0, status: 'ready' },
        { id: 2, customer: 'María García', total: 32.5, status: 'preparing' },
        { id: 3, customer: 'Carlos López', total: 78.25, status: 'pending' },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <LoadingPage
        title="Cargando dashboard..."
        subtitle="Preparando tu panel de administración"
      />
    );
  }

  return (
    <PanelLayout>
      {/* Espacio superior para mejor organización */}
      <div className="h-5"></div>

      {/* Cards de estadísticas */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Card 1 - Total de Pedidos */}
        <motion.div
          className="bg-gradient-to-br from-blue-800/80 via-blue-700/90 to-blue-900/80 rounded-2xl shadow-2xl p-6 flex items-center gap-4 border border-blue-600/30 backdrop-blur-sm hover:shadow-blue-500/25 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-3 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-blue-200">
              Total de Pedidos
            </p>
            <p className="text-3xl font-bold text-white drop-shadow">
              {stats.totalOrders}
            </p>
          </div>
        </motion.div>

        {/* Card 2 - Ingresos Totales */}
        <motion.div
          className="bg-gradient-to-br from-green-800/80 via-green-700/90 to-green-900/80 rounded-2xl shadow-2xl p-6 flex items-center gap-4 border border-green-600/30 backdrop-blur-sm hover:shadow-green-500/25 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-3 rounded-full bg-green-600/20 text-green-300 border border-green-500/30">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-green-200">
              Ingresos Totales
            </p>
            <p className="text-3xl font-bold text-white drop-shadow">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>
        </motion.div>

        {/* Card 3 - Promedio por Pedido */}
        <motion.div
          className="bg-gradient-to-br from-yellow-700/80 via-yellow-600/90 to-yellow-800/80 rounded-2xl shadow-2xl p-6 flex items-center gap-4 border border-yellow-500/30 backdrop-blur-sm hover:shadow-yellow-500/25 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-3 rounded-full bg-yellow-400/20 text-yellow-200 border border-yellow-300/30">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-yellow-100">
              Promedio por Pedido
            </p>
            <p className="text-3xl font-bold text-white drop-shadow">
              ${stats.averageOrderValue.toFixed(2)}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Pedidos Recientes */}
      <motion.div
        className="bg-gradient-to-br from-gray-800/80 via-gray-800/90 to-gray-900/80 rounded-2xl shadow-2xl border border-gray-700/40 overflow-hidden backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="px-6 py-4 border-b border-gray-700/60 flex items-center gap-3 bg-gradient-to-r from-gray-800/90 to-gray-900/90">
          <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
            <svg
              className="w-5 h-5 text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Pedidos Recientes
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700/60">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/50 divide-y divide-gray-700/60">
              {recentOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="hover:bg-gray-700/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-200 font-semibold">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow transition-all duration-300 ${
                        order.status === 'ready'
                          ? 'bg-green-500/20 text-green-300 border border-green-400/40'
                          : order.status === 'preparing'
                            ? 'bg-yellow-400/20 text-yellow-200 border border-yellow-300/40'
                            : 'bg-gray-500/20 text-gray-200 border border-gray-400/40'
                      }`}
                    >
                      {order.status === 'ready'
                        ? 'Listo'
                        : order.status === 'preparing'
                          ? 'Preparando'
                          : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <motion.button
                      className="text-orange-400 hover:text-orange-200 font-semibold transition-colors duration-200 underline underline-offset-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Ver detalles
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </PanelLayout>
  );
}
