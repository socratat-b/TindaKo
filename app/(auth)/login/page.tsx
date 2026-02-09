'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Store, ArrowLeft, Sparkles, Shield, Mail, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

/**
 * Login Page
 * Supports Google OAuth and Email/Password sign-in
 */
export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/pos')
    }
  }, [isAuthenticated, isLoading, router])

  const handleGoogleSignIn = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.warn('[Login] OAuth error:', error.message)
        setError('Failed to sign in with Google. Please try again.')
      }
    } catch (err) {
      console.error('[Login] Error:', err)
      setError('An error occurred. Please try again.')
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.warn('[Login] Email sign-in error:', error.message)
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account first.')
        } else if (error.message.includes('rate limit')) {
          setError('Too many attempts. Please wait a moment and try again.')
        } else {
          setError(error.message)
        }
      } else {
        // Sign-in successful — redirect to POS
        router.push('/pos')
      }
    } catch (err) {
      console.error('[Login] Error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-800">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Noise Texture Overlay — identical to landing page */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />

      {/* Decorative Grid Pattern — identical to landing page */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(217, 119, 6) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(217, 119, 6) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Blurred accent blobs — identical to landing page hero */}
      <div className="fixed -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-emerald-500/15 to-green-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 w-64 h-64 bg-gradient-to-bl from-rose-400/20 to-pink-500/20 rounded-3xl blur-2xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-400 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Bumalik
          </Link>
        </motion.div>

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          {/* Logo Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="inline-flex relative mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl blur-xl opacity-60" />
            <div className="relative bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl p-5 shadow-2xl">
              <Store className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          <h1
            className="text-5xl font-black tracking-tight mb-2"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
              TindaKo
            </span>
          </h1>
          <p className="text-base font-semibold text-gray-600">
            Offline-first POS for Sari-Sari Stores
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative bg-white/80 backdrop-blur-sm rounded-3xl px-8 py-10 shadow-2xl border-2 border-orange-200/50 overflow-hidden"
        >
          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300/50 rounded-full mb-4">
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-bold text-orange-800 tracking-wide">SECURE LOGIN</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Welcome Back!
              </h2>
              <p className="mt-2 text-sm text-gray-600 font-medium">
                Mag-sign in para magsimula
              </p>
            </div>

            {/* Google Sign-in */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGoogleSignIn}
                className="w-full h-14 text-base font-bold bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/80 px-4 text-sm font-bold text-gray-500">
                  O mag-login gamit email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-sm text-red-700 font-medium"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 text-base border-2 border-input rounded-xl !bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 h-12 text-base border-2 border-input rounded-xl !bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Privacy Links */}
            <div className="text-center text-xs text-gray-500 mt-6">
              <p className="font-medium">By signing in, you agree to our</p>
              <div className="mt-2 flex justify-center gap-3">
                <Link
                  href="/terms-of-service"
                  className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors"
                >
                  Terms of Service
                </Link>
                <span className="text-gray-300">&middot;</span>
                <Link
                  href="/privacy-policy"
                  className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600 mb-3">
            Walang account?
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-orange-700 bg-white border-2 border-orange-300 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Mag-sign up dito — Libre!
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
