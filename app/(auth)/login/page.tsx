'use client'

import { useActionState } from 'react'
import { motion } from 'framer-motion'
import { loginAction } from '@/lib/actions/auth'
import Link from 'next/link'
import { SubmitButton } from '@/components/auth/submit-button'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {})

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
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
        >
          <form action={formAction} className="space-y-6">
            {state.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                {state.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <SubmitButton isPending={isPending}>
              Sign in
            </SubmitButton>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-teal-600 hover:text-teal-700 transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
