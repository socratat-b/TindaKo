import { db } from '@/lib/db'
import { useSyncStore } from '@/lib/stores/sync-store'

// Helper to mark pending changes (works on client-side only)
const markPendingChanges = () => {
  if (typeof window !== 'undefined') {
    useSyncStore.getState().setHasPendingChanges(true)
  }
}

export type RecordPaymentInput = {
  userId: string
  customerId: string
  amount: number
  notes?: string
}

export type RecordChargeInput = {
  userId: string
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
    const userId = formData.get('userId') as string
    const customerId = formData.get('customerId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const notes = formData.get('notes') as string | undefined

    // 1. Validate inputs
    if (!userId || !customerId) {
      return { success: false, error: 'Missing required fields' }
    }

    // Round to 2 decimal places for PHP currency
    const roundedAmount = Math.round(amount * 100) / 100

    if (isNaN(roundedAmount) || roundedAmount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    // Validate max value (10 million PHP)
    if (roundedAmount > 10000000) {
      return { success: false, error: 'Amount exceeds maximum allowed value of ₱10,000,000' }
    }

    // 2. Get customer
    const customer = await db.customers.get(customerId)
    if (!customer || customer.isDeleted || customer.userId !== userId) {
      return { success: false, error: 'Customer not found' }
    }

    // 3. Validate payment doesn't exceed balance
    if (roundedAmount > customer.totalUtang) {
      return {
        success: false,
        error: `Payment (₱${roundedAmount.toFixed(2)}) exceeds balance (₱${customer.totalUtang.toFixed(2)})`,
      }
    }

    // 4. Atomic transaction
    const now = new Date().toISOString()
    const transactionId = crypto.randomUUID()
    const newBalance = customer.totalUtang - roundedAmount

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
        userId,
        customerId,
        saleId: null,
        type: 'payment',
        amount: roundedAmount,
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
    const userId = formData.get('userId') as string
    const customerId = formData.get('customerId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const notes = formData.get('notes') as string

    // 1. Validate inputs
    if (!userId || !customerId || !notes) {
      return { success: false, error: 'Missing required fields' }
    }

    // Round to 2 decimal places for PHP currency
    const roundedAmount = Math.round(amount * 100) / 100

    if (isNaN(roundedAmount) || roundedAmount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    // Validate max value (10 million PHP)
    if (roundedAmount > 10000000) {
      return { success: false, error: 'Amount exceeds maximum allowed value of ₱10,000,000' }
    }

    if (notes.trim().length === 0) {
      return { success: false, error: 'Notes are required for manual charges' }
    }

    // 2. Get customer
    const customer = await db.customers.get(customerId)
    if (!customer || customer.isDeleted || customer.userId !== userId) {
      return { success: false, error: 'Customer not found' }
    }

    // 3. Atomic transaction
    const now = new Date().toISOString()
    const transactionId = crypto.randomUUID()
    const newBalance = customer.totalUtang + roundedAmount

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
        userId,
        customerId,
        saleId: null,
        type: 'charge',
        amount: roundedAmount,
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

// Client-callable versions (non-Server Actions) for direct usage in components
export type UtangOperationResult = {
  success: boolean
  error?: string
  transactionId?: string
}

export async function recordPaymentClient(
  input: RecordPaymentInput
): Promise<UtangOperationResult> {
  try {
    const { userId, customerId, amount, notes } = input

    // 1. Validate inputs
    if (!userId || !customerId) {
      return { success: false, error: 'Missing required fields' }
    }

    // Round to 2 decimal places for PHP currency
    const roundedAmount = Math.round(amount * 100) / 100

    if (isNaN(roundedAmount) || roundedAmount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    // Validate max value (10 million PHP)
    if (roundedAmount > 10000000) {
      return { success: false, error: 'Amount exceeds maximum allowed value of ₱10,000,000' }
    }

    // 2. Get customer
    const customer = await db.customers.get(customerId)
    if (!customer || customer.isDeleted || customer.userId !== userId) {
      return { success: false, error: 'Customer not found' }
    }

    // 3. Validate payment doesn't exceed balance
    if (roundedAmount > customer.totalUtang) {
      return {
        success: false,
        error: `Payment (₱${roundedAmount.toFixed(2)}) exceeds balance (₱${customer.totalUtang.toFixed(2)})`,
      }
    }

    // 4. Atomic transaction
    const now = new Date().toISOString()
    const transactionId = crypto.randomUUID()
    const newBalance = customer.totalUtang - roundedAmount

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
        userId,
        customerId,
        saleId: null,
        type: 'payment',
        amount: roundedAmount,
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

export async function recordManualChargeClient(
  input: RecordChargeInput
): Promise<UtangOperationResult> {
  try {
    const { userId, customerId, amount, notes } = input

    // 1. Validate inputs
    if (!userId || !customerId) {
      return { success: false, error: 'Missing required fields' }
    }

    // Round to 2 decimal places for PHP currency
    const roundedAmount = Math.round(amount * 100) / 100

    if (isNaN(roundedAmount) || roundedAmount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    // Validate max value (10 million PHP)
    if (roundedAmount > 10000000) {
      return { success: false, error: 'Amount exceeds maximum allowed value of ₱10,000,000' }
    }

    if (notes.trim().length === 0) {
      return { success: false, error: 'Notes are required for manual charges' }
    }

    // 2. Get customer
    const customer = await db.customers.get(customerId)
    if (!customer || customer.isDeleted || customer.userId !== userId) {
      return { success: false, error: 'Customer not found' }
    }

    // 3. Atomic transaction
    const now = new Date().toISOString()
    const transactionId = crypto.randomUUID()
    const newBalance = customer.totalUtang + roundedAmount

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
        userId,
        customerId,
        saleId: null,
        type: 'charge',
        amount: roundedAmount,
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
