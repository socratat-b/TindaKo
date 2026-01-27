'use server'

import { db } from '@/lib/db'
import { useSyncStore } from '@/lib/stores/sync-store'

// Helper to mark pending changes (works on client-side only)
const markPendingChanges = () => {
  if (typeof window !== 'undefined') {
    useSyncStore.getState().setHasPendingChanges(true)
  }
}

export type RecordPaymentInput = {
  storePhone: string
  customerId: string
  amount: number
  notes?: string
}

export type RecordChargeInput = {
  storePhone: string
  customerId: string
  amount: number
  notes: string // Required for manual charges
}

export type UtangActionResult = {
  success: boolean
  error?: string
  transactionId?: string
}

export async function recordPayment(
  _prevState: UtangActionResult | null,
  formData: FormData
): Promise<UtangActionResult> {
  try {
    const storePhone = formData.get('storePhone') as string
    const customerId = formData.get('customerId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const notes = formData.get('notes') as string | undefined

    // 1. Validate inputs
    if (!storePhone || !customerId) {
      return { success: false, error: 'Missing required fields' }
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    // 2. Get customer
    const customer = await db.customers.get(customerId)
    if (!customer || customer.isDeleted || customer.storePhone !== storePhone) {
      return { success: false, error: 'Customer not found' }
    }

    // 3. Validate payment doesn't exceed balance
    if (amount > customer.totalUtang) {
      return {
        success: false,
        error: `Payment (₱${amount.toFixed(2)}) exceeds balance (₱${customer.totalUtang.toFixed(2)})`,
      }
    }

    // 4. Atomic transaction
    const now = new Date().toISOString()
    const transactionId = crypto.randomUUID()
    const newBalance = customer.totalUtang - amount

    await db.transaction('rw', [db.customers, db.utangTransactions], async () => {
      // Update customer
      await db.customers.update(customerId, {
        totalUtang: newBalance,
        updatedAt: now,
        syncedAt: null,
      })

      // Create transaction
      await db.utangTransactions.add({
        id: transactionId,
        storePhone,
        customerId,
        saleId: null,
        type: 'payment',
        amount,
        balanceAfter: newBalance,
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
        syncedAt: null,
        isDeleted: false,
      })
    })

    markPendingChanges()

    return { success: true, transactionId }
  } catch (error) {
    console.error('Error recording payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record payment',
    }
  }
}

export async function recordManualCharge(
  _prevState: UtangActionResult | null,
  formData: FormData
): Promise<UtangActionResult> {
  try {
    const storePhone = formData.get('storePhone') as string
    const customerId = formData.get('customerId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const notes = formData.get('notes') as string

    // 1. Validate inputs
    if (!storePhone || !customerId || !notes) {
      return { success: false, error: 'Missing required fields' }
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    if (notes.trim().length === 0) {
      return { success: false, error: 'Notes are required for manual charges' }
    }

    // 2. Get customer
    const customer = await db.customers.get(customerId)
    if (!customer || customer.isDeleted || customer.storePhone !== storePhone) {
      return { success: false, error: 'Customer not found' }
    }

    // 3. Atomic transaction
    const now = new Date().toISOString()
    const transactionId = crypto.randomUUID()
    const newBalance = customer.totalUtang + amount

    await db.transaction('rw', [db.customers, db.utangTransactions], async () => {
      // Update customer
      await db.customers.update(customerId, {
        totalUtang: newBalance,
        updatedAt: now,
        syncedAt: null,
      })

      // Create transaction
      await db.utangTransactions.add({
        id: transactionId,
        storePhone,
        customerId,
        saleId: null,
        type: 'charge',
        amount,
        balanceAfter: newBalance,
        notes,
        createdAt: now,
        updatedAt: now,
        syncedAt: null,
        isDeleted: false,
      })
    })

    markPendingChanges()

    return { success: true, transactionId }
  } catch (error) {
    console.error('Error recording manual charge:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record charge',
    }
  }
}
