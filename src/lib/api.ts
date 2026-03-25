export type AppEnv = 'DEV' | 'HML' | 'PROD';

/** Troque para `HML` ou `PROD` quando for apontar para homologação ou produção. */
export const APP_ENV: AppEnv = 'DEV';

const API_CONFIG: Record<AppEnv, {
  auth: string;
  user: string;
  transaction: string,
  cadastra: string,
  pos: string,
  transaciona: string,
  arquivo: string,
  fiscaliza: string,
  autentica: string,
}> = {
  DEV: {
    auth: 'http://localhost:3001',
    user: 'http://localhost:3002',
    transaction: 'http://localhost:3003',
    cadastra: 'https://cadastrah.timob.com.br',
    pos: 'https://posh.timob.com.br',
    transaciona: 'https://transacionah.timob.com.br',
    arquivo: 'https://arquivoh.timob.com.br',
    fiscaliza: 'https://fiscalizah.timob.com.br',
    autentica: 'https://autenticah.timob.com.br',
  },
  HML: {
    auth: 'https://hml-auth.example.com',
    user: 'https://hml-user.example.com',
    transaction: 'https://hml-transaction.example.com',
    cadastra: 'https://cadastrah.timob.com.br',
    pos: 'https://posh.timob.com.br',
    transaciona: 'https://transacionah.timob.com.br',
    arquivo: 'https://arquivoh.timob.com.br',
    fiscaliza: 'https://fiscalizah.timob.com.br',
    autentica: 'https://autenticah.timob.com.br',
  },
  PROD: {
    auth: 'https://auth.example.com',
    user: 'https://user.example.com',
    transaction: 'https://transaction.example.com',
    cadastra: 'https://cadastrah.timob.com.br',
    pos: 'https://posh.timob.com.br',
    transaciona: 'https://transacionah.timob.com.br',
    arquivo: 'https://arquivoh.timob.com.br',
    fiscaliza: 'https://fiscalizah.timob.com.br',
    autentica: 'https://autenticah.timob.com.br',
  },
};

const {
  auth: AUTH_API,
  user: USER_API,
  transaction: TRANSACTION_API,
  cadastra: CADASTRA,
  pos: POS,
  transaciona: TRANSACIONA,
  arquivo: ARQUIVO,
  fiscaliza: FISCALIZA,
  autentica: AUTENTICA,
} = API_CONFIG[APP_ENV];

export function getApiBaseUrls() {
  return API_CONFIG[APP_ENV];
}

const TOKEN_KEY = 'suporte_pdv_token';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export async function loginRequest(cnpjCpf: string, password: string) {
  const res = await fetch(`${AUTH_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cnpjCpf, password }),
  });

  if (!res.ok) {
    throw new Error('Invalid credentials');
  }

  return res.json() as Promise<{ accessToken: string }>;
}

export async function getMeRequest(token: string) {
  const res = await fetch(`${AUTH_API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Unauthorized');
  }

  return res.json() as Promise<{
    id: string;
    cnpjCpf: string;
    name: string;
    commercialName: string;
    aliasName: string;
  }>;
}

export async function updateAliasRequest(token: string, aliasName: string) {
  const res = await fetch(`${USER_API}/user/alias`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ aliasName }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Erro ao atualizar apelido');
  }

  return res.json() as Promise<{ message: string; aliasName: string }>;
}

export async function updatePasswordRequest(
  token: string,
  currentPassword: string,
  newPassword: string,
) {
  const res = await fetch(`${USER_API}/user/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Erro ao alterar senha');
  }

  return res.json() as Promise<{ message: string }>;
}

export interface Transaction {
  id: string;
  data: string;
  valor: number;
  status: 'PAGO' | 'ABERTO' | 'RECUSADO';
  placa: string;
  tipoVeiculo: string;
  formaPagamento: string;
}

export interface SearchTransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SearchFilters {
  startDate?: string;
  endDate?: string;
  licensePlate?: string;
  vehicleType?: string;
  page?: number;
  limit?: number;
}

export async function getTransactionsRequest(token: string) {
  const res = await fetch(`${TRANSACTION_API}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Erro ao buscar transações');
  }

  return res.json() as Promise<Transaction[]>;
}

export interface SalesSummaryWindow {
  valorBruto: number;
  comissao: number;
  sellerCommissionRate: number;
}

export interface SalesSummaryResponse {
  domain: string | null;
  day: SalesSummaryWindow;
  week: SalesSummaryWindow;
  month: SalesSummaryWindow;
}

export async function getSalesSummaryRequest(token: string) {
  const res = await fetch(`${TRANSACTION_API}/transactions/sales-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message || 'Erro ao carregar resumo de vendas',
    );
  }

  return res.json() as Promise<SalesSummaryResponse>;
}

export interface BotPdvMe {
  id: number;
  domain: string;
  botHml: string | null;
  botPrd: string | null;
  createdAt: string;
}

export function getBotPdvUrlForEnv(row: BotPdvMe, env: AppEnv): string | null {
  const url = env === 'PROD' ? row.botPrd : row.botHml;
  const t = url?.trim();
  return t || null;
}

export async function getBotPdvMeRequest(token: string) {
  const res = await fetch(`${TRANSACTION_API}/bot-pdv/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message || 'Erro ao carregar POS Web');
  }
  return res.json() as Promise<BotPdvMe>;
}

export async function searchTransactionsRequest(
  token: string,
  filters: SearchFilters,
) {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.licensePlate) params.append('licensePlate', filters.licensePlate);
  if (filters.vehicleType) params.append('vehicleType', filters.vehicleType);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const res = await fetch(
    `${TRANSACTION_API}/transactions/search?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    throw new Error('Erro ao buscar transações');
  }

  return res.json() as Promise<SearchTransactionsResponse>;
}

export interface SellerSettlementDto {
  id: number;
  sellerId: number;
  domain: string;
  periodType: 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: string;
  interCodigoSolicitacao: string | null;
  seuNumero: string;
  linhaDigitavel: string | null;
  pixCopiaCola: string | null;
  pdfUrl: string | null;
  issuedAt: string | null;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface SellerSettlementPreviewDto {
  domain: string | null;
  weeklyBillingLevel: number;
  sellerCommissionRate: number;
  unsettledGrossWeek: number;
  unsettledGrossMonth: number;
}

export async function getSellerSettlementsRequest(token: string) {
  const res = await fetch(`${TRANSACTION_API}/seller-settlements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message || 'Erro ao carregar liquidações',
    );
  }
  return res.json() as Promise<SellerSettlementDto[]>;
}

export async function getSellerSettlementPreviewRequest(token: string) {
  const res = await fetch(`${TRANSACTION_API}/seller-settlements/preview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message || 'Erro ao carregar prévia financeira',
    );
  }
  return res.json() as Promise<SellerSettlementPreviewDto>;
}

/** Baixa o PDF do boleto (dispara download no browser). */
export async function downloadBoletoPdfRequest(token: string, settlementId: number) {
  const res = await fetch(
    `${TRANSACTION_API}/seller-settlements/${settlementId}/boleto-pdf`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message || 'Erro ao baixar boleto',
    );
  }
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition');
  let filename = `boleto-${settlementId}.pdf`;
  if (cd) {
    const m = /filename="?([^";]+)"?/i.exec(cd);
    if (m?.[1]) filename = m[1];
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
