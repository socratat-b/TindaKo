import { db } from '@/lib/db'
import type { Product, Category } from '@/lib/db/schema'
import { useProductsStore } from '@/lib/stores/products-store'

// Helper to refresh products store (works on client-side only)
const refreshStore = (userId: string) => {
  if (typeof window !== 'undefined') {
    useProductsStore.getState().refreshProducts(userId)
  }
}

export interface ProductFormData {
  name: string
  barcode: string | null
  categoryId: string
  costPrice: number
  sellingPrice: number
  stockQty: number
  lowStockThreshold: number
  userId: string
}

export interface CategoryFormData {
  name: string
  color: string
  sortOrder: number
  userId: string
}

/**
 * Create a new product
 */
export async function createProduct(data: ProductFormData): Promise<string> {
  const now = new Date().toISOString()
  const productId = crypto.randomUUID()

  try {
    // Validate category exists
    const category = await db.categories.get(data.categoryId)
    if (!category || category.isDeleted) {
      throw new Error('Invalid category')
    }

    // Check if barcode already exists
    if (data.barcode) {
      const existing = await db.products
        .where('barcode')
        .equals(data.barcode)
        .and((p) => !p.isDeleted)
        .first()

      if (existing) {
        throw new Error('A product with this barcode already exists')
      }
    }

    const product: Product = {
      id: productId,
      userId: data.userId,
      name: data.name.trim(),
      barcode: data.barcode?.trim() || null,
      categoryId: data.categoryId,
      costPrice: data.costPrice,
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
  data: Partial<ProductFormData>
): Promise<void> {
  const now = new Date().toISOString()

  try {
    const product = await db.products.get(id)
    if (!product || product.isDeleted) {
      throw new Error('Product not found')
    }

    // If barcode is being updated, check for duplicates
    if (data.barcode && data.barcode !== product.barcode) {
      const existing = await db.products
        .where('barcode')
        .equals(data.barcode)
        .and((p) => !p.isDeleted && p.id !== id)
        .first()

      if (existing) {
        throw new Error('A product with this barcode already exists')
      }
    }

    // If category is being updated, validate it exists
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await db.categories.get(data.categoryId)
      if (!category || category.isDeleted) {
        throw new Error('Invalid category')
      }
    }

    await db.products.update(id, {
      ...data,
      name: data.name?.trim(),
      barcode: data.barcode?.trim() || null,
      updatedAt: now,
      syncedAt: null,
    })

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
export async function createCategory(data: CategoryFormData): Promise<string> {
  const now = new Date().toISOString()
  const categoryId = crypto.randomUUID()

  try {
    // Check if category name already exists
    const existing = await db.categories
      .where('name')
      .equalsIgnoreCase(data.name.trim())
      .and((c) => !c.isDeleted)
      .first()

    if (existing) {
      throw new Error('A category with this name already exists')
    }

    const category: Category = {
      id: categoryId,
      userId: data.userId,
      name: data.name.trim(),
      color: data.color,
      sortOrder: data.sortOrder,
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
  data: Partial<CategoryFormData>
): Promise<void> {
  const now = new Date().toISOString()

  try {
    const category = await db.categories.get(id)
    if (!category || category.isDeleted) {
      throw new Error('Category not found')
    }

    // If name is being updated, check for duplicates
    if (data.name && data.name.trim() !== category.name) {
      const existing = await db.categories
        .where('name')
        .equalsIgnoreCase(data.name.trim())
        .and((c) => !c.isDeleted && c.id !== id)
        .first()

      if (existing) {
        throw new Error('A category with this name already exists')
      }
    }

    await db.categories.update(id, {
      ...data,
      name: data.name?.trim(),
      updatedAt: now,
      syncedAt: null,
    })

    // Refresh products store
    refreshStore(category.userId)
  } catch (error) {
    console.error('Failed to update category:', error)
    throw error
  }
}

/**
 * Delete a category (soft delete)
 * Note: This will NOT cascade delete products. Consider checking for products first.
 */
export async function deleteCategory(id: string): Promise<void> {
  const now = new Date().toISOString()

  try {
    const category = await db.categories.get(id)
    if (!category || category.isDeleted) {
      throw new Error('Category not found')
    }

    // Check if any products are using this category
    const productsInCategory = await db.products
      .where('categoryId')
      .equals(id)
      .and((p) => !p.isDeleted)
      .count()

    if (productsInCategory > 0) {
      throw new Error(
        `Cannot delete category. ${productsInCategory} product(s) are using this category.`
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
