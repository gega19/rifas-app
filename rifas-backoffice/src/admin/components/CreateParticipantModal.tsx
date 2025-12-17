import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

interface FormData {
  name: string;
  email: string;
  phone: string;
  cedula: string;
  ticketCount: number;
  referenceId?: string;
}

export function CreateParticipantModal({ 
  open, 
  onClose, 
  onSuccess 
}: CreateParticipantModalProps) {
  const [loading, setLoading] = useState(false);
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    watch
  } = useForm<FormData>({
    defaultValues: {
      ticketCount: 5,
      referenceId: '',
    }
  });

  const referenceId = watch('referenceId');

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      console.log('Enviando datos del participante:', {
        name: data.name.trim(),
        email: data.email.trim(),
        ticketCount: data.ticketCount || 5,
        hasReference: !!data.referenceId,
      });

      const result = await createParticipant({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        cedula: data.cedula.trim(),
        ticketCount: data.ticketCount || 5,
        referenceId: data.referenceId && data.referenceId.trim() ? data.referenceId.trim() : null,
      });
      
      console.log('Participante creado exitosamente:', result);
      toast.success('Participante creado exitosamente');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al crear participante:', error);
      const errorMessage = error?.message || error?.error || 'Error al crear participante';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  {...register('name', { 
                    required: 'El nombre es requerido',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                  })}
                  placeholder="Juan Pérez"
                  disabled={loading}
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  placeholder="juan@example.com"
                  disabled={loading}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  {...register('phone', { 
                    required: 'El teléfono es requerido',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Teléfono inválido'
                    }
                  })}
                  placeholder="+58 412 1234567"
                  disabled={loading}
                  className="mt-1"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cedula">Cédula *</Label>
                <Input
                  id="cedula"
                  {...register('cedula', { 
                    required: 'La cédula es requerida',
                    pattern: {
                      value: /^[0-9VEve-]+$/,
                      message: 'Cédula inválida'
                    }
                  })}
                  placeholder="12345678 o V-12345678"
                  disabled={loading}
                  className="mt-1"
                />
                {errors.cedula && (
                  <p className="text-sm text-red-500 mt-1">{errors.cedula.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ticketCount">Cantidad de Tickets *</Label>
                <Input
                  id="ticketCount"
                  type="number"
                  min="1"
                  {...register('ticketCount', { 
                    required: 'La cantidad es requerida',
                    min: { value: 1, message: 'Mínimo 1 ticket' },
                    max: { value: 100, message: 'Máximo 100 tickets' },
                    valueAsNumber: true
                  })}
                  disabled={loading}
                  className="mt-1"
                />
                {errors.ticketCount && (
                  <p className="text-sm text-red-500 mt-1">{errors.ticketCount.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="referenceId">Referencia (Opcional)</Label>
                <Input
                  id="referenceId"
                  {...register('referenceId', {
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Debe ser un código de 6 dígitos'
                    }
                  })}
                  placeholder="123456 (opcional)"
                  maxLength={6}
                  disabled={loading}
                  className="mt-1"
                />
                {errors.referenceId && (
                  <p className="text-sm text-red-500 mt-1">{errors.referenceId.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {referenceId 
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
