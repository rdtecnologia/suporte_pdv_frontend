'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const loginSchema = z.object({
  cnpjCpf: z.string().min(1, 'CPF/CNPJ obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.cnpjCpf, data.password);
      router.replace('/dashboard');
    } catch {
      setError('CPF/CNPJ ou senha inválidos. Tente novamente.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(222,47%,14%) 50%, hsl(220,50%,18%) 100%)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(222,47%,14%) 50%, hsl(220,50%,18%) 100%)' }}
    >
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SUPORTE PDV</h1>
          <p className="text-white/50 text-sm mt-1">Web + POS</p>
        </div>

        <Card className="bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-center text-foreground">Acesso ao Sistema</h2>
            <p className="text-sm text-muted-foreground text-center">Entre com suas credenciais</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cnpjCpf">CPF / CNPJ</Label>
                <Input
                  id="cnpjCpf"
                  type="text"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  autoComplete="username"
                  {...register('cnpjCpf')}
                />
                {errors.cnpjCpf && (
                  <p className="text-xs text-destructive">{errors.cnpjCpf.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Conexão segura e protegida</span>
          </div>
          <p className="text-white/30 text-xs">© 2026 Suporte PDV — Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
