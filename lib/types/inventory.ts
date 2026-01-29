import type { Product, Category, InventoryMovement } from '@/lib/db/schema'

// ============================================================================
// Component Props
// ============================================================================

export interface InventoryInterfaceProps {
  storePhone: string
}

export interface AdjustmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storePhone: string
  products: Product[]
  categories: Category[]
  initialProductId?: string
  mode?: 'restock' | 'manual' // Determines dialog behavior
}

export interface InventoryMovementsListProps {
  movements: InventoryMovement[]
  products: Product[]
  categories: Category[]
  emptyMessage: string
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export interface LowStockAlertsProps {
  lowStockProducts: Product[]
  allProducts: Product[]
  categories: Category[]
  categoryFilter: string
  storePhone: string
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

// ============================================================================
// Hook Parameters
// ============================================================================

export interface UseInventoryListParams {
  storePhone: string
}

export interface UseAdjustmentFormParams {
  storePhone: string
  onOpenChange: (open: boolean) => void
  open: boolean
  initialProductId?: string
  mode?: 'restock' | 'manual' // Determines dialog behavior
}

// ============================================================================
// Form Data Types
// ============================================================================

export interface AdjustmentFormData {
  productId: string
  type: 'in' | 'out' | 'adjust'
  quantity: string
}
