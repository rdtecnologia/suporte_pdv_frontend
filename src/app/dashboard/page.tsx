'use client';

import {
  AlertTriangle,
  CalendarDays,
  DollarSign,
  Percent,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';

const mockStats = {
  vendasSemana: 76,
  valorBrutoSemana: 438.0,
  comissaoSemana: 43.8,
  vendasDia: 20,
  valorBrutoDia: 125.0,
  comissaoDia: 12.5,
  faturasAtraso: 2,
  valorAtraso: 735.0,
};

const mockTransactions = [
  { id: '1', periodo: '09/02/2026 às 14:13:43', valor: 15.0, status: 'ABERTO', cnpj: '859.473.856-00', formaPagamento: 'PIX' },
  { id: '2', periodo: '07/02/2026 às 13:15:49', valor: 4.0, status: 'ATRASADO', cnpj: '126.845.766-37', formaPagamento: 'PIX' },
  { id: '3', periodo: '07/02/2026 às 10:50:02', valor: 20.0, status: 'PAGO', cnpj: '156.060.846-35', formaPagamento: 'PIX' },
  { id: '4', periodo: '06/02/2026 às 12:28:35', valor: 30.0, status: 'ATRASADO', cnpj: '903.498.816-34', formaPagamento: 'PIX' },
  { id: '5', periodo: '06/02/2026 às 07:36:46', valor: 50.0, status: 'PAGO', cnpj: '971.439.367-15', formaPagamento: 'PIX' },
];

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  prefix = '',
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  prefix?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">
            {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Bem-vindo, {user?.name} — {user?.commercialName}
        </p>
      </div>

      {mockStats.faturasAtraso > 0 && (
        <div className="flex items-start gap-3 rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Faturas em atraso</p>
            <p className="text-sm text-muted-foreground">
              Você possui {mockStats.faturasAtraso} fatura(s) em atraso totalizando{' '}
              <span className="font-semibold text-destructive">
                R$ {mockStats.valorAtraso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Vendas da Semana</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Créditos"
            value={mockStats.vendasSemana}
            icon={ShoppingCart}
            colorClass="bg-primary/10 text-primary"
          />
          <StatCard
            label="Valor Bruto"
            value={mockStats.valorBrutoSemana}
            icon={DollarSign}
            colorClass="bg-success/10 text-success"
            prefix="R$ "
          />
          <StatCard
            label="Comissão"
            value={mockStats.comissaoSemana}
            icon={Percent}
            colorClass="bg-warning/10 text-warning"
            prefix="R$ "
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Vendas do Dia</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Créditos"
            value={mockStats.vendasDia}
            icon={ShoppingCart}
            colorClass="bg-primary/10 text-primary"
          />
          <StatCard
            label="Valor Bruto"
            value={mockStats.valorBrutoDia}
            icon={DollarSign}
            colorClass="bg-success/10 text-success"
            prefix="R$ "
          />
          <StatCard
            label="Comissão"
            value={mockStats.comissaoDia}
            icon={Percent}
            colorClass="bg-warning/10 text-warning"
            prefix="R$ "
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Transações do Dia</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">{tx.periodo}</TableCell>
                    <TableCell className="text-sm font-medium">
                      R$ {tx.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tx.cnpj}</TableCell>
                    <TableCell className="text-sm">{tx.formaPagamento}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
