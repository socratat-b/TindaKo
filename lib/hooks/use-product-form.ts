import { useEffect } from 'react'
import { toast } from 'sonner'
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

  // Sort categories: custom categories (sortOrder=0) first, then by sortOrder
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (product) {
        initializeForm(product)
      } else {
        const firstCategoryId = sortedCategories[0]?.id || ''
        resetForm(firstCategoryId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, categories, open])

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

    // Actions from store
    setFormData,
    setCategoryFormData,

    // Handlers
    handleCategoryChange,
    handleCreateCategory,
    handleCancelCategoryForm,
    handleSubmit,
  }
}
