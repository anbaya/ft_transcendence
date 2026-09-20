import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (_data: ForgotPasswordFormValues) => {
    setGlobalError(null);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } catch (err) {
      setGlobalError('Failed to send reset link. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Check your email
        </h2>
        <p className="text-sm text-muted mt-2 mb-8">
          We've sent a password reset link to your email address.
        </p>
        <Link to="/auth/login">
          <Button variant="secondary" className="w-full">
            Return to sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Reset your password
        </h1>
        <p className="text-sm text-muted mt-2">
          Enter your email and we'll send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        {globalError && (
          <div className="rounded-md bg-red-50 p-3 mt-4">
            <p className="text-sm text-error">{globalError}</p>
          </div>
        )}

        <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
          Send reset link
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
