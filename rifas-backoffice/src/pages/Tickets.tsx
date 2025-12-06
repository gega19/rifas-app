import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, RefreshCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  getTickets,
  getTicketStats,
  searchTicket,
  getTicketDistribution,
  type Ticket,
} from '../services/ticketService';
import { TicketTable } from '../components/TicketTable';
import { TicketStats as TicketStatsComponent } from '../components/TicketStats';
import { TicketDistributionChart } from '../components/TicketDistributionChart';
import type { TicketStats as TicketStatsType } from '@/types';

export function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStatsType | null>(null);
  const [distribution, setDistribution] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [search, setSearch] = useState('');
  const [filterUsed, setFilterUsed] = useState<boolean | undefined>(undefined);
  const [searchResult, setSearchResult] = useState<Ticket | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsData, statsData, distributionData] = await Promise.all([
        getTickets(page, limit, {
          used: filterUsed,
          search: search || undefined,
        }),
        getTicketStats(),
        getTicketDistribution(),
      ]);
      setTickets(ticketsData.tickets);
      setTotal(ticketsData.total);
      setStats(statsData);
      setDistribution(distributionData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, filterUsed]);

  const handleSearch = async () => {
    if (!search || search.length !== 4) {
      setError('Ingresa un número de ticket de 4 dígitos');
      return;
    }

    try {
      const result = await searchTicket(search);
      setSearchResult(result);
      if (!result) {
        setError('Ticket no encontrado');
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gestión de Tickets
          </h1>
          <p className="text-gray-600 mt-1">Administra todos los tickets generados</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      {stats && <TicketStatsComponent stats={stats} />}

      {/* Distribution Chart */}
      {distribution.length > 0 && (
        <TicketDistributionChart data={distribution} />
      )}

      {/* Search */}
      <Card className="p-4 bg-white border-0 shadow-lg">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar ticket por número (0000-9999)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value.slice(0, 4));
                  setSearchResult(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 font-mono"
                maxLength={4}
              />
            </div>
          </div>
          <Button onClick={handleSearch} size="sm">
            Buscar
          </Button>
        </div>
      </Card>

      {/* Search Result */}
      {searchResult && (
        <Card className="p-4 bg-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ticket encontrado:</p>
              <p className="text-2xl font-mono font-bold">{searchResult.number}</p>
              <p className="text-sm mt-2">
                Estado:{' '}
                {searchResult.used ? (
                  <span className="text-red-600 font-semibold">Usado</span>
                ) : (
                  <span className="text-green-600 font-semibold">Disponible</span>
                )}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSearchResult(null)}>
              Cerrar
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 bg-white border-0 shadow-lg">
        <div className="flex gap-2">
          <Button
            variant={filterUsed === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUsed(undefined)}
          >
            Todos
          </Button>
          <Button
            variant={filterUsed === false ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUsed(false)}
          >
            Disponibles
          </Button>
          <Button
            variant={filterUsed === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUsed(true)}
          >
            Usados
          </Button>
        </div>
      </Card>

      {error && !searchResult && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <TicketTable
        tickets={tickets}
        loading={loading}
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  );
}
