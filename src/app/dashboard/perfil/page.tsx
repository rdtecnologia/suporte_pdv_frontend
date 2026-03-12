'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Lock, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateAliasRequest, updatePasswordRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const aliasSchema = z.object({
  aliasName: z.string().min(1, 'Apelido obrigatório').max(100, 'Máximo 100 caracteres'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type AliasFormData = z.infer<typeof aliasSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const TOKEN_KEY = 'suporte_pdv_token';

export default function PerfilPage() {
  const { user, refreshUser } = useAuth();

  const [aliasLoading, setAliasLoading] = useState(false);
  const [aliasSuccess, setAliasSuccess] = useState(false);
  const [aliasError, setAliasError] = useState('');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const aliasForm = useForm<AliasFormData>({
    resolver: zodResolver(aliasSchema),
    defaultValues: { aliasName: user?.aliasName || '' },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleAliasSubmit = async (data: AliasFormData) => {
    setAliasLoading(true);
    setAliasError('');
    setAliasSuccess(false);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Não autenticado');

      await updateAliasRequest(token, data.aliasName);
      await refreshUser();
      setAliasSuccess(true);
      setTimeout(() => setAliasSuccess(false), 3000);
    } catch (err) {
      setAliasError(err instanceof Error ? err.message : 'Erro ao atualizar apelido');
    } finally {
      setAliasLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Não autenticado');

      await updatePasswordRequest(token, data.currentPassword, data.newPassword);
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Informações</CardTitle>
            </div>
            <CardDescription>Dados da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Nome:</span>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Nome Comercial:</span>
              <p className="font-medium">{user?.commercialName}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">CPF/CNPJ:</span>
              <p className="font-medium">{user?.cnpjCpf}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Alterar Apelido</CardTitle>
            </div>
            <CardDescription>Como você quer ser chamado no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={aliasForm.handleSubmit(handleAliasSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aliasName">Apelido</Label>
                <Input
                  id="aliasName"
                  placeholder="Seu apelido"
                  {...aliasForm.register('aliasName')}
                />
                {aliasForm.formState.errors.aliasName && (
                  <p className="text-xs text-destructive">
                    {aliasForm.formState.errors.aliasName.message}
                  </p>
                )}
              </div>

              {aliasError && (
                <p className="text-sm text-destructive">{aliasError}</p>
              )}

              {aliasSuccess && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Apelido atualizado com sucesso!
                </p>
              )}

              <Button type="submit" disabled={aliasLoading}>
                {aliasLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Apelido
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Alterar Senha</CardTitle>
          </div>
          <CardDescription>Mantenha sua conta segura</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  className="pr-10"
                  {...passwordForm.register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  className="pr-10"
                  {...passwordForm.register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  className="pr-10"
                  {...passwordForm.register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            {passwordSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> Senha alterada com sucesso!
              </p>
            )}

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Alterar Senha
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
