import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/services/api/client';

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setGlobalError(null);
    try {
      await apiClient.post('/api/auth/register/', {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      });
      
      // Navigate to login after successful registration
      navigate('/auth/login');
    } catch (err: any) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.detail) {
          setGlobalError(errorData.detail);
        } else {
          const generalErrors: string[] = [];
          Object.entries(errorData).forEach(([field, msgs]) => {
            const message = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
            if (['first_name', 'last_name', 'email', 'password'].includes(field)) {
              setError(field as keyof RegisterFormValues, { type: 'server', message });
            } else {
              generalErrors.push(`${field}: ${message}`);
            }
          });
          if (generalErrors.length > 0) {
            setGlobalError(generalErrors.join(' | '));
          }
        }
      } else {
        setGlobalError('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Create your account
        </h1>
        <p className="text-sm text-muted mt-2">
          Get started for free
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            type="text"
            placeholder="first name"
            autoComplete="given-name"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <Input
            label="Last name"
            type="text"
            placeholder="last name"
            autoComplete="family-name"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {globalError && (
          <div className="rounded-md bg-red-50 p-3 mt-4">
            <p className="text-sm text-error">{globalError}</p>
          </div>
        )}

        <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="font-medium text-secondary hover:text-indigo-600 hover:underline"
        >
          Sign in &rarr;
        </Link>
      </div>
    </>
  );
}
