import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Download, RefreshCw, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  getParticipants,
  getParticipantById,
  exportParticipants,
  type Participant,
} from '../services/participantService';
import { ParticipantTable } from '../components/ParticipantTable';
import { ParticipantDetail } from '../components/ParticipantDetail';
import { ParticipantFilters } from '../components/ParticipantFilters';
import { CreateParticipantModal } from '../components/CreateParticipantModal';

export function Participants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    referenceId?: string;
  }>({});
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getParticipants(page, limit, {
        search: search || undefined,
        ...filters,
      });
      setParticipants(data.participants);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar participantes');
      console.error('Error loading participants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [page, filters]);

  // Escuchar evento de reset de rifa
  useEffect(() => {
    const handleRaffleReset = () => {
      // Recargar datos cuando se reinicia la rifa
      loadParticipants();
      setPage(1);
      setSearch('');
      setSelectedParticipant(null);
    };

    window.addEventListener('raffle-reset', handleRaffleReset);
    return () => {
      window.removeEventListener('raffle-reset', handleRaffleReset);
    };
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadParticipants();
  };

  const handleViewDetail = async (id: string) => {
    try {
      const participant = await getParticipantById(id);
      setSelectedParticipant(participant);
    } catch (err: any) {
      setError(err.message || 'Error al cargar detalles del participante');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportParticipants(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `participantes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al exportar participantes');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Participantes
          </h1>
          <p className="text-gray-600 mt-1">Lista de todos los participantes registrados</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              console.log('Botón clickeado, estado actual:', createModalOpen);
              setCreateModalOpen(true);
              console.log('Estado después de setState:', true);
            }} 
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Participante
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-0 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email, cédula o referencia..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSearch} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <ParticipantFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => {
              setFilters({});
              setPage(1);
            }}
          />
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <ParticipantTable
        participants={participants}
        loading={loading}
        onViewDetail={handleViewDetail}
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Detail Modal */}
      {selectedParticipant && (
        <ParticipantDetail
          participant={selectedParticipant}
          onClose={() => {
            setSelectedParticipant(null);
          }}
          onUpdate={async () => {
            // Recargar el participante actualizado
            try {
              const updated = await getParticipantById(selectedParticipant.id);
              setSelectedParticipant(updated);
              // También recargar la lista
              loadParticipants();
            } catch (err: any) {
              console.error('Error al recargar participante:', err);
            }
          }}
        />
      )}

      {/* Create Participant Modal */}
      {console.log('Renderizando modal, open:', createModalOpen)}
      <CreateParticipantModal
        open={createModalOpen}
        onClose={() => {
          console.log('Cerrando modal');
          setCreateModalOpen(false);
        }}
        onSuccess={() => {
          loadParticipants();
        }}
      />
    </div>
  );
}
