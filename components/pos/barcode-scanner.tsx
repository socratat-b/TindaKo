'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/db'
import { useCart } from '@/lib/hooks/use-cart'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Scan, CheckCircle2, AlertCircle } from 'lucide-react'

type ScanResult = {
  type: 'success' | 'error'
  message: string
}

export function BarcodeScanner() {
  const [barcode, setBarcode] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useCart()

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
    if (!scannedBarcode.trim()) return

    try {
      // Look up product by barcode
      const product = await db.products
        .where('barcode')
        .equals(scannedBarcode)
        .and((p) => !p.isDeleted)
        .first()

      if (!product) {
        setScanResult({
          type: 'error',
          message: `Product not found: ${scannedBarcode}`,
        })
        return
      }

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
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {scanResult.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="text-xs font-medium">{scanResult.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
