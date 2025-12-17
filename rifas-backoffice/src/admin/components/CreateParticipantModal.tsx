import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await createParticipant({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        cedula: data.cedula.trim(),
        ticketCount: data.ticketCount || 5,
        referenceId: data.referenceId && data.referenceId.trim() ? data.referenceId.trim() : null,
      });
      
      toast.success('Participante creado exitosamente');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear participante');
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Participante</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear un nuevo participante y generar tickets. 
            Puedes dejar el campo de referencia vacío para crear tickets sin referencia.
          </DialogDescription>
        </DialogHeader>
        
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

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Participante'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

