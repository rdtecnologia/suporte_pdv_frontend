const AUTH_API = 'http://localhost:3001';
const USER_API = 'http://localhost:3002';
const TRANSACTION_API = 'http://localhost:3003';

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
