import type { Customer } from '@/lib/db/schema'

// ============================================================================
// Component Props
// ============================================================================

export interface POSInterfaceProps {
  userId: string
}

export interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckout: (amountPaid: number, customerId: string | null) => Promise<void>
  userId: string
}

export interface QuickAddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onCustomerCreated?: (customerId: string) => void
}

// ============================================================================
// Hook Parameters
// ============================================================================

export interface UseCheckoutParams {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckout: (amountPaid: number, customerId: string | null) => Promise<void>
  userId: string
  total: number
  paymentMethod: 'cash' | 'gcash' | 'utang'
  clearCart: () => void
}

export interface UseQuickAddCustomerParams {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onCustomerCreated?: (customerId: string) => void
}

// ============================================================================
// Form Data Types
// ============================================================================

export interface CustomerFormData {
  name: string
  phone: string
  address: string
}
