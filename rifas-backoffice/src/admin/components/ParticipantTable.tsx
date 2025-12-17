import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { Participant } from '../services/participantService';

interface ParticipantTableProps {
  participants: Participant[];
  loading: boolean;
  onViewDetail: (id: string) => void;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function ParticipantTable({
  participants,
  loading,
  onViewDetail,
  page,
  total,
  limit,
  onPageChange,
}: ParticipantTableProps) {
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

  if (participants.length === 0) {
    return (
      <Card className="p-8 bg-white border-0 shadow-lg text-center">
        <p className="text-gray-500">No hay participantes registrados</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Cédula</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Referencia</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tickets</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => (
              <motion.tr
                key={participant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 font-medium">{participant.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{participant.email}</td>
                <td className="py-3 px-4 font-mono text-sm">{participant.cedula}</td>
                <td className="py-3 px-4">
                  {participant.referenceId ? (
                    <span className="font-mono font-semibold">{participant.referenceId}</span>
                  ) : (
                    <span className="text-gray-400 italic text-sm">Sin referencia</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                    {participant.tickets.length}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(participant.generatedAt).toLocaleDateString('es-VE')}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail(participant.id)}
                    >
                      <Eye className="w-4 h-4" />
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




