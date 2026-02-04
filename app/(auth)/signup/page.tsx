'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Store, ArrowLeft, Sparkles, Shield, Zap, Heart } from 'lucide-react'
import Link from 'next/link'

/**
 * OAuth Signup Page
 * Supports Google and Facebook sign-in (auto-creates account)
 */
export default function SignupPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/pos')
    }
  }, [isAuthenticated, isLoading, router])

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('[Signup] OAuth error:', error)
        alert(`Failed to sign up with ${provider}. Please try again.`)
      }
    } catch (err) {
      console.error('[Signup] Error:', err)
      alert('An error occurred. Please try again.')
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
          <p className="text-sm font-semibold text-gray-700">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Noise Texture */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />

      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            x: [0, 30, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 -left-32 w-80 h-80 bg-gradient-to-tr from-emerald-500/15 to-green-600/15"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
        />
      </div>

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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-xl hover:bg-white hover:border-orange-400 transition-all duration-300 shadow-sm hover:shadow-md"
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
          <p className="text-base font-semibold text-gray-700">
            Offline-first POS for Sari-Sari Stores
          </p>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative bg-white/90 backdrop-blur-sm rounded-3xl px-8 py-10 shadow-2xl border-2 border-orange-200 overflow-hidden"
        >
          {/* Decorative Corner */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full opacity-50" />

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-bold text-orange-800 tracking-wide">LIBRE • WALANG BAYAD</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                Simulan Mo Na!
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                Mag-sign up gamit ang Google o Facebook
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-4">
              {/* Google Sign-up */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => handleOAuthSignIn('google')}
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
                  Sign up with Google
                </Button>
              </motion.div>

              {/* Facebook Sign-up */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => handleOAuthSignIn('facebook')}
                  className="w-full h-14 text-base font-bold bg-[#1877F2] hover:bg-[#0C63D4] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <svg className="h-6 w-6" fill="white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Sign up with Facebook
                </Button>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm font-bold text-gray-500">
                  Bakit TindaKo?
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              {[
                { icon: Zap, text: 'Setup in 2 minutes - walang hassle' },
                { icon: Shield, text: 'Secure & safe - protected data' },
                { icon: Store, text: 'Works offline - 30 days capability' },
                { icon: Heart, text: '100% FREE - walang bayad forever' }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-700">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Privacy Links */}
            <div className="text-center text-xs text-gray-600">
              <p className="font-medium">By signing up, you agree to our</p>
              <div className="mt-2 flex justify-center gap-3">
                <Link
                  href="/terms-of-service"
                  className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors"
                >
                  Terms of Service
                </Link>
                <span className="text-gray-400">·</span>
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
          <p className="text-sm text-gray-600">
            May account ka na?{' '}
            <Link href="/login" className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
              Mag-log in dito
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
