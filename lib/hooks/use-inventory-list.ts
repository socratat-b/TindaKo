import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useInventoryListStore } from '@/lib/stores/inventory-list-store'
import type { UseInventoryListParams } from '@/lib/types'

export function useInventoryList({ storePhone }: UseInventoryListParams) {
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
        .where('storePhone')
        .equals(storePhone)
        .filter((m) => !m.isDeleted)
        .reverse()
        .sortBy('createdAt'),
    [storePhone]
  )

  // Fetch products
  const products = useLiveQuery(
    () =>
      db.products
        .where('storePhone')
        .equals(storePhone)
        .filter((p) => !p.isDeleted)
        .sortBy('name'),
    [storePhone]
  )

  // Fetch low stock products
  const lowStockProducts = useLiveQuery(
    () =>
      db.products
        .where('storePhone')
        .equals(storePhone)
        .filter((p) => !p.isDeleted && p.stockQty <= p.lowStockThreshold)
        .sortBy('stockQty'),
    [storePhone]
  )

  // Fetch categories
  const categories = useLiveQuery(
    () =>
      db.categories
        .where('storePhone')
        .equals(storePhone)
        .filter((c) => !c.isDeleted)
        .toArray(),
    [storePhone]
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
