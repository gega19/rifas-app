import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Ticket, FileText, TrendingUp, RefreshCw } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { StatsChart } from '../components/StatsChart';
import { RecentActivity } from '../components/RecentActivity';
import { Button } from '@/components/ui/button';
import { getDashboardStats, getRecentActivity } from '../services/analyticsService';
import type { DashboardStats, RecentActivity as RecentActivityType } from '@/types';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardStats, recentActivities] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(10),
      ]);
      setStats(dashboardStats);
      setActivities(recentActivities);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del dashboard');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-purple-600" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <Button onClick={loadData} className="mt-4" variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Prepare chart data
  const participationData = [
    { name: 'Lun', participantes: stats.activeParticipants || 0 },
    { name: 'Mar', participantes: Math.floor((stats.activeParticipants || 0) * 0.8) },
    { name: 'Mié', participantes: Math.floor((stats.activeParticipants || 0) * 0.9) },
    { name: 'Jue', participantes: Math.floor((stats.activeParticipants || 0) * 1.1) },
    { name: 'Vie', participantes: Math.floor((stats.activeParticipants || 0) * 1.2) },
    { name: 'Sáb', participantes: Math.floor((stats.activeParticipants || 0) * 0.7) },
    { name: 'Dom', participantes: stats.activeParticipants || 0 },
  ];

  const ticketDistribution = [
    { name: 'Usados', value: stats.usedTickets },
    { name: 'Disponibles', value: stats.availableTickets },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Resumen general del sistema</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Participantes"
          value={stats.totalParticipants}
          icon={Users}
          description="Participantes registrados"
          gradient="from-cyan-500 to-blue-500"
        />
        <MetricCard
          title="Referencias Usadas"
          value={`${stats.usedReferences} / ${stats.totalReferences}`}
          icon={FileText}
          description={`${stats.conversionRate.toFixed(1)}% de conversión`}
          gradient="from-purple-500 to-pink-500"
        />
        <MetricCard
          title="Tickets Usados"
          value={`${stats.usedTickets} / ${stats.totalTickets}`}
          icon={Ticket}
          description={`${((stats.usedTickets / stats.totalTickets) * 100).toFixed(1)}% utilizado`}
          gradient="from-pink-500 to-red-500"
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          description="Referencias convertidas"
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsChart
          data={participationData}
          type="line"
          title="Participación por Día"
          dataKey="participantes"
          color="#8b5cf6"
        />
        <StatsChart
          data={ticketDistribution}
          type="pie"
          title="Distribución de Tickets"
          dataKey="value"
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={activities} />
    </div>
  );
}
