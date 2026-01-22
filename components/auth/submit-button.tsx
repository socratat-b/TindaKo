'use client'

import { type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  isPending: boolean
  children: ReactNode
}

export function SubmitButton({ isPending, children }: SubmitButtonProps) {
  // Convert "Sign in" to "Signing in..." or "Sign up" to "Signing up..."
  const getPendingText = () => {
    const text = String(children)
    if (text === 'Sign in') return 'Signing in...'
    if (text === 'Sign up') return 'Signing up...'
    return `${text}ing...`
  }

  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? (
        <>
          <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
          {getPendingText()}
        </>
      ) : (
        children
      )}
    </button>
  )
}
