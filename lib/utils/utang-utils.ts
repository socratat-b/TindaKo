import { db } from '@/lib/db'

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
  notes?: string
}

export type UtangOperationResult = {
  success: boolean
  error?: string
  transactionId?: string
}

export async function recordPayment(
  input: RecordPaymentInput
): Promise<UtangOperationResult> {
  try {
    const { userId, customerId, amount, notes } = input

    // 1. Validate inputs
    if (!userId || !customerId) {
      return { success: false, error: 'Missing required fields' }
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    // 2. Get customer
    const customer = await db.customers.get(customerId)
    if (!customer || customer.isDeleted || customer.userId !== userId) {
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
        userId,
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
  input: RecordChargeInput
): Promise<UtangOperationResult> {
  try {
    const { userId, customerId, amount, notes } = input

    // 1. Validate inputs
    if (!userId || !customerId) {
      return { success: false, error: 'Missing required fields' }
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    // 2. Get customer
    const customer = await db.customers.get(customerId)
    if (!customer || customer.isDeleted || customer.userId !== userId) {
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
        userId,
        customerId,
        saleId: null,
        type: 'charge',
        amount,
        balanceAfter: newBalance,
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
        syncedAt: null,
        isDeleted: false,
      })
    })

    return { success: true, transactionId }
  } catch (error) {
    console.error('Error recording manual charge:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record charge',
    }
  }
}
