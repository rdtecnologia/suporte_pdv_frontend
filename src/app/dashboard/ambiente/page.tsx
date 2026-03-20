'use client';

import { APP_ENV, getApiBaseUrls } from '@/lib/api';

export default function AmbientePage() {
  const urls = getApiBaseUrls();

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ambiente</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Ajuste <code className="text-xs bg-muted px-1 rounded">APP_ENV</code> e{' '}
          <code className="text-xs bg-muted px-1 rounded">API_CONFIG</code> em{' '}
          <code className="text-xs bg-muted px-1 rounded">src/lib/api.ts</code>.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-xl">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Ambiente do app (build)</p>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              APP_ENV === 'PROD'
                ? 'bg-green-100 text-green-700'
                : APP_ENV === 'HML'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-slate-200 text-slate-800'
            }`}
          >
            {APP_ENV}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">Bases atuais</p>
          <ul className="space-y-1.5 font-mono text-xs break-all">
            <li>
              <span className="text-muted-foreground">Auth: </span>
              {urls.auth}
            </li>
            <li>
              <span className="text-muted-foreground">User: </span>
              {urls.user}
            </li>
            <li>
              <span className="text-muted-foreground">Transaction: </span>
              {urls.transaction}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
