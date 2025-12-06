import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BulkCreateModalProps {
  onClose: () => void;
  onSubmit: (references: Array<{ reference: string; ticketCount: number }>) => void;
}

export function BulkCreateModal({ onClose, onSubmit }: BulkCreateModalProps) {
  const [references, setReferences] = useState<Array<{ reference: string; ticketCount: number }>>([
    { reference: '', ticketCount: 5 },
  ]);
  const [error, setError] = useState('');

  const addRow = () => {
    setReferences([...references, { reference: '', ticketCount: 5 }]);
  };

  const removeRow = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: 'reference' | 'ticketCount', value: string | number) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all references
    const invalid = references.find(
      (ref) =>
        !ref.reference ||
        ref.reference.length !== 6 ||
        !/^\d{6}$/.test(ref.reference) ||
        ref.ticketCount < 1 ||
        ref.ticketCount > 20
    );

    if (invalid) {
      setError('Todas las referencias deben tener 6 dígitos y entre 1-20 tickets');
      return;
    }

    // Check for duplicates
    const refs = references.map((r) => r.reference);
    const duplicates = refs.filter((ref, index) => refs.indexOf(ref) !== index);
    if (duplicates.length > 0) {
      setError(`Referencias duplicadas: ${duplicates.join(', ')}`);
      return;
    }

    onSubmit(references);
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
              <h2 className="text-xl font-bold">Crear Múltiples Referencias</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {references.map((ref, index) => (
                  <div key={index} className="flex gap-2 items-end p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Label>Referencia {index + 1}</Label>
                      <Input
                        type="text"
                        placeholder="000000"
                        value={ref.reference}
                        onChange={(e) =>
                          updateRow(index, 'reference', e.target.value.slice(0, 6))
                        }
                        maxLength={6}
                        className="mt-1 text-center font-mono"
                        required
                      />
                    </div>
                    <div className="w-24">
                      <Label>Tickets</Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={ref.ticketCount}
                        onChange={(e) =>
                          updateRow(index, 'ticketCount', parseInt(e.target.value) || 5)
                        }
                        className="mt-1"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      disabled={references.length === 1}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addRow}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Fila
              </Button>

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
                  Crear {references.length} Referencia{references.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}




