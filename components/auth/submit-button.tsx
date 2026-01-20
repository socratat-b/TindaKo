'use client'

import { type ReactNode } from 'react'

interface SubmitButtonProps {
  isPending: boolean
  children: ReactNode
}

export function SubmitButton({ isPending, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? `${children}ing...` : children}
    </button>
  )
}
