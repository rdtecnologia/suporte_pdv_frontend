const AUTH_API = 'http://localhost:3001';

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
    email: string;
    name: string;
    commercialName: string;
  }>;
}
