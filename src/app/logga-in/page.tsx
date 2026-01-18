'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, signUp } from '@/lib/auth-client';
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
import { loginSchema, signUpSchema, type LoginFormData, type SignUpFormData } from '@/lib/auth-schemas';

function LoggaInForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
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

  const onSignUpSubmit = async (data: SignUpFormData): Promise<void> => {
    setSubmitError('');
    try {
      await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setSubmitError(errorMessage);
    }
  };

  const handleToggleMode = (): void => {
    setIsSignUp(!isSignUp);
    setSubmitError('');
    loginForm.reset();
    signUpForm.reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Skapa konto' : 'Logga in'}</CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Skapa ett nytt kundkonto för att komma igång'
              : 'Logga in på ditt kundkonto'}
          </CardDescription>
        </CardHeader>
        {isSignUp ? (
          <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="name">Namn</FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    type="text"
                    {...signUpForm.register('name')}
                    placeholder="Kalle Andersson"
                    aria-invalid={!!signUpForm.formState.errors.name}
                  />
                  <FieldError
                    errors={[signUpForm.formState.errors.name]}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">E-post</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    {...signUpForm.register('email')}
                    placeholder="du@example.com"
                    aria-invalid={!!signUpForm.formState.errors.email}
                  />
                  <FieldError
                    errors={[signUpForm.formState.errors.email]}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Lösenord</FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    type="password"
                    {...signUpForm.register('password')}
                    placeholder="••••••••"
                    aria-invalid={!!signUpForm.formState.errors.password}
                  />
                  <FieldError
                    errors={[signUpForm.formState.errors.password]}
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
                disabled={signUpForm.formState.isSubmitting}
              >
                {signUpForm.formState.isSubmitting ? 'Skapar konto...' : 'Skapa konto'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleToggleMode}
              >
                Har du redan ett konto? Logga in
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email">E-post</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register('email')}
                    placeholder="du@example.com"
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
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleToggleMode}
              >
                Har du inget konto? Skapa konto
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function LoggaInPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Logga in</CardTitle>
              <CardDescription>Laddar...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <LoggaInForm />
    </Suspense>
  );
}
