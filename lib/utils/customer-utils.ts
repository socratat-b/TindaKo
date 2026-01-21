import { db } from '@/lib/db'

export type CreateCustomerInput = {
  userId: string
  name: string
  phone?: string
  address?: string
}

export type UpdateCustomerInput = {
  id: string
  name: string
  phone?: string
  address?: string
}

export type CustomerOperationResult = {
  success: boolean
  error?: string
  customerId?: string
}

export async function createCustomer(
  input: CreateCustomerInput
): Promise<CustomerOperationResult> {
  try {
    const { userId, name, phone, address } = input

    // Validate inputs
    if (!userId || !name || name.trim().length === 0) {
      return { success: false, error: 'Name is required' }
    }

    const now = new Date().toISOString()
    const customerId = crypto.randomUUID()

    await db.customers.add({
      id: customerId,
      userId,
      name: name.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      totalUtang: 0,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
      isDeleted: false,
    })

    return { success: true, customerId }
  } catch (error) {
    console.error('Error creating customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer',
    }
  }
}

export async function updateCustomer(
  input: UpdateCustomerInput
): Promise<CustomerOperationResult> {
  try {
    const { id, name, phone, address } = input

    // Validate inputs
    if (!id || !name || name.trim().length === 0) {
      return { success: false, error: 'Name is required' }
    }

    const customer = await db.customers.get(id)
    if (!customer || customer.isDeleted) {
      return { success: false, error: 'Customer not found' }
    }

    const now = new Date().toISOString()

    await db.customers.update(id, {
      name: name.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      updatedAt: now,
      syncedAt: null,
    })

    return { success: true, customerId: id }
  } catch (error) {
    console.error('Error updating customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update customer',
    }
  }
}

export async function deleteCustomer(customerId: string): Promise<CustomerOperationResult> {
  try {
    const customer = await db.customers.get(customerId)
    if (!customer || customer.isDeleted) {
      return { success: false, error: 'Customer not found' }
    }

    // Soft delete
    const now = new Date().toISOString()
    await db.customers.update(customerId, {
      isDeleted: true,
      updatedAt: now,
      syncedAt: null,
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete customer',
    }
  }
}
