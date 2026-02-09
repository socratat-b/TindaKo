'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useSettingsStore } from '@/lib/stores/settings-store'
import { db } from '@/lib/db'
import type { UserProfile } from '@/lib/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Store } from 'lucide-react'

/**
 * Store Setup Page
 * For first-time users to set their store name
 * Offline-first: saves to IndexedDB only — Supabase sync happens via manual backup
 */
export default function StoreSetupPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const [storeName, setStoreName] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)
  const [userProvider, setUserProvider] = useState<'google' | 'email'>('email')

  // Get authenticated user info from Supabase Auth session (not database)
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)
        setUserEmail(user.email || null)
        setUserAvatarUrl(user.user_metadata?.avatar_url || null)
        setUserProvider(user.app_metadata.provider === 'google' ? 'google' : 'email')

        // Check if profile already exists in IndexedDB
        const existingProfile = await db.userProfile.get(user.id)
        if (existingProfile) {
          router.push('/pos')
          return
        }

        setIsCheckingAuth(false)
      } catch {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
      const now = new Date().toISOString()

      // 1. Save profile to IndexedDB (offline-first)
      const userProfile: UserProfile = {
        id: userId!,
        email: userEmail!,
        storeName: trimmedName,
        avatarUrl: userAvatarUrl,
        provider: userProvider,
        createdAt: now,
        updatedAt: now,
      }
      await db.userProfile.clear()
      await db.userProfile.add(userProfile)

      // 2. Update Zustand stores
      setAuth(userId!, userEmail!, trimmedName, userAvatarUrl)
      updateSettings({ storeName: trimmedName })

      // 3. Update Supabase with the real store name (fire-and-forget, don't block)
      const supabase = createClient()
      supabase.from('stores')
        .update({ store_name: trimmedName, updated_at: now })
        .eq('id', userId!)
        .then(({ error: updateErr }) => {
          if (updateErr) console.warn('[StoreSetup] Supabase update failed (will sync later):', updateErr.message)
        })

      // Done — go to POS
      router.push('/pos')
    } catch (err) {
      console.error('[StoreSetup] Error saving to IndexedDB:', err)
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mb-4">
            <Store className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to TindaKo!</h1>
          <p className="mt-2 text-sm text-gray-600">Let&apos;s set up your store</p>
          {userEmail && (
            <p className="mt-2 text-xs text-gray-500">Signed in as: {userEmail}</p>
          )}
        </div>

        {/* Setup Form */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm px-8 py-10 shadow-2xl border-2 border-orange-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="storeName" className="text-base font-medium text-gray-900">
                What&apos;s your store name?
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
                className="h-12 text-base !bg-white text-gray-900"
                disabled={isPending}
                autoFocus
                maxLength={100}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl shadow-lg shadow-orange-500/30"
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
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>You can change your store name later in Settings</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
