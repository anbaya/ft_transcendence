import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
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
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (_data: RegisterFormValues) => {
    setGlobalError(null);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Navigate to login after successful registration
      navigate('/auth/login');
    } catch (err) {
      setGlobalError('Failed to create account. Please try again.');
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
        <Input
          label="Full name"
          type="text"
          placeholder="Anoir Baya"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

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
