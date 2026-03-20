'use client';

import { useAuth } from '@/contexts/AuthContext';
import { APP_ENV } from '@/lib/api';

export function TopBar() {
  const { user } = useAuth();

  const badgeClass =
    APP_ENV === 'PROD'
      ? 'bg-green-100 text-green-700'
      : APP_ENV === 'HML'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-slate-200 text-slate-800';

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-end px-6 shrink-0 gap-3">
      {user && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${badgeClass}`}>
          {APP_ENV}
        </span>
      )}
    </header>
  );
}
