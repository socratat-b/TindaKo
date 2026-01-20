'use client'

import { useActionState } from 'react'
import { signupAction } from '@/lib/actions/auth'
import Link from 'next/link'
import { SubmitButton } from '@/components/auth/submit-button'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, {})

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-foreground">TindaKo POS</h1>
          <p className="mt-2 text-center text-muted-foreground">Create your account</p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          {state.error && (
            <div className="rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
              {state.error}
            </div>
          )}

          {state.success && (
            <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-sm text-success">
              {state.success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>
          </div>

          <SubmitButton isPending={isPending}>
            Sign up
          </SubmitButton>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
