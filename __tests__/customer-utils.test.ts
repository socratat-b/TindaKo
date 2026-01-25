import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import { createCustomer, updateCustomer } from '@/lib/utils/customer-utils'

describe('Customer Utils', () => {
  const testUserId = 'test-user-123'

  beforeEach(async () => {
    // Clear customers table before each test
    await db.customers.clear()
  })

  describe('createCustomer', () => {
    it('should create a new customer with all fields', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: 'Juan Dela Cruz',
        phone: '09171234567',
        address: '123 Main St, Barangay Centro',
      })

      expect(result.success).toBe(true)
      expect(result.customerId).toBeDefined()

      // Verify customer was added to database
      const customer = await db.customers.get(result.customerId!)
      expect(customer).toBeDefined()
      expect(customer?.name).toBe('Juan Dela Cruz')
      expect(customer?.phone).toBe('09171234567')
      expect(customer?.address).toBe('123 Main St, Barangay Centro')
      expect(customer?.userId).toBe(testUserId)
      expect(customer?.totalUtang).toBe(0)
      expect(customer?.isDeleted).toBe(false)
      expect(customer?.syncedAt).toBeNull()
    })

    it('should create a customer with only required fields', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: 'Maria Santos',
      })

      expect(result.success).toBe(true)

      const customer = await db.customers.get(result.customerId!)
      expect(customer?.name).toBe('Maria Santos')
      expect(customer?.phone).toBeNull()
      expect(customer?.address).toBeNull()
      expect(customer?.totalUtang).toBe(0)
    })

    it('should trim whitespace from name', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: '  Jose Rizal  ',
        phone: '  09181234567  ',
        address: '  456 Side St  ',
      })

      expect(result.success).toBe(true)

      const customer = await db.customers.get(result.customerId!)
      expect(customer?.name).toBe('Jose Rizal')
      expect(customer?.phone).toBe('09181234567')
      expect(customer?.address).toBe('456 Side St')
    })

    it('should fail if name is empty', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Name is required')
    })

    it('should fail if name is only whitespace', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: '   ',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Name is required')
    })

    it('should fail if userId is missing', async () => {
      const result = await createCustomer({
        userId: '',
        name: 'Test User',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Name is required')
    })

    it('should create customer and verify it appears in query results', async () => {
      // Create a customer
      const result = await createCustomer({
        userId: testUserId,
        name: 'Test Customer',
      })

      expect(result.success).toBe(true)

      // Query all customers for this user
      const customers = await db.customers
        .where('userId')
        .equals(testUserId)
        .filter((c) => !c.isDeleted)
        .toArray()

      expect(customers).toHaveLength(1)
      expect(customers[0].name).toBe('Test Customer')
      expect(customers[0].totalUtang).toBe(0)
    })

    it('should create multiple customers and all should be queryable', async () => {
      // Create multiple customers
      await createCustomer({ userId: testUserId, name: 'Customer 1' })
      await createCustomer({ userId: testUserId, name: 'Customer 2' })
      await createCustomer({ userId: testUserId, name: 'Customer 3' })

      // Query all customers
      const customers = await db.customers
        .where('userId')
        .equals(testUserId)
        .filter((c) => !c.isDeleted)
        .toArray()

      expect(customers).toHaveLength(3)
      const names = customers.map((c) => c.name).sort()
      expect(names).toEqual(['Customer 1', 'Customer 2', 'Customer 3'])
    })

    it('should prevent duplicate phone numbers', async () => {
      // Create first customer with phone
      const result1 = await createCustomer({
        userId: testUserId,
        name: 'Juan Dela Cruz',
        phone: '09171234567',
      })

      expect(result1.success).toBe(true)

      // Try to create second customer with same phone
      const result2 = await createCustomer({
        userId: testUserId,
        name: 'Maria Santos',
        phone: '09171234567',
      })

      expect(result2.success).toBe(false)
      expect(result2.error).toContain('Phone number 09171234567 is already registered')
      expect(result2.error).toContain('Juan Dela Cruz')
    })

    it('should allow customers with no phone numbers', async () => {
      // Create multiple customers without phone numbers
      const result1 = await createCustomer({
        userId: testUserId,
        name: 'Customer Without Phone 1',
      })

      const result2 = await createCustomer({
        userId: testUserId,
        name: 'Customer Without Phone 2',
      })

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })

    it('should prevent duplicate names (case-insensitive)', async () => {
      // Create first customer
      const result1 = await createCustomer({
        userId: testUserId,
        name: 'Juan Dela Cruz',
      })

      expect(result1.success).toBe(true)

      // Try to create customer with same name (different case)
      const result2 = await createCustomer({
        userId: testUserId,
        name: 'juan dela cruz',
      })

      expect(result2.success).toBe(false)
      expect(result2.error).toContain('customer named')
      expect(result2.error).toContain('already exists')
    })

    it('should suggest adding details for duplicate names', async () => {
      // Create first customer
      await createCustomer({
        userId: testUserId,
        name: 'Juan',
      })

      // Try to create duplicate
      const result = await createCustomer({
        userId: testUserId,
        name: 'Juan',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Use a different name or add details')
      expect(result.error).toContain('Barangay')
    })

    it('should allow same name for different users', async () => {
      const user1 = 'user-1'
      const user2 = 'user-2'

      const result1 = await createCustomer({
        userId: user1,
        name: 'Juan Dela Cruz',
      })

      const result2 = await createCustomer({
        userId: user2,
        name: 'Juan Dela Cruz',
      })

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })

    it('should accept valid Philippine phone number format (11 digits)', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: 'Test User',
        phone: '09171234567',
      })

      expect(result.success).toBe(true)
      const customer = await db.customers.get(result.customerId!)
      expect(customer?.phone).toBe('09171234567')
    })

    it('should accept valid Philippine phone number format (international)', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: 'Test User',
        phone: '+639171234567',
      })

      expect(result.success).toBe(true)
      const customer = await db.customers.get(result.customerId!)
      expect(customer?.phone).toBe('+639171234567')
    })

    it('should reject invalid phone number format (too short)', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: 'Test User',
        phone: '091712345',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid phone number')
    })

    it('should reject invalid phone number format (wrong prefix)', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: 'Test User',
        phone: '08171234567',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid phone number')
    })

    it('should reject invalid phone number format (too long)', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: 'Test User',
        phone: '091712345678',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid phone number')
    })

    it('should reject invalid international format', async () => {
      const result = await createCustomer({
        userId: testUserId,
        name: 'Test User',
        phone: '+6391712345',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid phone number')
    })
  })

  describe('updateCustomer', () => {
    it('should update customer information', async () => {
      // Create a customer first
      const createResult = await createCustomer({
        userId: testUserId,
        name: 'Original Name',
        phone: '09171111111',
      })

      expect(createResult.success).toBe(true)

      // Update the customer
      const updateResult = await updateCustomer({
        id: createResult.customerId!,
        name: 'Updated Name',
        phone: '09172222222',
        address: 'New Address',
      })

      expect(updateResult.success).toBe(true)

      // Verify updates
      const customer = await db.customers.get(createResult.customerId!)
      expect(customer?.name).toBe('Updated Name')
      expect(customer?.phone).toBe('09172222222')
      expect(customer?.address).toBe('New Address')
      expect(customer?.syncedAt).toBeNull() // Should reset sync status
    })

    it('should fail to update non-existent customer', async () => {
      const result = await updateCustomer({
        id: 'non-existent-id',
        name: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Customer not found')
    })

    it('should fail to update deleted customer', async () => {
      // Create and soft delete a customer
      const createResult = await createCustomer({
        userId: testUserId,
        name: 'To Be Deleted',
      })

      await db.customers.update(createResult.customerId!, {
        isDeleted: true,
      })

      // Try to update
      const updateResult = await updateCustomer({
        id: createResult.customerId!,
        name: 'Should Fail',
      })

      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toBe('Customer not found')
    })

    it('should prevent updating to duplicate phone number', async () => {
      // Create two customers
      const result1 = await createCustomer({
        userId: testUserId,
        name: 'Customer 1',
        phone: '09171111111',
      })

      const result2 = await createCustomer({
        userId: testUserId,
        name: 'Customer 2',
        phone: '09172222222',
      })

      // Try to update customer 2's phone to customer 1's phone
      const updateResult = await updateCustomer({
        id: result2.customerId!,
        name: 'Customer 2',
        phone: '09171111111',
      })

      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toContain('Phone number 09171111111 is already registered')
      expect(updateResult.error).toContain('Customer 1')
    })

    it('should prevent updating to duplicate name', async () => {
      // Create two customers
      const result1 = await createCustomer({
        userId: testUserId,
        name: 'Juan Dela Cruz',
      })

      const result2 = await createCustomer({
        userId: testUserId,
        name: 'Maria Santos',
      })

      // Try to update customer 2's name to customer 1's name
      const updateResult = await updateCustomer({
        id: result2.customerId!,
        name: 'juan dela cruz', // Different case
      })

      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toContain('customer named')
      expect(updateResult.error).toContain('already exists')
    })

    it('should allow updating own phone number', async () => {
      // Create customer
      const createResult = await createCustomer({
        userId: testUserId,
        name: 'Test Customer',
        phone: '09171234567',
      })

      // Update with same phone (should succeed)
      const updateResult = await updateCustomer({
        id: createResult.customerId!,
        name: 'Test Customer Updated',
        phone: '09171234567',
      })

      expect(updateResult.success).toBe(true)
    })
  })
})
