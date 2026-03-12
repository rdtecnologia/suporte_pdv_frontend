const AUTH_API = 'http://localhost:3001';
const USER_API = 'http://localhost:3002';

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
