import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Check, X } from 'lucide-react';
import type { Reference } from '../services/referenceService';

interface ReferenceTableProps {
  references: Reference[];
  loading: boolean;
  onEdit: (reference: Reference) => void;
  onDelete: (id: string) => void;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function ReferenceTable({
  references,
  loading,
  onEdit,
  onDelete,
  page,
  total,
  limit,
  onPageChange,
}: ReferenceTableProps) {
  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <Card className="p-8 bg-white border-0 shadow-lg">
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
          </motion.div>
        </div>
      </Card>
    );
  }

  if (references.length === 0) {
    return (
      <Card className="p-8 bg-white border-0 shadow-lg text-center">
        <p className="text-gray-500">No hay referencias disponibles</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Referencia</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tickets</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha Uso</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Creada</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {references.map((ref, index) => (
              <motion.tr
                key={ref.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="font-mono text-lg font-semibold">{ref.reference}</span>
                </td>
                <td className="py-3 px-4">{ref.ticketCount}</td>
                <td className="py-3 px-4">
                  {ref.used ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-sm">
                      <X className="w-3 h-3" />
                      Usada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                      <Check className="w-3 h-3" />
                      Disponible
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {ref.usedAt ? new Date(ref.usedAt).toLocaleDateString('es-VE') : '-'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(ref.createdAt).toLocaleDateString('es-VE')}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(ref)}
                      disabled={ref.used}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(ref.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="px-4 py-2 text-sm">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}




