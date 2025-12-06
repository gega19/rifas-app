import { motion, AnimatePresence } from 'motion/react';
import { X, Ticket, User, Mail, Phone, CreditCard, FileText, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Participant } from '../services/participantService';

interface ParticipantDetailProps {
  participant: Participant;
  onClose: () => void;
}

export function ParticipantDetail({ participant, onClose }: ParticipantDetailProps) {
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

              {/* Tickets */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-pink-600" />
                  Tickets Asignados ({participant.tickets.length})
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {participant.tickets.map((ticket, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg text-center border-2 border-purple-300"
                    >
                      <p className="font-mono text-lg font-bold text-purple-900">{ticket}</p>
                    </motion.div>
                  ))}
                </div>
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




