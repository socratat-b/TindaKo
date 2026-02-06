import { db } from '@/lib/db'
import type { Product, Category } from '@/lib/db/schema'
import { useProductsStore } from '@/lib/stores/products-store'
import { useSyncStore } from '@/lib/stores/sync-store'

// Helper to refresh products store (works on client-side only)
const refreshStore = (userId: string) => {
  if (typeof window !== 'undefined') {
    useProductsStore.getState().refreshProducts(userId)
    useSyncStore.getState().setHasPendingChanges(true)
  }
}

export interface CreateProductInput {
  name: string
  barcode: string | null
  categoryId: string
  sellingPrice: number
  stockQty: number
  lowStockThreshold: number
  userId: string
}

export interface CreateCategoryInput {
  name: string
  color: string
  sortOrder: number
  userId: string
}

/**
 * Create a new product
 */
export async function createProduct(data: CreateProductInput): Promise<string> {
  const now = new Date().toISOString()
  const productId = crypto.randomUUID()

  try {
    // Validate product name
    const trimmedName = data.name.trim()
    if (!trimmedName) {
      throw new Error('Product name cannot be empty')
    }

    // Validate selling price
    if (data.sellingPrice <= 0) {
      throw new Error('Selling price must be greater than zero')
    }

    // Validate category exists
    const category = await db.categories.get(data.categoryId)
    if (!category || category.isDeleted) {
      throw new Error('Invalid category. The selected category does not exist.')
    }

    // Check if barcode already exists (within same user)
    if (data.barcode) {
      const trimmedBarcode = data.barcode.trim()
      if (trimmedBarcode) {
        const existing = await db.products
          .where('barcode')
          .equals(trimmedBarcode)
          .and((p) => !p.isDeleted && p.userId === data.userId)
          .first()

        if (existing) {
          throw new Error('A product with this barcode already exists')
        }
      }
    }

    const product: Product = {
      id: productId,
      userId: data.userId,
      name: trimmedName,
      barcode: data.barcode?.trim() || null,
      categoryId: data.categoryId,
      sellingPrice: data.sellingPrice,
      stockQty: data.stockQty,
      lowStockThreshold: data.lowStockThreshold,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
      isDeleted: false,
    }

    await db.products.add(product)

    // Refresh products store
    refreshStore(data.userId)

    return productId
  } catch (error) {
    console.error('Failed to create product:', error)
    throw error
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  data: Partial<CreateProductInput>
): Promise<void> {
  const now = new Date().toISOString()

  try {
    const product = await db.products.get(id)
    if (!product || product.isDeleted) {
      throw new Error('Product not found')
    }

    // Validate product name if provided
    if (data.name !== undefined) {
      const trimmedName = data.name.trim()
      if (!trimmedName) {
        throw new Error('Product name cannot be empty')
      }
    }

    // Validate selling price if provided
    if (data.sellingPrice !== undefined && data.sellingPrice <= 0) {
      throw new Error('Selling price must be greater than zero')
    }

    // If barcode is being updated, check for duplicates (within same user)
    if (data.barcode !== undefined && data.barcode !== product.barcode) {
      const trimmedBarcode = data.barcode ? data.barcode.trim() : ''
      if (trimmedBarcode) {
        const existing = await db.products
          .where('barcode')
          .equals(trimmedBarcode)
          .and((p) => !p.isDeleted && p.id !== id && p.userId === product.userId)
          .first()

        if (existing) {
          throw new Error('A product with this barcode already exists')
        }
      }
    }

    // If category is being updated, validate it exists
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await db.categories.get(data.categoryId)
      if (!category || category.isDeleted) {
        throw new Error('Invalid category. The selected category does not exist.')
      }
    }

    // Build update object conditionally to avoid overwriting fields with undefined/null
    const updateData: Partial<Product> = {
      updatedAt: now,
      syncedAt: null,
    }

    // Only include fields that are actually provided
    if (data.name !== undefined) {
      updateData.name = data.name.trim()
    }
    if (data.barcode !== undefined) {
      updateData.barcode = data.barcode ? data.barcode.trim() || null : null
    }
    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId
    }
    if (data.sellingPrice !== undefined) {
      updateData.sellingPrice = data.sellingPrice
    }
    if (data.stockQty !== undefined) {
      updateData.stockQty = data.stockQty
    }
    if (data.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = data.lowStockThreshold
    }

    await db.products.update(id, updateData)

    // Refresh products store
    refreshStore(product.userId)
  } catch (error) {
    console.error('Failed to update product:', error)
    throw error
  }
}

/**
 * Delete a product (soft delete)
 */
