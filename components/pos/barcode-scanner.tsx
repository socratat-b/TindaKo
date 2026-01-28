'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/db'
import type { ProductCatalog } from '@/lib/db/schema'
import { useCart } from '@/lib/hooks/use-cart'
import { useAuth } from '@/lib/hooks/use-auth'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useCart()
  const { phone: storePhone } = useAuth()

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

      // Step 2: Check centralized catalog
      const catalogProduct = await db.productCatalog
        .where('barcode')
        .equals(scannedBarcode)
        .first()

      if (catalogProduct) {
        // Found in catalog - show quick add dialog
        setCatalogItem(catalogProduct)
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
            placeholder="Scan or enter barcode..."
            className="pl-9 h-10 text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsCameraOpen(true)}
          className="h-10 w-10 shrink-0"
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
            <DialogTitle>Product Found in Catalog</DialogTitle>
            <DialogDescription>
              This product is not in your inventory yet. Would you like to add it from the catalog?
            </DialogDescription>
          </DialogHeader>

          {catalogItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Product Name</div>
                <div className="text-base font-semibold">{catalogItem.name}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Barcode</div>
                <div className="text-sm font-mono">{catalogItem.barcode}</div>
              </div>

              {catalogItem.categoryName && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Category</div>
                  <Badge variant="secondary">{catalogItem.categoryName}</Badge>
                </div>
              )}

              <div className="rounded-md bg-blue-50 p-3 border border-blue-200">
                <p className="text-xs text-blue-900">
                  You&apos;ll be able to set the price and stock quantity in the product form.
                </p>
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
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                // Navigate to products page with pre-filled data
                if (catalogItem) {
                  const params = new URLSearchParams({
                    barcode: catalogItem.barcode,
                    name: catalogItem.name,
                    categoryName: catalogItem.categoryName || '',
                    fromCatalog: 'true',
                  })
                  window.location.href = `/products?${params.toString()}`
                }
              }}
            >
              Add to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
