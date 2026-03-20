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
