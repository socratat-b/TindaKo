'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { setupStoreAction } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Store } from 'lucide-react'

/**
 * Store Setup Page
 * For first-time OAuth users to set their store name
 */
export default function StoreSetupPage() {
  const router = useRouter()
  const [storeName, setStoreName] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Check if user is authenticated
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Not authenticated - redirect to login
        router.push('/login')
        return
      }

      setUserEmail(user.email || null)
      setIsCheckingAuth(false)

      // Check if user already has a profile (shouldn't be here)
      const { data: profile } = await supabase
        .from('stores')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Already has profile - redirect to POS
        router.push('/pos')
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate store name
    const trimmedName = storeName.trim()
    if (!trimmedName) {
      setError('Please enter your store name')
      return
    }

    if (trimmedName.length < 2) {
      setError('Store name must be at least 2 characters')
      return
    }

    setIsPending(true)

    try {
      const result = await setupStoreAction(trimmedName)

      if (!result.success) {
        setError(result.error || 'Failed to setup store')
        setIsPending(false)
        return
      }

      // Success - redirect to POS
      console.log('[StoreSetup] Setup complete, redirecting to POS')
      router.push('/pos')
    } catch (err) {
      console.error('[StoreSetup] Error:', err)
      setError('An error occurred. Please try again.')
      setIsPending(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Store className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to TindaKo!</h1>
          <p className="mt-2 text-sm text-gray-600">Let's set up your store</p>
          {userEmail && (
            <p className="mt-2 text-xs text-gray-500">Signed in as: {userEmail}</p>
          )}
        </div>

        {/* Setup Form */}
        <div className="rounded-lg bg-white px-8 py-10 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="storeName" className="text-base font-medium">
                What's your store name?
              </Label>
              <p className="text-sm text-gray-500 mt-1 mb-3">
                This will be displayed in your POS system
              </p>
              <Input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g., Aling Maria's Sari-Sari Store"
                className="h-12 text-base"
                disabled={isPending}
                autoFocus
                maxLength={100}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isPending || !storeName.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Continue to POS'
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t text-center text-xs text-gray-500">
            <p>You can change your store name later in Settings</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
