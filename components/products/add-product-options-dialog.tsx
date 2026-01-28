'use client'

import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap, Edit, Scan, FileEdit } from 'lucide-react'

interface AddProductOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectQuickAdd: () => void
  onSelectManualAdd: () => void
}

export function AddProductOptionsDialog({
  open,
  onOpenChange,
  onSelectQuickAdd,
  onSelectManualAdd,
}: AddProductOptionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base lg:text-lg">Add Product</DialogTitle>
          <DialogDescription className="text-xs lg:text-sm">
            Choose how you want to add a product
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {/* Quick Add Option */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card
              className="p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary active:scale-[0.98]"
              onClick={() => {
                onSelectQuickAdd()
                onOpenChange(false)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-lg bg-yellow-500/10 p-2.5">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-sm">Quick Add with Barcode</h3>
                  <p className="text-xs text-muted-foreground">
                    Scan or paste barcode to quickly add a product
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Scan className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Camera scan or paste barcode
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Manual Add Option */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card
              className="p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary active:scale-[0.98]"
              onClick={() => {
                onSelectManualAdd()
                onOpenChange(false)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-lg bg-blue-500/10 p-2.5">
                  <FileEdit className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-sm">Manual Entry</h3>
                  <p className="text-xs text-muted-foreground">
                    Fill in all product details manually
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Enter name, price, stock, etc.
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs lg:text-sm"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
