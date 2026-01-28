import { useMemo } from 'react'
import { useProductsListStore } from '@/lib/stores/products-list-store'
import { deleteProduct } from '@/lib/actions/products'
import type { Product } from '@/lib/db/schema'
import type { UseProductsListParams } from '@/lib/types'

export function useProductsList({ products, categories, onRefresh }: UseProductsListParams) {
  const {
    search,
    categoryFilter,
    editingProduct,
    isFormOpen,
    isQuickAddOpen,
    deletingProduct,
    isDeleteDialogOpen,
    setSearch,
    setCategoryFilter,
    setEditingProduct,
    setIsFormOpen,
    setIsQuickAddOpen,
    setDeletingProduct,
    setIsDeleteDialogOpen,
  } = useProductsListStore()

  // Filtered products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  // Utility functions
  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown'
  }

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280'
  }

  const getStockStatus = (product: Product) => {
    if (product.stockQty === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const }
    }
    if (product.stockQty <= product.lowStockThreshold) {
      return { label: 'Low Stock', variant: 'secondary' as const }
    }
    return { label: 'In Stock', variant: 'default' as const }
  }

  // Handlers
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = (product: Product) => {
    setDeletingProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return

    try {
      await deleteProduct(deletingProduct.id)
      setIsDeleteDialogOpen(false)
      setDeletingProduct(null)
      onRefresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete product')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  return {
    // State
    search,
    categoryFilter,
    editingProduct,
    isFormOpen,
    isQuickAddOpen,
    deletingProduct,
    isDeleteDialogOpen,
    filteredProducts,

    // Setters
    setSearch,
    setCategoryFilter,
    setIsQuickAddOpen,
    setIsDeleteDialogOpen,
    setIsFormOpen,

    // Handlers
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleFormClose,

    // Utilities
    getCategoryName,
    getCategoryColor,
    getStockStatus,
  }
}
