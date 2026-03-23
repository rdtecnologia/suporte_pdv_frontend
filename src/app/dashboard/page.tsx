'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  CalendarDays,
  DollarSign,
  Loader2,
  Car,
  Bike,
  Percent,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import {
  getSalesSummaryRequest,
  getTransactionsRequest,
  SalesSummaryResponse,
  SalesSummaryWindow,
  Transaction,
} from '@/lib/api';
import { toast } from 'sonner';

const TOKEN_KEY = 'suporte_pdv_token';

const emptyWindow: SalesSummaryWindow = {
  valorBruto: 0,
  comissao: 0,
  sellerCommissionRate: 0,
};

const emptySummary: SalesSummaryResponse = {
  domain: null,
  day: { ...emptyWindow },
  week: { ...emptyWindow },
  month: { ...emptyWindow },
};

function formatMoney(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PeriodCard({
  title,
  icon: Icon,
  data,
}: {
  title: string;
  icon: React.ElementType;
  data: SalesSummaryWindow;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-1.5 rounded-md bg-success/10 text-success">
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="text-sm">Valor bruto</span>
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums shrink-0">
              R$ {formatMoney(data.valorBruto)}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-1.5 rounded-md bg-warning/10 text-warning">
                <Percent className="h-4 w-4" />
              </div>
              <span className="text-sm">Comissão</span>
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums shrink-0">
              R$ {formatMoney(data.comissao)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState<SalesSummaryResponse>(emptySummary);
  const [salesSummaryLoading, setSalesSummaryLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setTransactionsLoading(false);
        setSalesSummaryLoading(false);
        return;
      }

      try {
        const [tx, summary] = await Promise.all([
          getTransactionsRequest(token),
          getSalesSummaryRequest(token),
        ]);
        setTransactions(tx);
        setSalesSummary(summary);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao carregar o dashboard');
      } finally {
        setTransactionsLoading(false);
        setSalesSummaryLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Bem-vindo, {user?.name} — {user?.commercialName}
        </p>
      </div>

      {salesSummaryLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PeriodCard title="Vendas do dia" icon={TrendingUp} data={salesSummary.day} />
          <PeriodCard title="Vendas da semana" icon={CalendarDays} data={salesSummary.week} />
          <PeriodCard title="Vendas do mês" icon={Calendar} data={salesSummary.month} />
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">10 últimas transações efetuadas</h2>
        <Card>
          <CardContent className="p-0">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Nenhuma transação encontrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">{tx.data}</TableCell>
                      <TableCell className="text-sm font-medium">
                        R$ {tx.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={tx.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tx.placa}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {tx.tipoVeiculo.toLowerCase().includes('moto') ? (
                            <Bike className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Car className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">{tx.tipoVeiculo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{tx.formaPagamento}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
