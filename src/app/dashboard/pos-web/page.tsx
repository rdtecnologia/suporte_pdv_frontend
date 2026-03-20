'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  APP_ENV,
  getBotPdvMeRequest,
  getBotPdvUrlForEnv,
} from '@/lib/api';

const TOKEN_KEY = 'suporte_pdv_token';

export default function PosWebPage() {
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const [domainLabel, setDomainLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          toast.error('Sessão inválida');
          return;
        }
        const row = await getBotPdvMeRequest(token);
        const url = getBotPdvUrlForEnv(row, APP_ENV);
        if (cancelled) return;
        setDomainLabel(row.domain);
        if (!url) {
          toast.error(
            APP_ENV === 'PROD'
              ? 'URL de produção (bot_prd) não configurada para o seu domínio.'
              : 'URL de homologação (bot_hml) não configurada para o seu domínio.',
          );
          setOpenUrl(null);
          return;
        }
        setOpenUrl(url);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Erro ao carregar POS Web');
          setOpenUrl(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">POS Web</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Ambiente do app: <span className="font-medium text-foreground">{APP_ENV}</span>
          {domainLabel ? (
            <>
              {' '}
              · Domínio: <span className="font-medium text-foreground">{domainLabel}</span>
            </>
          ) : null}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Carregando…
        </div>
      ) : openUrl ? (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            O POS Web não é exibido aqui dentro do painel. Abra o endereço em uma{' '}
            <span className="font-medium">nova aba do navegador</span> para utilizar o serviço.
          </p>
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'default' }), 'w-full sm:w-auto')}
          >
            <ExternalLink className="h-4 w-4" />
            Abrir POS Web em nova aba
          </a>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Não foi possível obter o link. Verifique o cadastro em bot_pdv para o seu domínio e se existem
          pedidos vinculados ao seller.
        </p>
      )}
    </div>
  );
}
