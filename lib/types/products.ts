import type { Product, Category } from '@/lib/db/schema'

// ============================================================================
// Component Props
// ============================================================================

export interface ProductsInterfaceProps {
  userId: string
}

export interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  categories: Category[]
  userId: string
  onSuccess: () => void
}

export interface QuickAddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  userId: string
  onSuccess: () => void
}

export interface ProductsListProps {
  products: Product[]
  categories: Category[]
  userId: string
  onRefresh: () => void
}

// ============================================================================
// Hook Parameters
// ============================================================================

export interface UseProductFormParams {
  userId: string
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
  product?: Product | null
  categories: Category[]
  open: boolean
}

export interface UseQuickAddProductParams {
  userId: string
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
  categories: Category[]
  open: boolean
}

export interface UseProductsListParams {
  products: Product[]
  categories: Category[]
  onRefresh: () => void
}

// ============================================================================
// Form Data Types
// ============================================================================

export interface ProductFormData {
  name: string
  barcode: string
  categoryId: string
  sellingPrice: string
  stockQty: string
  lowStockThreshold: string
}

export interface QuickAddProductFormData {
  name: string
  categoryId: string
  sellingPrice: string
  stockQty: string
}

export interface CategoryFormData {
  name: string
  color: string
}
