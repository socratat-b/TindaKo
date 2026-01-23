import { create } from 'zustand'
import type { Product } from '@/lib/db/schema'

interface ProductsListState {
  // Filter state
  search: string
  categoryFilter: string

  // Dialog state
  editingProduct: Product | null
  isFormOpen: boolean
  isQuickAddOpen: boolean
  deletingProduct: Product | null
  isDeleteDialogOpen: boolean

  // Actions
  setSearch: (search: string) => void
  setCategoryFilter: (filter: string) => void
  setEditingProduct: (product: Product | null) => void
  setIsFormOpen: (open: boolean) => void
  setIsQuickAddOpen: (open: boolean) => void
  setDeletingProduct: (product: Product | null) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  reset: () => void
}

const initialState = {
  search: '',
  categoryFilter: 'all',
  editingProduct: null,
  isFormOpen: false,
  isQuickAddOpen: false,
  deletingProduct: null,
  isDeleteDialogOpen: false,
}

export const useProductsListStore = create<ProductsListState>((set) => ({
  ...initialState,

  setSearch: (search) => set({ search }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  setEditingProduct: (product) => set({ editingProduct: product }),
  setIsFormOpen: (open) => set({ isFormOpen: open }),
  setIsQuickAddOpen: (open) => set({ isQuickAddOpen: open }),
  setDeletingProduct: (product) => set({ deletingProduct: product }),
  setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
  reset: () => set(initialState),
}))
