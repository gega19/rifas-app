import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Reference } from '../services/referenceService';

interface ReferenceFormProps {
  reference?: Reference;
  onClose: () => void;
  onSubmit: (data: { reference: string; ticketCount: number }) => void;
}

export function ReferenceForm({ reference, onClose, onSubmit }: ReferenceFormProps) {
  const [formData, setFormData] = useState({
    reference: reference?.reference || '',
    ticketCount: reference?.ticketCount || 5,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.reference || formData.reference.length !== 6 || !/^\d{6}$/.test(formData.reference)) {
      setError('La referencia debe tener exactamente 6 dígitos');
      return;
    }

    if (formData.ticketCount < 1 || formData.ticketCount > 20) {
      setError('El número de tickets debe estar entre 1 y 20');
      return;
    }

    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {reference ? 'Editar Referencia' : 'Crear Referencia'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reference">Número de Referencia</Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="000000"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value.slice(0, 6) })}
                  maxLength={6}
                  disabled={!!reference}
                  className="mt-1 text-center text-xl tracking-widest"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ticketCount">Cantidad de Tickets</Label>
                <Input
                  id="ticketCount"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.ticketCount}
                  onChange={(e) => setFormData({ ...formData, ticketCount: parseInt(e.target.value) || 5 })}
                  className="mt-1"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {reference ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}




