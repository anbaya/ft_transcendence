import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/services/api/client';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setGlobalError(null);
    
    if (!uid || !token) {
      setGlobalError('Invalid or missing password reset link.');
      return;
    }

    try {
      await apiClient.post('/api/auth/reset-password/', {
        uid,
        token,
        new_password: data.password,
      });
      // Navigate to login after successful reset
      navigate('/auth/login');
    } catch (err: any) {
      setGlobalError(err.response?.data?.non_field_errors?.[0] || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Set new password
        </h1>
        <p className="text-sm text-muted mt-2">
          Choose a strong password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New password"
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
          Reset password
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        <Link
          to="/auth/login"
          className="font-medium text-secondary hover:text-indigo-600 hover:underline"
        >
          &larr; Back to sign in
        </Link>
      </div>
    </>
  );
}
