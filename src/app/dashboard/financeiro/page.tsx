'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2, Copy, Check, Info, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getSellerSettlementPreviewRequest,
  getSellerSettlementsRequest,
  downloadBoletoPdfRequest,
  SellerSettlementDto,
  SellerSettlementPreviewDto,
} from '@/lib/api';
import { toast } from 'sonner';

const TOKEN_KEY = 'suporte_pdv_token';

function formatMoney(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPeriod(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    draft: 'Rascunho',
    issued: 'Emitido',
    paid: 'Pago',
    failed: 'Falhou',
    cancelled: 'Cancelado',
  };
  return map[s] ?? s;
}

export default function FinanceiroPage() {
  const { user } = useAuth();
  const [preview, setPreview] = useState<SellerSettlementPreviewDto | null>(null);
  const [settlements, setSettlements] = useState<SellerSettlementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [p, list] = await Promise.all([
          getSellerSettlementPreviewRequest(token),
          getSellerSettlementsRequest(token),
        ]);
        setPreview(p);
        setSettlements(list);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao carregar financeiro');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownload = async (id: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setDownloadingId(id);
    try {
      await downloadBoletoPdfRequest(token, id);
      toast.success('Download iniciado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao baixar boleto');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopyPix = async (id: number, pix: string) => {
    try {
      await navigator.clipboard.writeText(pix);
      setCopiedId(id);
      toast.success('PIX copiado');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Liquidações e boletos — {user?.commercialName}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 overflow-hidden">
        <button
          type="button"
          id="financeiro-ajuda-toggle"
          aria-expanded={helpOpen}
          aria-controls="financeiro-ajuda-conteudo"
          onClick={() => setHelpOpen((v) => !v)}
          className="w-full flex items-center gap-3 p-4 sm:px-5 sm:py-4 text-left hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-none"
        >
          <Info className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span className="font-medium text-foreground text-sm sm:text-base flex-1">
            Como funcionam as liquidações
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
              helpOpen ? 'rotate-180' : ''
            }`}
            aria-hidden
          />
        </button>
        {helpOpen && (
          <CardContent
            id="financeiro-ajuda-conteudo"
            className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5 border-t border-primary/10"
          >
            <div className="flex gap-3 pt-4">
              <div className="w-5 shrink-0" aria-hidden />
              <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
                <ul className="list-disc pl-4 space-y-2 marker:text-primary/80">
                  <li>
                    <strong>Teto semanal</strong> (valor acima): nas vendas da{' '}
                    <strong>semana anterior</strong> (fechamento em geral após o domingo), se o
                    total bruto de pedidos pagos for <strong>igual ou maior</strong> ao teto
                    configurado para o seu domínio, é gerado um <strong>boleto semanal</strong>
                    com o valor líquido (vendas menos comissão).
                  </li>
                  <li>
                    Se o total da semana <strong>ficar abaixo do teto</strong>, não há boleto
                    naquela semana; esses pedidos <strong>acumulam</strong> até o{' '}
                    <strong>fechamento mensal</strong>, quando entram no boleto do mês.
                  </li>
                  <li>
                    O <strong>fechamento mensal</strong> considera o{' '}
                    <strong>mês civil anterior</strong> completo (pedidos pagos ainda não
                    liquidados naquele período). Não vale o teto semanal nessa etapa.
                  </li>
                  <li>
                    Cada pedido entra em <strong>uma única</strong> liquidação; após processado,
                    não entra de novo em outro boleto.
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  Os valores abaixo são referências do período corrente; os boletos emitidos
                  aparecem na tabela com o período e o tipo (Semanal ou Mensal).
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {preview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Nível faturamento semanal (teto)</p>
                  <p className="text-lg font-semibold tabular-nums">
                    R$ {formatMoney(preview.weeklyBillingLevel)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Comissão (%)</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {preview.sellerCommissionRate.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Bruto não liquidado (semana atual)</p>
                  <p className="text-lg font-semibold tabular-nums">
                    R$ {formatMoney(preview.unsettledGrossWeek)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Bruto não liquidado (mês atual)</p>
                  <p className="text-lg font-semibold tabular-nums">
                    R$ {formatMoney(preview.unsettledGrossMonth)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Liquidações</h2>
            <Card>
              <CardContent className="p-0">
                {settlements.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    Nenhuma liquidação registrada
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Bruto</TableHead>
                          <TableHead className="text-right">Líquido</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {settlements.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="text-sm whitespace-nowrap">
                              {formatPeriod(row.periodStart)} — {formatPeriod(row.periodEnd)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.periodType === 'weekly' ? 'Semanal' : 'Mensal'}
                            </TableCell>
                            <TableCell className="text-sm text-right tabular-nums">
                              R$ {formatMoney(row.grossAmount)}
                            </TableCell>
                            <TableCell className="text-sm text-right tabular-nums font-medium">
                              R$ {formatMoney(row.netAmount)}
                            </TableCell>
                            <TableCell className="text-sm">{statusLabel(row.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 flex-wrap">
                                {row.pixCopiaCola && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => handleCopyPix(row.id, row.pixCopiaCola!)}
                                  >
                                    {copiedId === row.id ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                    PIX
                                  </Button>
                                )}
                                {(row.status === 'issued' || row.status === 'paid') && (
                                  <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    className="gap-1"
                                    disabled={downloadingId === row.id}
                                    onClick={() => handleDownload(row.id)}
                                  >
                                    {downloadingId === row.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                    Boleto
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
