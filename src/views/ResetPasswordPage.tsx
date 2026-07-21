'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resetPassword, getAuthErrorMessage } from '@/services/authService';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(email.trim());
    } catch (err: unknown) {
      // Deliberately do NOT surface auth/user-not-found differently from success —
      // doing so would let an attacker enumerate which emails have accounts.
      const code = (err as { code?: string })?.code;
      if (code !== 'auth/user-not-found') {
        setError(getAuthErrorMessage(err));
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Reset your password
          </h2>
          <p className="text-base text-muted-foreground">
            Enter the email on your account and we&apos;ll send you a reset link.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Forgot your password?</CardTitle>
            <CardDescription className="text-base">
              We&apos;ll email you a link to choose a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {submitted ? (
              <Alert>
                <AlertDescription>
                  If an account exists for {email}, a password reset email is on its way. Check your inbox (and spam folder).
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    className="py-3"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-3"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <Link
                  href="/sign-in"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-muted-foreground"
                >
                  Back to sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
