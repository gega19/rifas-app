import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ParticipantFiltersProps {
  filters: {
    dateFrom?: string;
    dateTo?: string;
    referenceId?: string;
  };
  onFiltersChange: (filters: {
    dateFrom?: string;
    dateTo?: string;
    referenceId?: string;
  }) => void;
  onReset: () => void;
}

export function ParticipantFilters({ filters, onFiltersChange, onReset }: ParticipantFiltersProps) {
  const hasFilters = filters.dateFrom || filters.dateTo || filters.referenceId;

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="dateFrom">Fecha Desde</Label>
        <Input
          id="dateFrom"
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })}
          className="mt-1"
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="dateTo">Fecha Hasta</Label>
        <Input
          id="dateTo"
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || undefined })}
          className="mt-1"
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="referenceId">Referencia</Label>
        <Input
          id="referenceId"
          type="text"
          placeholder="000000"
          value={filters.referenceId || ''}
          onChange={(e) => onFiltersChange({ ...filters, referenceId: e.target.value || undefined })}
          maxLength={6}
          className="mt-1 font-mono"
        />
      </div>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onReset}>
          <X className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
      )}
    </div>
  );
}