export async function deleteProduct(id: string): Promise<void> {
  const now = new Date().toISOString()

  try {
    const product = await db.products.get(id)
    if (!product || product.isDeleted) {
      throw new Error('Product not found')
    }

    await db.products.update(id, {
      isDeleted: true,
      updatedAt: now,
      syncedAt: null,
    })

    // Refresh products store
    refreshStore(product.userId)
  } catch (error) {
    console.error('Failed to delete product:', error)
    throw error
  }
}

/**
 * Create a new category
 */
export async function createCategory(data: CreateCategoryInput): Promise<string> {
  const now = new Date().toISOString()
  const categoryId = crypto.randomUUID()

  try {
    // Validate category name
    const trimmedName = data.name.trim()
    if (!trimmedName) {
      throw new Error('Category name cannot be empty')
    }

    // Check if category name already exists (within same user)
    const existing = await db.categories
      .filter((c) =>
        c.userId === data.userId &&
        !c.isDeleted &&
        c.name.toLowerCase() === trimmedName.toLowerCase()
      )
      .first()

    if (existing) {
      throw new Error('A category with this name already exists')
    }

    // Auto-assign sortOrder if not provided (get max + 1)
    let sortOrder = data.sortOrder
    if (sortOrder === undefined || sortOrder === null) {
      const categories = await db.categories
        .where('userId')
        .equals(data.userId)
        .and((c) => !c.isDeleted)
        .toArray()

      const maxOrder = categories.reduce((max, cat) =>
        Math.max(max, cat.sortOrder || 0), 0
      )
      sortOrder = maxOrder + 1
    }

    const category: Category = {
      id: categoryId,
      userId: data.userId,
      name: trimmedName,
      color: data.color,
      sortOrder: sortOrder,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
      isDeleted: false,
    }

    await db.categories.add(category)

    // Refresh products store
    refreshStore(data.userId)

    return categoryId
  } catch (error) {
    console.error('Failed to create category:', error)
    throw error
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  data: Partial<CreateCategoryInput>
): Promise<void> {
  const now = new Date().toISOString()

  try {
    const category = await db.categories.get(id)
    if (!category || category.isDeleted) {
      throw new Error('Category not found')
    }

    // If name is being updated, check for duplicates (within same user)
    if (data.name && data.name.trim() !== category.name) {
      const trimmedName = data.name.trim().toLowerCase()
      const existing = await db.categories
        .filter((c) =>
          c.userId === category.userId &&
          !c.isDeleted &&
          c.id !== id &&
          c.name.toLowerCase() === trimmedName
        )
        .first()

      if (existing) {
        throw new Error('A category with this name already exists')
      }
    }

    // Build update object conditionally to avoid overwriting fields with undefined
    const updateData: Partial<Category> = {
      updatedAt: now,
      syncedAt: null,
    }

    // Only include fields that are actually provided
    if (data.name !== undefined) {
      updateData.name = data.name.trim()
    }
    if (data.color !== undefined) {
      updateData.color = data.color
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder
    }

    await db.categories.update(id, updateData)

    // Refresh products store
    refreshStore(category.userId)
  } catch (error) {
    console.error('Failed to update category:', error)
    throw error
  }
}

/**
 * Delete a category (soft delete)
 * Validates that no active products are using this category before deletion
 */
export async function deleteCategory(id: string): Promise<void> {
  const now = new Date().toISOString()

  try {
    const category = await db.categories.get(id)
    if (!category || category.isDeleted) {
      throw new Error('Category not found')
    }

    // Check if any active (non-deleted) products are using this category
    const productsInCategory = await db.products
      .where('categoryId')
      .equals(id)
      .and((p) => !p.isDeleted)
      .count()

    if (productsInCategory > 0) {
      throw new Error(
        `Cannot delete category. ${productsInCategory} active product(s) are still using this category. Please reassign or delete those products first.`
      )
    }

    await db.categories.update(id, {
      isDeleted: true,
      updatedAt: now,
      syncedAt: null,
    })

    // Refresh products store
    refreshStore(category.userId)
  } catch (error) {
    console.error('Failed to delete category:', error)
    throw error
  }
}

/**
 * Update sort order for multiple categories
 */
export async function updateCategoriesOrder(
  updates: Array<{ id: string; sortOrder: number }>
): Promise<void> {
  const now = new Date().toISOString()

  try {
    await db.transaction('rw', db.categories, async () => {
      for (const { id, sortOrder } of updates) {
        await db.categories.update(id, {
          sortOrder,
          updatedAt: now,
          syncedAt: null,
        })
      }
    })

    // Refresh products store (get userId from first category)
    const firstCategory = await db.categories.get(updates[0]?.id)
    if (firstCategory) {
      refreshStore(firstCategory.userId)
    }
  } catch (error) {
    console.error('Failed to update categories order:', error)
    throw error
  }
}
