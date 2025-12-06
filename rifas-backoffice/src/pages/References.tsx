import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Filter, Download, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  getReferences,
  createReference,
  updateReference,
  deleteReference,
  bulkCreateReferences,
  exportReferences,
  type Reference,
} from '../services/referenceService';
import { ReferenceForm } from '../components/ReferenceForm';
import { ReferenceTable } from '../components/ReferenceTable';
import { BulkCreateModal } from '../components/BulkCreateModal';

export function References() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [filterUsed, setFilterUsed] = useState<boolean | undefined>(undefined);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingReference, setEditingReference] = useState<Reference | null>(null);

  const loadReferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReferences(page, limit, {
        used: filterUsed,
        search: search || undefined,
      });
      setReferences(data.references);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar referencias');
      console.error('Error loading references:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferences();
  }, [page, filterUsed]);

  const handleSearch = () => {
    setPage(1);
    loadReferences();
  };

  const handleCreate = async (data: { reference: string; ticketCount: number }) => {
    try {
      await createReference(data);
      setShowCreateForm(false);
      loadReferences();
    } catch (err: any) {
      setError(err.message || 'Error al crear referencia');
    }
  };

  const handleUpdate = async (id: string, data: { ticketCount?: number; used?: boolean }) => {
    try {
      await updateReference(id, data);
      setEditingReference(null);
      loadReferences();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar referencia');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta referencia?')) {
      return;
    }
    try {
      await deleteReference(id);
      loadReferences();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar referencia');
    }
  };

  const handleBulkCreate = async (references: Array<{ reference: string; ticketCount: number }>) => {
    try {
      const result = await bulkCreateReferences(references);
      setShowBulkModal(false);
      alert(`Se crearon ${result.created} referencias${result.errors.length > 0 ? `. Errores: ${result.errors.join(', ')}` : ''}`);
      loadReferences();
    } catch (err: any) {
      setError(err.message || 'Error al crear referencias');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportReferences({ used: filterUsed });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `referencias-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al exportar referencias');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gestión de Referencias
          </h1>
          <p className="text-gray-600 mt-1">Administra las referencias de pago</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowBulkModal(true)} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Crear Múltiples
          </Button>
          <Button onClick={() => setShowCreateForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Crear Referencia
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-0 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por número de referencia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterUsed === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterUsed(undefined)}
            >
              Todas
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
              Usadas
            </Button>
            <Button onClick={handleSearch} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <ReferenceTable
        references={references}
        loading={loading}
        onEdit={setEditingReference}
        onDelete={handleDelete}
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <ReferenceForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingReference && (
        <ReferenceForm
          reference={editingReference}
          onClose={() => setEditingReference(null)}
          onSubmit={(data) => handleUpdate(editingReference.id, data)}
        />
      )}

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <BulkCreateModal
          onClose={() => setShowBulkModal(false)}
          onSubmit={handleBulkCreate}
        />
      )}
    </div>
  );
}
