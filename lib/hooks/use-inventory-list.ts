import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useInventoryListStore } from '@/lib/stores/inventory-list-store'
import type { UseInventoryListParams } from '@/lib/types'

export function useInventoryList({ userId }: UseInventoryListParams) {
  const {
    activeTab,
    searchQuery,
    allProductsPage,
    lowStockPage,
    historyPage,
    itemsPerPage,
    setActiveTab,
    setSearchQuery,
    setAllProductsPage,
    setLowStockPage,
    setHistoryPage,
  } = useInventoryListStore()

  // Fetch all inventory movements
  const movements = useLiveQuery(
    () =>
      db.inventoryMovements
        .where('userId')
        .equals(userId)
        .filter((m) => !m.isDeleted)
        .reverse()
        .sortBy('createdAt'),
    [userId]
  )

  // Fetch products
  const products = useLiveQuery(
    () =>
      db.products
        .where('userId')
        .equals(userId)
        .filter((p) => !p.isDeleted)
        .sortBy('name'),
    [userId]
  )

  // Fetch low stock products
  const lowStockProducts = useLiveQuery(
    () =>
      db.products
        .where('userId')
        .equals(userId)
        .filter((p) => !p.isDeleted && p.stockQty <= p.lowStockThreshold)
        .sortBy('stockQty'),
    [userId]
  )

  // Fetch categories
  const categories = useLiveQuery(
    () =>
      db.categories
        .where('userId')
        .equals(userId)
        .filter((c) => !c.isDeleted)
        .toArray(),
    [userId]
  )

  // Filter movements based on search
  const filteredMovements = movements?.filter((movement) => {
    if (!searchQuery) return true
    const product = products?.find((p) => p.id === movement.productId)
    const productName = product?.name.toLowerCase() || ''
    const notes = movement.notes?.toLowerCase() || ''
    const search = searchQuery.toLowerCase()
    return productName.includes(search) || notes.includes(search)
  })

  const lowStockCount = lowStockProducts?.length || 0

  return {
    // State
    activeTab,
    searchQuery,
    movements,
    products,
    lowStockProducts,
    categories,
    filteredMovements,
    lowStockCount,

    // Pagination state
    allProductsPage,
    lowStockPage,
    historyPage,
    itemsPerPage,

    // Actions
    setActiveTab,
    setSearchQuery,
    setAllProductsPage,
    setLowStockPage,
    setHistoryPage,
  }
}
