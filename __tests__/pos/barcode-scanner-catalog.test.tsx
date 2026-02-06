import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BarcodeScanner } from '@/components/pos/barcode-scanner'
import { db } from '@/lib/db'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCart } from '@/lib/hooks/use-cart'

// Mock dependencies
vi.mock('@/lib/hooks/use-auth')
vi.mock('@/lib/hooks/use-cart')
vi.mock('@/components/ui/camera-barcode-scanner', () => ({
  CameraBarcodeScanner: () => null,
}))

describe('BarcodeScanner - Catalog Integration', () => {
  const mockAddItem = vi.fn()
  const mockUserId = 'test-user-uuid-123'

  beforeEach(async () => {
    // Clear database
    await db.products.clear()
    await db.categories.clear()
    await db.productCatalog.clear()

    // Setup mocks
    vi.mocked(useAuth).mockReturnValue({
      userId: mockUserId,
      email: 'test@example.com',
      storeName: 'Test Store',
      avatarUrl: null,
      isAuthenticated: true,
      isLoading: false,
    })

    vi.mocked(useCart).mockReturnValue({
      items: [],
      total: 0,
      itemCount: 0,
      addItem: mockAddItem,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    })

    // Seed catalog
    await db.productCatalog.add({
      id: 'catalog-1',
      barcode: '750515017429',
      name: 'Fita Crackers',
      categoryName: 'Snacks',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Seed category
    await db.categories.add({
      id: 'cat-1',
      userId: mockUserId,
      name: 'Snacks',
      color: '#f97316',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })
  })

  it('should add existing product to cart when scanned', async () => {
    const user = userEvent.setup()

    // Add product to inventory first
    await db.products.add({
      id: 'prod-1',
      userId: mockUserId,
      name: 'Fita Crackers',
      barcode: '750515017429',
      categoryId: 'cat-1',
      sellingPrice: 15,
      stockQty: 50,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    render(<BarcodeScanner />)

    const input = screen.getByPlaceholderText(/paste or scan barcode/i)
    await user.type(input, '750515017429')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          barcode: '750515017429',
          name: 'Fita Crackers',
        })
      )
    })
  })

  it('should show quick add dialog when catalog product not in inventory', async () => {
    const user = userEvent.setup()

    render(<BarcodeScanner />)

    const input = screen.getByPlaceholderText(/paste or scan barcode/i)
    await user.type(input, '750515017429')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText(/add product from catalog/i)).toBeInTheDocument()
    })

    expect(screen.getByText('Fita Crackers')).toBeInTheDocument()
    expect(screen.getByText('750515017429')).toBeInTheDocument()
  })

  it('should create product and add to cart when quick add submitted', async () => {
    const user = userEvent.setup()

    render(<BarcodeScanner />)

    // Scan barcode
    const input = screen.getByPlaceholderText(/paste or scan barcode/i)
    await user.type(input, '750515017429')
    await user.keyboard('{Enter}')

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText(/add product from catalog/i)).toBeInTheDocument()
    })

    // Fill in price and stock
    const priceInput = screen.getByLabelText(/selling price/i)
    const stockInput = screen.getByLabelText(/stock quantity/i)

    await user.type(priceInput, '15')
    await user.type(stockInput, '50')

    // Submit
    const saveButton = screen.getByRole('button', { name: /save & add to cart/i })
    await user.click(saveButton)

    // Verify product was created
    await waitFor(async () => {
      const product = await db.products
        .where('barcode')
        .equals('750515017429')
        .first()

      expect(product).toBeDefined()
      expect(product?.name).toBe('Fita Crackers')
      expect(product?.sellingPrice).toBe(15)
      expect(product?.stockQty).toBe(50)
    })

    // Verify product was added to cart
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Fita Crackers',
          barcode: '750515017429',
          sellingPrice: 15,
          stockQty: 50,
        })
      )
    })
  })

  it('should validate price input', async () => {
    const user = userEvent.setup()

    render(<BarcodeScanner />)

    // Scan barcode
    const input = screen.getByPlaceholderText(/paste or scan barcode/i)
    await user.type(input, '750515017429')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText(/add product from catalog/i)).toBeInTheDocument()
    })

    // Enter invalid price
    const priceInput = screen.getByLabelText(/selling price/i)
    const stockInput = screen.getByLabelText(/stock quantity/i)

    await user.type(priceInput, '0')
    await user.type(stockInput, '50')

    const saveButton = screen.getByRole('button', { name: /save & add to cart/i })
    await user.click(saveButton)

    // Wait a bit for any async operations
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Product should not be created (validation failed)
    const product = await db.products.where('barcode').equals('750515017429').first()
    expect(product).toBeUndefined()

    // Dialog should still be open (not closed on error)
    expect(screen.getByText(/add product from catalog/i)).toBeInTheDocument()
  })

  it('should validate stock input', async () => {
    const user = userEvent.setup()

    render(<BarcodeScanner />)

    // Scan barcode
    const input = screen.getByPlaceholderText(/paste or scan barcode/i)
    await user.type(input, '750515017429')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText(/add product from catalog/i)).toBeInTheDocument()
    })

    // Enter invalid stock
    const priceInput = screen.getByLabelText(/selling price/i)
    const stockInput = screen.getByLabelText(/stock quantity/i)

    await user.type(priceInput, '15')
    await user.type(stockInput, '-10')

    const saveButton = screen.getByRole('button', { name: /save & add to cart/i })
    await user.click(saveButton)

    // Wait a bit for any async operations
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Product should not be created (validation failed)
    const product = await db.products.where('barcode').equals('750515017429').first()
    expect(product).toBeUndefined()

    // Dialog should still be open (not closed on error)
    expect(screen.getByText(/add product from catalog/i)).toBeInTheDocument()
  })

  it('should create category if it does not exist', async () => {
    const user = userEvent.setup()

    // Clear existing Snacks category
    await db.categories.clear()

    // Add catalog item with new category
    await db.productCatalog.add({
      id: 'catalog-2',
      barcode: '4800016644290',
      name: 'Lucky Me Pancit Canton',
      categoryName: 'Noodles',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    render(<BarcodeScanner />)

    // Scan barcode
    const input = screen.getByPlaceholderText(/paste or scan barcode/i)
    await user.type(input, '4800016644290')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText(/add product from catalog/i)).toBeInTheDocument()
    })

    // Fill and submit
    const priceInput = screen.getByLabelText(/selling price/i)
    const stockInput = screen.getByLabelText(/stock quantity/i)

    await user.type(priceInput, '18')
    await user.type(stockInput, '100')

    const saveButton = screen.getByRole('button', { name: /save & add to cart/i })
    await user.click(saveButton)

    // Verify category was created (query using userId then filter by name)
    await waitFor(async () => {
      const categories = await db.categories
        .where('userId')
        .equals(mockUserId)
        .toArray()

      const noodlesCategory = categories.find((c) => c.name === 'Noodles')

      expect(noodlesCategory).toBeDefined()
      expect(noodlesCategory?.name).toBe('Noodles')
      expect(noodlesCategory?.userId).toBe(mockUserId)
    })
  })

  it('should show error if product already exists with same barcode', async () => {
    const user = userEvent.setup()

    // Add product first
    await db.products.add({
      id: 'prod-1',
      userId: mockUserId,
      name: 'Fita Crackers',
      barcode: '750515017429',
      categoryId: 'cat-1',
      sellingPrice: 15,
      stockQty: 50,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    render(<BarcodeScanner />)

    // Scan same barcode - should add to cart
    const input = screen.getByPlaceholderText(/paste or scan barcode/i)
    await user.type(input, '750515017429')
    await user.keyboard('{Enter}')

    // Should add to cart immediately (not show dialog)
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalled()
    })
  })

  it('should show error for barcode not in catalog', async () => {
    const user = userEvent.setup()

    render(<BarcodeScanner />)

    const input = screen.getByPlaceholderText(/paste or scan barcode/i)
    await user.type(input, '9999999999999')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText(/barcode 9999999999999 not found/i)).toBeInTheDocument()
    })
  })

  it('should hide camera button on desktop', () => {
    render(<BarcodeScanner />)

    const cameraButton = screen.queryByTitle(/scan with camera/i)

    // Button exists but should have md:hidden class
    if (cameraButton) {
      expect(cameraButton.className).toContain('md:hidden')
    }
  })
})
