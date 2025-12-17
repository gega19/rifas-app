import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createParticipant, type CreateParticipantRequest } from '../services/participantService';

interface CreateParticipantModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateParticipantModal({ 
  open, 
  onClose, 
  onSuccess 
}: CreateParticipantModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cedula: '',
    ticketCount: 5,
    referenceId: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        cedula: '',
        ticketCount: 5,
        referenceId: '',
      });
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name || formData.name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      setError('Email inválido');
      return;
    }

    if (!formData.phone || !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      setError('Teléfono inválido');
      return;
    }

    if (!formData.cedula || !/^[0-9VEve-]+$/.test(formData.cedula)) {
      setError('Cédula inválida');
      return;
    }

    if (!formData.ticketCount || formData.ticketCount < 1) {
      setError('La cantidad de tickets debe ser mayor a 0');
      return;
    }

    if (formData.referenceId && (!/^\d{6}$/.test(formData.referenceId))) {
      setError('La referencia debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const result = await createParticipant({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        cedula: formData.cedula.trim(),
        ticketCount: formData.ticketCount,
        referenceId: formData.referenceId && formData.referenceId.trim() ? formData.referenceId.trim() : null,
      });
      
      toast.success('Participante creado exitosamente');
      setFormData({
        name: '',
        email: '',
        phone: '',
        cedula: '',
        ticketCount: 5,
        referenceId: '',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Error al crear participante';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Crear Participante</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Completa el formulario para crear un nuevo participante y generar tickets.
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                  disabled={loading}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@example.com"
                  disabled={loading}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+58 412 1234567"
                  disabled={loading}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cedula">Cédula *</Label>
                <Input
                  id="cedula"
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  placeholder="12345678 o V-12345678"
                  disabled={loading}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ticketCount">Cantidad de Tickets *</Label>
                <Input
                  id="ticketCount"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.ticketCount}
                  onChange={(e) => setFormData({ ...formData, ticketCount: parseInt(e.target.value) || 5 })}
                  disabled={loading}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="referenceId">Referencia (Opcional)</Label>
                <Input
                  id="referenceId"
                  type="text"
                  value={formData.referenceId}
                  onChange={(e) => setFormData({ ...formData, referenceId: e.target.value.slice(0, 6) })}
                  placeholder="123456 (opcional)"
                  maxLength={6}
                  disabled={loading}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.referenceId 
                    ? 'Si se proporciona, la referencia será marcada como usada'
                    : 'Dejar vacío para crear sin referencia (tickets regalados)'}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creando...' : 'Crear Participante'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
