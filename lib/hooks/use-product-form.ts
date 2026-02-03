import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { useProductFormStore } from '@/lib/stores/product-form-store'
import { createProduct, updateProduct, createCategory } from '@/lib/actions/products'
import type { UseProductFormParams } from '@/lib/types'

export function useProductForm({
  userId,
  onSuccess,
  onOpenChange,
  product,
  categories,
  open,
  catalogData,
}: UseProductFormParams) {
  const {
    formData,
    categoryFormData,
    showCategoryForm,
    isLoading,
    error,
    setFormData,
    setCategoryFormData,
    setShowCategoryForm,
    setIsLoading,
    setError,
    resetForm,
    initializeForm,
    resetCategoryForm,
  } = useProductFormStore()

  const [barcodeInput, setBarcodeInput] = useState('')
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false)

  // Sort categories: custom categories (sortOrder=0) first, then by sortOrder
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (product) {
        initializeForm(product)
      } else if (catalogData && catalogData.fromCatalog) {
        // Pre-fill from catalog
        const matchingCategory = categories.find(
          (c) => c.name.toLowerCase() === catalogData.categoryName?.toLowerCase()
        )
        const categoryId = matchingCategory?.id || sortedCategories[0]?.id || ''

        resetForm(categoryId)
        setFormData({
          name: catalogData.name || '',
          barcode: catalogData.barcode || '',
          categoryId,
        })

        // Show toast to inform user
        toast.info('Product found in catalog', {
          description: 'Please set the price and stock quantity',
          duration: 4000,
        })
      } else {
        const firstCategoryId = sortedCategories[0]?.id || ''
        resetForm(firstCategoryId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, categories, open, catalogData])

  const handleCategoryChange = (value: string) => {
    if (value === 'create-new') {
      setShowCategoryForm(true)
    } else {
      setFormData({ categoryId: value })
    }
  }

  const handleCreateCategory = async () => {
    if (!categoryFormData.name.trim()) {
      setError('Category name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // sortOrder = 0 to place custom categories at the top
      const sortOrder = 0
      const newCategoryId = await createCategory({
        name: categoryFormData.name,
        color: categoryFormData.color,
        sortOrder,
        userId,
      })

      // Auto-select the new category
      setFormData({ categoryId: newCategoryId })
      resetCategoryForm()

      // Show success toast
      toast.success('Category created successfully', {
        description: `"${categoryFormData.name}" is now available`,
        duration: 3000,
      })

      // Refresh categories list
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelCategoryForm = () => {
    resetCategoryForm()
  }

  const handleSearchCatalog = async () => {
    if (!barcodeInput.trim()) {
      setError('Please enter a barcode')
      return
    }

    setIsSearchingCatalog(true)
    setError(null)

    try {
      // Search catalog by barcode
      const catalogItem = await db.productCatalog
        .where('barcode')
        .equals(barcodeInput.trim())
        .first()

      if (catalogItem) {
        // Find matching category or use first category
        const matchingCategory = categories.find(
          (c) => c.name.toLowerCase() === catalogItem.categoryName?.toLowerCase()
        )
        const categoryId = matchingCategory?.id || sortedCategories[0]?.id || ''

        // Pre-fill form with catalog data
        setFormData({
          name: catalogItem.name,
          barcode: catalogItem.barcode,
          categoryId,
        })

        toast.success('Product found in catalog!', {
          description: `${catalogItem.name} - Now set your price and stock`,
          duration: 4000,
        })

        // Clear barcode input
        setBarcodeInput('')
      } else {
        toast.error('Product not found in catalog', {
          description: 'You can still add it manually',
          duration: 3000,
        })
      }
    } catch (err) {
      setError('Failed to search catalog')
      console.error('[handleSearchCatalog] Error:', err)
    } finally {
      setIsSearchingCatalog(false)
    }
  }

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchCatalog()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const sellingPrice = parseFloat(formData.sellingPrice)
      const stockQty = parseInt(formData.stockQty, 10)
      const lowStockThreshold = parseInt(formData.lowStockThreshold, 10)

      if (isNaN(sellingPrice) || sellingPrice < 0) {
        throw new Error('Invalid selling price')
      }
      if (isNaN(stockQty) || stockQty < 0) {
        throw new Error('Invalid stock quantity')
      }
      if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
        throw new Error('Invalid low stock threshold')
      }

      if (product) {
        await updateProduct(product.id, {
          name: formData.name,
          barcode: formData.barcode || null,
          categoryId: formData.categoryId,
          sellingPrice,
          stockQty,
          lowStockThreshold,
          userId,
        })
      } else {
        await createProduct({
          name: formData.name,
          barcode: formData.barcode || null,
          categoryId: formData.categoryId,
          sellingPrice,
          stockQty,
          lowStockThreshold,
          userId,
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // State
    formData,
    categoryFormData,
    showCategoryForm,
    isLoading,
    error,
    sortedCategories,
    barcodeInput,
    isSearchingCatalog,

    // Actions from store
    setFormData,
    setCategoryFormData,
    setBarcodeInput,

    // Handlers
    handleCategoryChange,
    handleCreateCategory,
    handleCancelCategoryForm,
    handleSubmit,
    handleSearchCatalog,
    handleBarcodeKeyDown,
  }
}
