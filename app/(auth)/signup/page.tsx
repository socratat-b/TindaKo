'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signupAction } from '@/lib/actions/auth'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [phone, setPhone] = useState('')
  const [storeName, setStoreName] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const session = getSession()
    if (session) {
      router.push('/pos')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsPending(true)

    try {
      // Validate PIN match
      if (pin !== confirmPin) {
        setError('PINs do not match')
        setIsPending(false)
        return
      }

      // Call signup action
      const result = await signupAction(phone, storeName, pin)

      if (!result.success) {
        setError(result.error || 'Signup failed')
        setIsPending(false)
        return
      }

      // Update auth store
      setAuth(result.phone!, result.storeName!)

      // Redirect to POS
      router.push('/pos')
    } catch (err) {
      console.error('[SignupPage] Error:', err)
      setError('An unexpected error occurred')
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-white px-4">
      <div className="w-full max-w-md space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl text-white text-2xl font-bold"
          >
            TK
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">TindaKo</h1>
            <p className="mt-1 text-sm text-teal-600 font-medium">Offline-First Point of Sale</p>
            <p className="mt-2 text-gray-600">Create your account</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="09[0-9]{9}"
                  maxLength={11}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="09171234567"
                />
                <p className="mt-1 text-xs text-gray-500">Format: 09XXXXXXXXX (11 digits)</p>
              </div>

              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-900">
                  Store Name
                </label>
                <input
                  id="storeName"
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Aling Maria's Sari-Sari"
                />
              </div>

              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-900">
                  Create PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  pattern="[0-9]{4,6}"
                  maxLength={6}
                  inputMode="numeric"
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="••••"
                />
                <p className="mt-1 text-xs text-gray-500">4-6 digits</p>
              </div>

              <div>
                <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-900">
                  Confirm PIN
                </label>
                <input
                  id="confirmPin"
                  type="password"
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  pattern="[0-9]{4,6}"
                  maxLength={6}
                  inputMode="numeric"
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-teal-600 hover:text-teal-700 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
