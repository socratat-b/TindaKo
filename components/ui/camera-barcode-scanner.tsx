'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Camera, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CameraBarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose?: () => void
  isOpen: boolean
}

export function CameraBarcodeScanner({
  onScan,
  onClose,
  isOpen,
}: CameraBarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const qrCodeRegionId = 'qr-reader'

  const startScanning = async () => {
    setError(null)
    setIsScanning(true)
    setDebugInfo('Starting camera...')

    try {
      // Initialize scanner
      const html5QrCode = new Html5Qrcode(qrCodeRegionId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      })
      scannerRef.current = html5QrCode

      setDebugInfo('Camera ready. Scanning...')

      // Start scanning with better config
      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 30, // Higher FPS for better detection
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            // Make scan box responsive - 70% of viewport
            const minEdgePercentage = 0.7
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
            const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
            return {
              width: qrboxSize,
              height: Math.floor(qrboxSize * 0.6), // Wider box for barcodes
            }
          },
          aspectRatio: 1.7778, // 16:9
          disableFlip: false, // Enable flip for better detection
        },
        (decodedText, decodedResult) => {
          // Success callback - barcode scanned
          console.log('[Scanner] Detected:', decodedText, decodedResult.result.format)
          setDebugInfo(`Scanned: ${decodedText}`)
          onScan(decodedText)
          stopScanning() // Auto-stop after successful scan
        },
        (errorMessage) => {
          // Error callback (scanning errors, not critical)
          // These happen constantly while scanning - only log for debugging
          // console.log('[Scanner] Scanning...', errorMessage)
        }
      )
    } catch (err) {
      console.error('[CameraBarcodeScanner] Failed to start:', err)
      setError('Failed to access camera. Please check permissions.')
      setDebugInfo('Camera error: ' + (err as Error).message)
      setIsScanning(false)
    }
  }

  const stopScanning = async () => {
    // Store reference before async operations to prevent null reference errors
    const scanner = scannerRef.current

    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop()
        // Check again after async stop() - scanner might have cleaned up
        if (scannerRef.current) {
          await scannerRef.current.clear()
        }
      } catch (err) {
        console.error('[CameraBarcodeScanner] Failed to stop:', err)
      }
    }
    setIsScanning(false)
    scannerRef.current = null
  }

  // Auto-start when opened
  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning()
    }

    // Cleanup on unmount or close
    return () => {
      // Only cleanup if scanner is actually running
      if (scannerRef.current?.isScanning) {
        stopScanning()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Header */}
        <div className="absolute left-0 right-0 top-0 z-10 bg-linear-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-white" />
              <h2 className="text-base font-semibold text-white">
                Scan Barcode
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                stopScanning()
                onClose?.()
              }}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scanner Region */}
        <div className="flex h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            {/* Camera preview - NO mirror/flip */}
            <div
              id={qrCodeRegionId}
              className="overflow-hidden rounded-lg"
              style={{
                // Don't flip the camera - show it naturally
                transform: 'none',
              }}
            />

            {/* Loading state */}
            {!isScanning && !error && (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="text-xs text-white/60">{debugInfo}</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="rounded-lg bg-red-500/20 p-4 text-center">
                <p className="text-sm text-white">{error}</p>
                <p className="mt-2 text-xs text-white/60">{debugInfo}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startScanning}
                  className="mt-3 text-xs"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6 pb-8">
          <p className="text-center text-sm text-white/80">
            Position the barcode within the scanning box
          </p>
          <p className="mt-1 text-center text-xs text-white/60">
            Hold steady - scanning at 30 FPS
          </p>
          {debugInfo && (
            <p className="mt-2 text-center text-xs text-green-400">
              {debugInfo}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
