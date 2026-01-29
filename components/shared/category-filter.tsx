'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CategoryFilterProps } from '@/lib/types/shared'

export function CategoryFilter({
  categories,
  value,
  onValueChange,
  placeholder = 'Category',
  className = 'h-9 w-full text-xs md:h-10 md:w-[180px] md:text-sm',
  showColorDots = true,
}: CategoryFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="text-xs md:text-sm">
          All Categories
        </SelectItem>
        {categories.map((category) => (
          <SelectItem
            key={category.id}
            value={category.id}
            className="text-xs md:text-sm"
          >
            <div className="flex items-center gap-2">
              {showColorDots && (
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
              {category.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
