import { db } from '@/lib/db'

export type CreateCustomerInput = {
  storePhone: string
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
    const { storePhone, name, phone, address } = input

    // Validate inputs
    if (!storePhone || !name || name.trim().length === 0) {
      return { success: false, error: 'Name is required' }
    }

    const trimmedPhone = phone?.trim() || null
    const trimmedName = name.trim()

    // Validate Philippine phone number format (if provided)
    if (trimmedPhone) {
      const phoneRegex = /^(09\d{9}|\+639\d{9})$/
      if (!phoneRegex.test(trimmedPhone)) {
        return {
          success: false,
          error: 'Invalid phone number. Use format: 09XXXXXXXXX (11 digits) or +639XXXXXXXXX',
        }
      }
    }

    // Check for duplicate phone number (if provided)
    if (trimmedPhone) {
      const existingCustomerWithPhone = await db.customers
        .where('storePhone')
        .equals(storePhone)
        .filter((c) => !c.isDeleted && c.phone === trimmedPhone)
        .first()

      if (existingCustomerWithPhone) {
        return {
          success: false,
          error: `Phone number ${trimmedPhone} is already registered to ${existingCustomerWithPhone.name}`,
        }
      }
    }

    // Check for duplicate name (case-insensitive warning)
    const existingCustomerWithName = await db.customers
      .where('storePhone')
      .equals(storePhone)
      .filter((c) => !c.isDeleted && c.name.toLowerCase() === trimmedName.toLowerCase())
      .first()

    if (existingCustomerWithName) {
      return {
        success: false,
        error: `A customer named "${existingCustomerWithName.name}" already exists. Use a different name or add details (e.g., "Juan - Barangay 1")`,
      }
    }

    const now = new Date().toISOString()
    const customerId = crypto.randomUUID()

    await db.customers.add({
      id: customerId,
      storePhone,
      name: trimmedName,
      phone: trimmedPhone,
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

    const trimmedPhone = phone?.trim() || null
    const trimmedName = name.trim()

    // Validate Philippine phone number format (if provided)
    if (trimmedPhone) {
      const phoneRegex = /^(09\d{9}|\+639\d{9})$/
      if (!phoneRegex.test(trimmedPhone)) {
        return {
          success: false,
          error: 'Invalid phone number. Use format: 09XXXXXXXXX (11 digits) or +639XXXXXXXXX',
        }
      }
    }

    // Check for duplicate phone number (if provided and changed)
    if (trimmedPhone && trimmedPhone !== customer.phone) {
      const existingCustomerWithPhone = await db.customers
        .where('storePhone')
        .equals(customer.storePhone)
        .filter((c) => !c.isDeleted && c.phone === trimmedPhone && c.id !== id)
        .first()

      if (existingCustomerWithPhone) {
        return {
          success: false,
          error: `Phone number ${trimmedPhone} is already registered to ${existingCustomerWithPhone.name}`,
        }
      }
    }

    // Check for duplicate name (if changed)
    if (trimmedName.toLowerCase() !== customer.name.toLowerCase()) {
      const existingCustomerWithName = await db.customers
        .where('storePhone')
        .equals(customer.storePhone)
        .filter((c) => !c.isDeleted && c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== id)
        .first()

      if (existingCustomerWithName) {
        return {
          success: false,
          error: `A customer named "${existingCustomerWithName.name}" already exists. Use a different name or add details (e.g., "Juan - Barangay 1")`,
        }
      }
    }

    const now = new Date().toISOString()

    await db.customers.update(id, {
      name: trimmedName,
      phone: trimmedPhone,
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
