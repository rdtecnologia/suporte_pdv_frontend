import { Badge } from '@/components/ui/badge';

type Status = 'PAGO' | 'ATRASADO' | 'ABERTO';

const statusConfig: Record<Status, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  PAGO: { label: 'Pago', variant: 'success' },
  ATRASADO: { label: 'Atrasado', variant: 'destructive' },
  ABERTO: { label: 'Aberto', variant: 'warning' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as Status] ?? { label: status, variant: 'warning' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
