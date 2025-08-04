// ...existing code (versión limpia y correcta del dashboard, sin duplicados ni 'use client' en medio)...
"use client";

import React, { useState, useEffect } from "react";
import PanelLayout from "@/components/PanelLayout";
import LoadingPage from "@/components/LoadingPage";

type Order = {
  id: number;
  customer: string;
  total: number;
  status: "ready" | "preparing" | "pending";
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
        { id: 1, customer: "Juan Pérez", total: 45.0, status: "ready" },
        { id: 2, customer: "María García", total: 32.5, status: "preparing" },
        { id: 3, customer: "Carlos López", total: 78.25, status: "pending" },
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
      <div className="text-white text-2xl font-bold mb-4">
        Bienvenido al panel de Viticos
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 rounded-2xl shadow-xl p-6 flex items-center gap-4 border border-blue-600/30">
          <div className="p-3 rounded-full bg-blue-600/20 text-blue-300">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
        {/* Card 2 */}
        <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-900 rounded-2xl shadow-xl p-6 flex items-center gap-4 border border-green-600/30">
          <div className="p-3 rounded-full bg-green-600/20 text-green-300">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
        {/* Card 3 */}
        <div className="bg-gradient-to-br from-yellow-700 via-yellow-600 to-yellow-800 rounded-2xl shadow-xl p-6 flex items-center gap-4 border border-yellow-500/30">
          <div className="p-3 rounded-full bg-yellow-400/20 text-yellow-200">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
      </div>
      {/* Pedidos Recientes */}
      <div className="bg-gray-800/80 rounded-2xl shadow-2xl border border-gray-700/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/60 flex items-center gap-2">
          <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7h18M3 12h18M3 17h18"
            />
          </svg>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Pedidos Recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
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
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-200 font-semibold">
                    {order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow transition-all duration-300 ${
                        order.status === "ready"
                          ? "bg-green-500/20 text-green-300 border border-green-400/40"
                          : order.status === "preparing"
                          ? "bg-yellow-400/20 text-yellow-200 border border-yellow-300/40"
                          : "bg-gray-500/20 text-gray-200 border border-gray-400/40"
                      }`}
                    >
                      {order.status === "ready"
                        ? "Listo"
                        : order.status === "preparing"
                        ? "Preparando"
                        : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-orange-400 hover:text-orange-200 font-semibold transition-colors duration-200 underline underline-offset-2">
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PanelLayout>
  );
}