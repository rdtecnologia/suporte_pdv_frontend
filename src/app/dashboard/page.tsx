'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  DollarSign,
  Percent,
  ShoppingCart,
  TrendingUp,
  Loader2,
  Car,
  Bike,
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
import { getTransactionsRequest, Transaction } from '@/lib/api';

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

const TOKEN_KEY = 'suporte_pdv_token';

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;

        const data = await getTransactionsRequest(token);
        setTransactions(data);
      } catch (err) {
        setTransactionsError(err instanceof Error ? err.message : 'Erro ao carregar transações');
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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
        <h2 className="text-base font-semibold text-foreground">10 últimas transações efetuadas</h2>
        <Card>
          <CardContent className="p-0">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : transactionsError ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-destructive">{transactionsError}</p>
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
