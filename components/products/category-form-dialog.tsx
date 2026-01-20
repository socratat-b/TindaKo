'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory, updateCategory } from '@/lib/actions/products'
import type { Category } from '@/lib/db/schema'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  userId: string
  onSuccess: () => void
  nextSortOrder: number
}

const PRESET_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Cyan', value: '#06b6d4' },
]

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  userId,
  onSuccess,
  nextSortOrder,
}: CategoryFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    color: PRESET_COLORS[0].value,
    sortOrder: nextSortOrder,
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        color: category.color,
        sortOrder: category.sortOrder,
      })
    } else {
      setFormData({
        name: '',
        color: PRESET_COLORS[0].value,
        sortOrder: nextSortOrder,
      })
    }
    setError(null)
  }, [category, nextSortOrder, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (category) {
        await updateCategory(category.id, {
          name: formData.name,
          color: formData.color,
          sortOrder: formData.sortOrder,
          userId,
        })
      } else {
        await createCategory({
          name: formData.name,
          color: formData.color,
          sortOrder: formData.sortOrder,
          userId,
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base lg:text-lg">
            {category ? 'Edit Category' : 'Add Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-500/10 p-3 text-xs text-red-500 lg:text-sm">{error}</div>
          )}

          <div>
            <Label htmlFor="name" className="text-xs lg:text-sm">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-9 text-xs lg:h-10 lg:text-sm"
            />
          </div>

          <div>
            <Label className="text-xs lg:text-sm">Color *</Label>

            {/* Color Presets */}
            <div className="mt-2 grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: preset.value })}
                  className="flex h-10 items-center justify-center rounded border-2 transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: preset.value,
                    borderColor:
                      formData.color === preset.value ? '#000' : 'transparent',
                  }}
                  title={preset.name}
                >
                  {formData.color === preset.value && (
                    <span className="text-lg text-white drop-shadow-lg">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Color Picker */}
            <div className="mt-3 flex items-center gap-2">
              <Label htmlFor="colorPicker" className="text-xs lg:text-sm">
                Custom:
              </Label>
              <div className="flex flex-1 items-center gap-2">
                <input
                  id="colorPicker"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#000000"
                  className="h-9 flex-1 font-mono text-xs uppercase lg:h-10 lg:text-sm"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-9 flex-1 text-xs lg:h-10 lg:flex-none lg:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-9 flex-1 text-xs lg:h-10 lg:flex-none lg:text-sm"
            >
              {isLoading ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
