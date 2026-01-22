import { db } from '@/lib/db'
import type { InventoryMovement } from '@/lib/db/schema'

export type CreateInventoryMovementInput = {
  userId: string
  productId: string
  type: 'in' | 'out' | 'adjust'
  qty: number
  notes?: string
}

export type InventoryMovementResult = {
  success: boolean
  error?: string
  movementId?: string
}

export async function createInventoryMovement(
  data: CreateInventoryMovementInput
): Promise<InventoryMovementResult> {
  try {
    if (!data.productId || !data.userId) {
      return { success: false, error: 'Product and user are required' }
    }

    if (data.qty <= 0) {
      return { success: false, error: 'Quantity must be greater than 0' }
    }

    if (!['in', 'out', 'adjust'].includes(data.type)) {
      return { success: false, error: 'Invalid movement type' }
    }

    const product = await db.products.get(data.productId)

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    if (product.isDeleted) {
      return { success: false, error: 'Cannot adjust deleted product' }
    }

    const now = new Date().toISOString()
    const movementId = crypto.randomUUID()

    // Atomic transaction to update stock and create movement
    await db.transaction(
      'rw',
      [db.products, db.inventoryMovements],
      async () => {
        // Calculate new stock quantity based on movement type
        let newStockQty = product.stockQty

        switch (data.type) {
          case 'in':
            newStockQty += data.qty
            break
          case 'out':
            newStockQty -= data.qty
            if (newStockQty < 0) {
              throw new Error(
                `Insufficient stock. Available: ${product.stockQty}, Requested: ${data.qty}`
              )
            }
            break
          case 'adjust':
            // For adjust, qty represents the new total stock quantity
            newStockQty = data.qty
            break
        }

        // Update product stock
        await db.products.update(product.id, {
          stockQty: newStockQty,
          updatedAt: now,
          syncedAt: null, // Mark for sync
        })

        // Create inventory movement record
        const movement: InventoryMovement = {
          id: movementId,
          userId: data.userId,
          productId: data.productId,
          type: data.type,
          qty: data.qty,
          notes: data.notes || null,
          createdAt: now,
          updatedAt: now,
          syncedAt: null,
          isDeleted: false,
        }

        await db.inventoryMovements.add(movement)
      }
    )

    // Notify UI that local data changed (product stock updated)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('local-data-changed'))
    }

    return {
      success: true,
      movementId,
    }
  } catch (error) {
    console.error('Error creating inventory movement:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create movement',
    }
  }
}

export type LowStockProduct = {
  id: string
  name: string
  barcode: string | null
  categoryId: string
  stockQty: number
  lowStockThreshold: number
  sellingPrice: number
}

export async function getLowStockProducts(
  userId: string
): Promise<LowStockProduct[]> {
  try {
    const products = await db.products
      .where('userId')
      .equals(userId)
      .filter((p) => !p.isDeleted && p.stockQty <= p.lowStockThreshold)
      .toArray()

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      barcode: p.barcode,
      categoryId: p.categoryId,
      stockQty: p.stockQty,
      lowStockThreshold: p.lowStockThreshold,
      sellingPrice: p.sellingPrice,
    }))
  } catch (error) {
    console.error('Error fetching low stock products:', error)
    return []
  }
}
