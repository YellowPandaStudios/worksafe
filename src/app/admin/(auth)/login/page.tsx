'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { loginSchema, type LoginFormData } from '@/lib/auth-schemas';

function AdminLoginForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const [submitError, setSubmitError] = useState('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData): Promise<void> => {
    setSubmitError('');
    try {
      await signIn.email({
        email: data.email,
        password: data.password,
      });
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setSubmitError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Logga in för att komma åt adminpanelen
          </CardDescription>
        </CardHeader>
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email">E-post</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  {...loginForm.register('email')}
                  placeholder="admin@example.com"
                  aria-invalid={!!loginForm.formState.errors.email}
                />
                <FieldError
                  errors={[loginForm.formState.errors.email]}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Lösenord</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  {...loginForm.register('password')}
                  placeholder="••••••••"
                  aria-invalid={!!loginForm.formState.errors.password}
                />
                <FieldError
                  errors={[loginForm.formState.errors.password]}
                />
              </FieldContent>
            </Field>
            {submitError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting ? 'Loggar in...' : 'Logga in'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function AdminLoginPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="size-6" />
              </div>
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>Laddar...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
