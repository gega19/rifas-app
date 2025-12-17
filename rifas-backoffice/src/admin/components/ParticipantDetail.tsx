import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ticket, User, Mail, Phone, CreditCard, FileText, Calendar, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Participant } from '../services/participantService';
import { updateParticipantTickets } from '../services/participantService';

interface ParticipantDetailProps {
  participant: Participant;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ParticipantDetail({ participant, onClose, onUpdate }: ParticipantDetailProps) {
  const [loading, setLoading] = useState(false);
  const [showAddTickets, setShowAddTickets] = useState(false);
  const [ticketsToAdd, setTicketsToAdd] = useState(1);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  const handleAddTickets = async () => {
    if (ticketsToAdd < 1) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      await updateParticipantTickets(participant.id, { addTickets: ticketsToAdd });
      toast.success(`${ticketsToAdd} ticket(s) agregado(s) exitosamente`);
      setShowAddTickets(false);
      setTicketsToAdd(1);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTickets = async () => {
    if (selectedTickets.length === 0) {
      toast.error('Selecciona al menos un ticket para quitar');
      return;
    }

    if (!confirm(`¿Estás seguro de quitar ${selectedTickets.length} ticket(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      await updateParticipantTickets(participant.id, { removeTickets: selectedTickets });
      toast.success(`${selectedTickets.length} ticket(s) eliminado(s) exitosamente`);
      setSelectedTickets([]);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al quitar tickets');
    } finally {
      setLoading(false);
    }
  };
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Detalles del Participante</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información Personal */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Nombre Completo</p>
                    <p className="font-semibold">{participant.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </p>
                    <p className="font-semibold break-all">{participant.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </p>
                    <p className="font-semibold">{participant.phone}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      Cédula
                    </p>
                    <p className="font-semibold font-mono">{participant.cedula}</p>
                  </div>
                </div>
              </div>

              {/* Información de Referencia */}
              {participant.referenceId && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" />
                    Información de Referencia
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Número de Referencia</p>
                    <p className="font-mono text-2xl font-bold text-purple-600">{participant.referenceId}</p>
                  </div>
                </div>
              )}
              {!participant.referenceId && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-600" />
                    Información de Referencia
                  </h3>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 mb-1">Tipo de Registro</p>
                    <p className="font-semibold text-yellow-900">Sin referencia (Tickets regalados)</p>
                  </div>
                </div>
              )}

              {/* Tickets */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-pink-600" />
                    Tickets Asignados ({participant.tickets.length})
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddTickets(!showAddTickets)}
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                    {selectedTickets.length > 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleRemoveTickets}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Quitar ({selectedTickets.length})
                      </Button>
                    )}
                  </div>
                </div>

                {showAddTickets && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label htmlFor="ticketsToAdd">Cantidad de tickets a agregar</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="ticketsToAdd"
                        type="number"
                        min="1"
                        max="100"
                        value={ticketsToAdd}
                        onChange={(e) => setTicketsToAdd(parseInt(e.target.value) || 1)}
                        disabled={loading}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddTickets}
                        disabled={loading || ticketsToAdd < 1}
                        size="sm"
                      >
                        {loading ? 'Agregando...' : 'Agregar'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddTickets(false);
                          setTicketsToAdd(1);
                        }}
                        disabled={loading}
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-5 gap-3">
                  {participant.tickets.map((ticket, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg text-center border-2 cursor-pointer transition-all ${
                        selectedTickets.includes(ticket)
                          ? 'border-red-500 bg-red-100'
                          : 'border-purple-300 hover:border-purple-500'
                      }`}
                      onClick={() => {
                        if (selectedTickets.includes(ticket)) {
                          setSelectedTickets(selectedTickets.filter(t => t !== ticket));
                        } else {
                          setSelectedTickets([...selectedTickets, ticket]);
                        }
                      }}
                    >
                      <p className="font-mono text-lg font-bold text-purple-900">{ticket}</p>
                      {selectedTickets.includes(ticket) && (
                        <p className="text-xs text-red-600 mt-1">Seleccionado</p>
                      )}
                    </motion.div>
                  ))}
                </div>
                {selectedTickets.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedTickets.length} ticket(s) seleccionado(s). Haz clic en "Quitar" para eliminarlos.
                  </p>
                )}
              </div>

              {/* Fechas */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Fechas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Fecha de Registro</p>
                    <p className="font-semibold">
                      {new Date(participant.generatedAt).toLocaleString('es-VE')}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Creado</p>
                    <p className="font-semibold">
                      {new Date(participant.createdAt).toLocaleString('es-VE')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={onClose}>Cerrar</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}




