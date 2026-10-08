import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/services/api/client';

// 1. Define validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // 2. Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 3. Handle submission
  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      const response = await apiClient.post('/api/auth/login/', data);
      
      // Typically Django Rest Framework SimpleJWT returns { access: '...', refresh: '...' }
      // The user data might be included if it's a custom view, otherwise we'd fetch /api/auth/me/
      const { access, user } = response.data;
      
      if (!access) {
        throw new Error('No access token received');
      }

      login(
        user || { id: 'unknown', email: data.email, first_name: data.email.split('@')[0], last_name: '' },
        access
      );
      
      navigate('/dashboard');
    } catch (err: any) {
      setGlobalError(err.response?.data?.detail || 'Invalid email or password.');
    }
  };

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Welcome back
        </h1>
        <p className="text-sm text-muted mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-secondary focus:ring-secondary"
            />
            <label htmlFor="remember-me" className="text-sm text-primary">
              Remember me
            </label>
          </div>
          
          <Link
            to="/auth/forgot-password"
            className="text-sm font-medium text-secondary hover:text-indigo-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {globalError && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-error">{globalError}</p>
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="font-medium text-secondary hover:text-indigo-600 hover:underline"
        >
          Sign up &rarr;
        </Link>
      </div>
    </>
  );
}
