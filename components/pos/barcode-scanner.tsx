'use client'

import { useState, useRef, useEffect } from 'react'
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
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Scan className="h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scan or enter barcode..."
            className="flex-1"
          />
        </div>

        {/* Scan Result Indicator */}
        {scanResult && (
          <Badge
            variant={scanResult.type === 'success' ? 'default' : 'destructive'}
            className="flex items-center gap-1.5 px-3 py-1.5"
          >
            {scanResult.type === 'success' ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            <span className="text-sm">{scanResult.message}</span>
          </Badge>
        )}
      </div>
    </Card>
  )
}
