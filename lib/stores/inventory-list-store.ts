import { create } from 'zustand'

interface InventoryListState {
  // UI state
  activeTab: 'inventory' | 'history'
  searchQuery: string
  categoryFilter: string

  // Pagination state
  allProductsPage: number
  lowStockPage: number
  historyPage: number
  itemsPerPage: number

  // Actions
  setActiveTab: (tab: 'inventory' | 'history') => void
  setSearchQuery: (query: string) => void
  setCategoryFilter: (categoryId: string) => void
  setAllProductsPage: (page: number) => void
  setLowStockPage: (page: number) => void
  setHistoryPage: (page: number) => void
  resetPagination: () => void
}

export const useInventoryListStore = create<InventoryListState>((set) => ({
  // Initial state
  activeTab: 'inventory',
  searchQuery: '',
  categoryFilter: 'all',
  allProductsPage: 1,
  lowStockPage: 1,
  historyPage: 1,
  itemsPerPage: 10, // 10 items per page (mobile-friendly)

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query, allProductsPage: 1, lowStockPage: 1, historyPage: 1 }), // Reset pagination on search
  setCategoryFilter: (categoryId) => set({ categoryFilter: categoryId, allProductsPage: 1, lowStockPage: 1 }), // Reset pagination on category change
  setAllProductsPage: (page) => set({ allProductsPage: page }),
  setLowStockPage: (page) => set({ lowStockPage: page }),
  setHistoryPage: (page) => set({ historyPage: page }),
  resetPagination: () => set({ allProductsPage: 1, lowStockPage: 1, historyPage: 1 }),
}))
