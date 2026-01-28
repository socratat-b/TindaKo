'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/db'
import type { ProductCatalog } from '@/lib/db/schema'
import { useCart } from '@/lib/hooks/use-cart'
import { useAuth } from '@/lib/hooks/use-auth'
import { useProductsStore } from '@/lib/stores/products-store'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Scan, CheckCircle2, AlertCircle, Info, Camera } from 'lucide-react'
import { CameraBarcodeScanner } from '@/components/ui/camera-barcode-scanner'
import { Label } from '@/components/ui/label'
import { createProduct } from '@/lib/actions/products'
import { toast } from 'sonner'

type ScanResult = {
  type: 'success' | 'error' | 'catalog'
  message: string
  catalogItem?: ProductCatalog
}

export function BarcodeScanner() {
  const [barcode, setBarcode] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [showCatalogDialog, setShowCatalogDialog] = useState(false)
  const [catalogItem, setCatalogItem] = useState<ProductCatalog | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [sellingPrice, setSellingPrice] = useState('')
  const [stockQty, setStockQty] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useCart()
  const { phone: storePhone } = useAuth()
  const { refreshProducts } = useProductsStore()

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Clear scan result after 3 seconds
  useEffect(() => {
    if (scanResult) {
      const timeout = setTimeout(() => {
        setScanResult(null)
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [scanResult])

  const handleScan = async (scannedBarcode: string) => {
    if (!scannedBarcode.trim() || !storePhone) return

    try {
      // Step 1: Check seller's own products first
      const product = await db.products
        .where('barcode')
        .equals(scannedBarcode)
        .and((p) => !p.isDeleted && p.storePhone === storePhone)
        .first()

      if (product) {
        // Product found in inventory
        if (product.stockQty <= 0) {
          setScanResult({
            type: 'error',
            message: `${product.name} is out of stock`,
          })
          return
        }

        // Add product to cart
        addItem(product)

        setScanResult({
          type: 'success',
          message: `Added ${product.name} to cart`,
        })
        return
      }

      // Step 2: Check centralized catalog (direct lookup - barcodes are verified)
      const catalogProduct = await db.productCatalog
        .where('barcode')
        .equals(scannedBarcode)
        .first()

      if (catalogProduct) {
        // Found in catalog - show quick add dialog
        setCatalogItem(catalogProduct)
        setSellingPrice('') // Reset form
        setStockQty('') // Reset form
        setShowCatalogDialog(true)
        setScanResult({
          type: 'catalog',
          message: `${catalogProduct.name} found in catalog`,
          catalogItem: catalogProduct,
        })
        return
      }

      // Step 3: Not found anywhere
      setScanResult({
        type: 'error',
        message: `Barcode ${scannedBarcode} not found`,
      })
    } catch (error) {
      console.error('Barcode scan error:', error)
      setScanResult({
        type: 'error',
        message: 'Failed to process barcode',
      })
    } finally {
      setBarcode('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleScan(barcode)
    }
  }

  const handleCameraScan = (scannedBarcode: string) => {
    setIsCameraOpen(false)
    handleScan(scannedBarcode)
  }

  const handleQuickAddFromCatalog = async () => {
    if (!catalogItem || !storePhone) return

    // Validate inputs
    const price = parseFloat(sellingPrice)
    const stock = parseInt(stockQty, 10)

    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    if (isNaN(stock) || stock < 0) {
      toast.error('Please enter a valid stock quantity')
      return
    }

    setIsSaving(true)

    try {
      // Check if product with this barcode already exists
      const existingProduct = await db.products
        .where('barcode')
        .equals(catalogItem.barcode)
        .and((p) => p.storePhone === storePhone && !p.isDeleted)
        .first()

      if (existingProduct) {
        toast.error('Product already exists', {
          description: 'This barcode is already in your inventory',
        })
        setIsSaving(false)
        return
      }

      // Find or create matching category
      let category = await db.categories
        .where('storePhone')
        .equals(storePhone)
        .filter((c) => !c.isDeleted && c.name === (catalogItem.categoryName || 'Uncategorized'))
        .first()

      // If category doesn't exist, create it
      let categoryId = category?.id
      if (!category) {
        const newCategory = {
          id: crypto.randomUUID(),
          storePhone,
          name: catalogItem.categoryName || 'Uncategorized',
          color: '#6b7280',
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncedAt: null,
          isDeleted: false,
        }
        await db.categories.add(newCategory)
        categoryId = newCategory.id
      }

      // Create the product
      const newProduct = {
        id: crypto.randomUUID(),
        storePhone,
        name: catalogItem.name,
        barcode: catalogItem.barcode,
        categoryId: categoryId!,
        sellingPrice: price,
        stockQty: stock,
        lowStockThreshold: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      }

      await db.products.add(newProduct)

      // Add to cart
      addItem(newProduct)

      // Refresh product list in POS
      if (storePhone) {
        refreshProducts(storePhone)
      }

      // Show success
      toast.success('Product added!', {
        description: `${catalogItem.name} added to cart`,
      })

      // Reset and close
      setShowCatalogDialog(false)
      setCatalogItem(null)
      setSellingPrice('')
      setStockQty('')
      setScanResult({
        type: 'success',
        message: `Added ${catalogItem.name} to cart`,
      })
    } catch (error) {
      console.error('[QuickAdd] Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product'
      toast.error('Failed to add product', {
        description: errorMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-1.5"
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Scan className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste or scan barcode..."
            className="pl-9 h-10 text-sm"
          />
        </div>
        {/* Camera button - only show on mobile */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsCameraOpen(true)}
          className="h-10 w-10 shrink-0 md:hidden"
          title="Scan with camera"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      {/* Scan Result Indicator */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 p-2 rounded-md ${
              scanResult.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : scanResult.type === 'catalog'
                ? 'bg-blue-50 text-blue-900 border border-blue-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {scanResult.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : scanResult.type === 'catalog' ? (
              <Info className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="text-xs font-medium">{scanResult.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Barcode Scanner */}
      <CameraBarcodeScanner
        isOpen={isCameraOpen}
        onScan={handleCameraScan}
        onClose={() => setIsCameraOpen(false)}
      />

      {/* Catalog Item Quick Add Dialog */}
      <Dialog open={showCatalogDialog} onOpenChange={setShowCatalogDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Product from Catalog</DialogTitle>
            <DialogDescription>
              Set the price and stock, then add to cart
            </DialogDescription>
          </DialogHeader>

          {catalogItem && (
            <div className="space-y-4 py-2">
              {/* Product Info */}
              <div className="space-y-2 rounded-lg bg-blue-50 p-3 border border-blue-200">
                <div className="text-sm font-semibold text-blue-900">{catalogItem.name}</div>
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <span className="font-mono">{catalogItem.barcode}</span>
                  {catalogItem.categoryName && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {catalogItem.categoryName}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Selling Price Input */}
              <div className="space-y-2">
                <Label htmlFor="sellingPrice" className="text-sm">
                  Selling Price *
                </Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  disabled={isSaving}
                  className="h-10"
                  autoFocus
                />
              </div>

              {/* Stock Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="stockQty" className="text-sm">
                  Stock Quantity *
                </Label>
                <Input
                  id="stockQty"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  disabled={isSaving}
                  className="h-10"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCatalogDialog(false)
                setCatalogItem(null)
                setSellingPrice('')
                setStockQty('')
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleQuickAddFromCatalog}
              disabled={isSaving || !sellingPrice || !stockQty}
            >
              {isSaving ? 'Adding...' : 'Save & Add to Cart'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
