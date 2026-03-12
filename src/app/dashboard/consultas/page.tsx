'use client';

import { useEffect, useState } from 'react';
import { Search, Car, Bike, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import {
  searchTransactionsRequest,
  SearchTransactionsResponse,
  SearchFilters,
} from '@/lib/api';

const TOKEN_KEY = 'suporte_pdv_token';

export default function ConsultasPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    startDate: '',
    endDate: '',
    licensePlate: '',
    vehicleType: '',
    page: 1,
    limit: 20,
  });

  const [response, setResponse] = useState<SearchTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setError('Token não encontrado');
        return;
      }

      const cleanFilters: SearchFilters = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.startDate) cleanFilters.startDate = filters.startDate;
      if (filters.endDate) cleanFilters.endDate = filters.endDate;
      if (filters.licensePlate) cleanFilters.licensePlate = filters.licensePlate;
      if (filters.vehicleType && filters.vehicleType !== 'Todos') {
        cleanFilters.vehicleType = filters.vehicleType;
      }

      const data = await searchTransactionsRequest(token, cleanFilters);
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar transações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [filters.page]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && response && newPage <= response.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleClear = () => {
    setFilters({
      startDate: '',
      endDate: '',
      licensePlate: '',
      vehicleType: '',
      page: 1,
      limit: 20,
    });
    setResponse(null);
    setError('');
  };

  const startRecord = response ? (response.page - 1) * filters.limit! + 1 : 0;
  const endRecord = response
    ? Math.min(response.page * filters.limit!, response.total)
    : 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Consultas</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Busque transações por data, placa ou tipo de veículo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Data Inicial</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Placa</label>
              <Input
                type="text"
                placeholder="ABC-1234"
                value={filters.licensePlate}
                onChange={(e) =>
                  handleFilterChange('licensePlate', e.target.value.toUpperCase())
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipo de Veículo</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={filters.vehicleType}
                onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Carro">Carro</option>
                <option value="Moto">Moto</option>
                <option value="Caminhão">Caminhão</option>
                <option value="Motofrete C/D">Motofrete C/D</option>
                <option value="Carga e Descarga">Carga e Descarga</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={loading} className="flex-1 sm:flex-none">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              disabled={loading}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : !response || response.data.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {response.data.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm font-medium">{tx.placa}</TableCell>
                      <TableCell className="text-sm">{tx.data}</TableCell>
                      <TableCell className="text-sm font-medium">
                        R$ {tx.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
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
                      <TableCell>
                        <StatusBadge status={tx.status} />
                      </TableCell>
                      <TableCell className="text-sm">{tx.formaPagamento}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startRecord}-{endRecord} de {response.total} resultados
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(response.page - 1)}
                    disabled={response.page === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  <div className="text-sm font-medium">
                    Página {response.page} de {response.totalPages}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(response.page + 1)}
                    disabled={response.page === response.totalPages || loading}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
