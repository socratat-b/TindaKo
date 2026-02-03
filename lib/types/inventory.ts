import type { Product, Category, InventoryMovement } from '@/lib/db/schema'

// ============================================================================
// Component Props
// ============================================================================

export interface InventoryInterfaceProps {
  userId: string
}

export interface AdjustmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
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
  userId: string
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

// ============================================================================
// Hook Parameters
// ============================================================================

export interface UseInventoryListParams {
  userId: string
}

export interface UseAdjustmentFormParams {
  userId: string
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
