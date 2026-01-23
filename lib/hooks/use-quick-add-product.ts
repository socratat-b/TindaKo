import { useEffect } from 'react'
import { toast } from 'sonner'
import { useQuickAddProductStore } from '@/lib/stores/quick-add-product-store'
import { createProduct, createCategory } from '@/lib/actions/products'
import type { UseQuickAddProductParams } from '@/lib/types'

export function useQuickAddProduct({
  userId,
  onSuccess,
  onOpenChange,
  categories,
  open,
}: UseQuickAddProductParams) {
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
    resetForNewProduct,
    resetCategoryForm,
  } = useQuickAddProductStore()

  // Sort categories: custom categories (sortOrder=0) first, then by sortOrder
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const firstCategoryId = sortedCategories[0]?.id || ''
      resetForm(firstCategoryId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, categories])

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

  const handleSubmit = async (e: React.FormEvent, saveAndAddAnother = false) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Product name is required')
      }
      if (!formData.categoryId) {
        throw new Error('Category is required')
      }

      const sellingPrice = parseFloat(formData.sellingPrice)
      const stockQty = parseInt(formData.stockQty, 10)

      if (isNaN(sellingPrice) || sellingPrice < 0) {
        throw new Error('Invalid selling price')
      }
      if (isNaN(stockQty) || stockQty < 0) {
        throw new Error('Invalid stock quantity')
      }

      // Create product with minimal fields
      await createProduct({
        name: formData.name,
        barcode: null,
        categoryId: formData.categoryId,
        sellingPrice,
        stockQty,
        lowStockThreshold: 10, // Default threshold
        userId,
      })

      // Success feedback
      toast.success(`"${formData.name}" added successfully`, {
        description: saveAndAddAnother ? 'Ready to add another product' : 'Product has been saved',
        duration: 3000,
      })

      onSuccess()

      if (saveAndAddAnother) {
        // Reset form but keep category selection and dialog open
        resetForNewProduct(formData.categoryId)
      } else {
        // Close dialog
        onOpenChange(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
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
