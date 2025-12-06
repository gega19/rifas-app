import { StatsChart } from './StatsChart';

interface TicketDistributionChartProps {
  data: Array<{ name: string; value: number }>;
}

export function TicketDistributionChart({ data }: TicketDistributionChartProps) {
  return (
    <StatsChart
      data={data}
      type="pie"
      title="Distribución de Tickets"
      dataKey="value"
    />
  );
}




