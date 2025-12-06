import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Ticket, FileText, TrendingUp, RefreshCw, DollarSign, Trash2 } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { StatsChart } from '../components/StatsChart';
import { RecentActivity } from '../components/RecentActivity';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getDashboardStats, getRecentActivity } from '../services/analyticsService';
import { resetRaffle } from '../services/resetService';
import { toast } from 'sonner';
import type { DashboardStats, RecentActivity as RecentActivityType } from '@/types';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

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

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetRaffle();
      toast.success('Rifa reiniciada exitosamente');
      // Cerrar el diálogo
      setShowResetDialog(false);
      // Recargar datos después del reset
      await loadData();
      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('raffle-reset'));
    } catch (err: any) {
      toast.error(err.message || 'Error al reiniciar la rifa');
      console.error('Error resetting raffle:', err);
    } finally {
      setResetting(false);
    }
  };

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

  // Revenue chart data
  const revenueData = [
    { name: 'Hoy', ingresos: stats.revenueToday || 0 },
    { name: 'Esta Semana', ingresos: stats.revenueThisWeek || 0 },
    { name: 'Este Mes', ingresos: stats.revenueThisMonth || 0 },
    { name: 'Total', ingresos: stats.totalRevenue || 0 },
  ];

  const revenueDistribution = [
    { name: 'Recaudado', value: stats.totalRevenue || 0 },
    { name: 'Pendiente', value: (stats.availableValue || 0) - (stats.totalRevenue || 0) },
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
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={resetting}>
                <Trash2 className="w-4 h-4 mr-2" />
                Reiniciar Rifa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará <strong>TODOS</strong> los datos de la rifa:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Todos los participantes</li>
                    <li>Todos los tickets generados</li>
                    <li>Se resetearán todas las referencias (marcadas como no usadas)</li>
                  </ul>
                  <p className="mt-3 font-semibold text-red-600">
                    Esta acción NO se puede deshacer.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={resetting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleReset();
                  }}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={resetting}
                >
                  {resetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Reiniciando...
                    </>
                  ) : (
                    'Sí, Reiniciar Rifa'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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

      {/* Revenue Metrics Grid - Dinero Generado */}
      {stats.totalRevenue !== undefined && stats.totalRevenue > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">💰 Ingresos Generados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Ingresos Totales"
              value={`$${stats.totalRevenue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              description="Dinero recaudado total"
              gradient="from-green-600 to-emerald-600"
            />
            <MetricCard
              title="Ingresos Hoy"
              value={`$${stats.revenueToday?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
              icon={DollarSign}
              description="Dinero recaudado hoy"
              gradient="from-blue-500 to-cyan-500"
            />
            <MetricCard
              title="Ingresos Esta Semana"
              value={`$${stats.revenueThisWeek?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
              icon={DollarSign}
              description="Dinero recaudado esta semana"
              gradient="from-purple-500 to-pink-500"
            />
            <MetricCard
              title="Ingresos Este Mes"
              value={`$${stats.revenueThisMonth?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
              icon={DollarSign}
              description="Dinero recaudado este mes"
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      )}

      {/* Value Metrics Grid */}
      {stats.totalValue !== undefined && stats.totalValue > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">📊 Valor de Tickets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Valor Total"
              value={`$${stats.totalValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              description="Valor total de todos los tickets"
              gradient="from-yellow-500 to-orange-500"
            />
            <MetricCard
              title="Valor Usado"
              value={`$${stats.usedValue?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
              icon={DollarSign}
              description="Valor de tickets utilizados"
              gradient="from-green-500 to-teal-500"
            />
            <MetricCard
              title="Valor Disponible"
              value={`$${stats.availableValue?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
              icon={DollarSign}
              description="Valor de tickets disponibles"
              gradient="from-blue-500 to-cyan-500"
            />
            <MetricCard
              title="Valor Promedio"
              value={`$${stats.averageTicketValue?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
              icon={TrendingUp}
              description="Valor promedio por ticket"
              gradient="from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      )}

      {/* Projected Revenue */}
      {stats.projectedRevenue !== undefined && stats.projectedRevenue > 0 && stats.totalRevenue !== undefined && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Proyección de Ingresos</h3>
              <p className="text-sm text-gray-600 mb-4">
                Basado en la tasa de conversión actual ({stats.conversionRate.toFixed(1)}%)
              </p>
              <div className="flex items-baseline gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ingresos Actuales</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${stats.totalRevenue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-gray-400">→</div>
                <div>
                  <p className="text-sm text-gray-600">Proyección Total</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${stats.projectedRevenue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <TrendingUp className="w-16 h-16 text-green-500 opacity-50" />
          </div>
        </div>
      )}

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

      {/* Revenue Charts */}
      {stats.totalRevenue !== undefined && stats.totalRevenue > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatsChart
            data={revenueData}
            type="bar"
            title="Ingresos por Período"
            dataKey="ingresos"
            color="#10b981"
          />
          <StatsChart
            data={revenueDistribution}
            type="pie"
            title="Distribución de Ingresos"
            dataKey="value"
          />
        </div>
      )}

      {/* Recent Activity */}
      <RecentActivity activities={activities} />
    </div>
  );
}
