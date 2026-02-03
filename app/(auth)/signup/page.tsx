'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Signup page - redirects to login
 * OAuth doesn't distinguish between signup and login
 */
export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Redirecting to login...</p>
    </div>
  )
}
