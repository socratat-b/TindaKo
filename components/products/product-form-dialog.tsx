"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRESET_COLORS } from "@/lib/constants/colors";
import { useFormattedNumberInput } from "@/lib/hooks/use-formatted-input";
import { useProductForm } from "@/lib/hooks/use-product-form";
import type { ProductFormDialogProps } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect } from "react";

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  userId,
  onSuccess,
}: ProductFormDialogProps) {
  const {
    formData,
    categoryFormData,
    showCategoryForm,
    isLoading,
    error,
    sortedCategories,
    setFormData,
    setCategoryFormData,
    handleCategoryChange,
    handleCreateCategory,
    handleCancelCategoryForm,
    handleSubmit,
  } = useProductForm({
    userId,
    onSuccess,
    onOpenChange,
    product,
    categories,
    open,
  });

  // Use formatted input for selling price
  const formattedSellingPrice = useFormattedNumberInput(formData.sellingPrice);

  // Sync formatted input with form store
  useEffect(() => {
    setFormData({ sellingPrice: formattedSellingPrice.rawValue });
  }, [formattedSellingPrice.rawValue, setFormData]);

  // Update formatted input when sellingPrice changes externally (e.g., form reset)
  useEffect(() => {
    if (formData.sellingPrice !== formattedSellingPrice.rawValue) {
      formattedSellingPrice.setValue(formData.sellingPrice);
    }
  }, [formData.sellingPrice]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base lg:text-lg">
            {product ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        {categories.length === 0 ? (
          <div className="space-y-4 py-4">
            <div className="rounded bg-yellow-500/10 p-3 lg:p-4">
              <p className="text-xs font-medium text-yellow-700 lg:text-sm">
                No categories available
              </p>
              <p className="mt-2 text-xs text-yellow-600 lg:text-sm">
                Please create at least one category first. Go to the Categories
                tab to add categories like Inumin, Meryenda, or Canned Goods.
              </p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="h-9 w-full text-xs lg:h-10 lg:text-sm"
            >
              Got it
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md bg-destructive/10 p-2 text-xs text-destructive lg:p-3 lg:text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Product Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs lg:text-sm">
                Product Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                required
                disabled={isLoading}
                className="h-9 text-xs lg:h-10 lg:text-sm"
                autoFocus
              />
            </div>

            {/* Barcode */}
            <div className="space-y-1.5">
              <Label htmlFor="barcode" className="text-xs lg:text-sm">
                Barcode
              </Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ barcode: e.target.value })}
                placeholder="Optional"
                disabled={isLoading}
                className="h-9 text-xs lg:h-10 lg:text-sm"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs lg:text-sm">
                Category *
              </Label>

              <AnimatePresence mode="wait">
                {showCategoryForm ? (
                  <motion.div
                    key="category-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 rounded-md border p-3"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="new-category-name" className="text-xs">
                        Category Name *
                      </Label>
                      <Input
                        id="new-category-name"
                        value={categoryFormData.name}
                        onChange={(e) =>
                          setCategoryFormData({ name: e.target.value })
                        }
                        placeholder="e.g. Frozen Goods"
                        disabled={isLoading}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setCategoryFormData({ color })}
                            disabled={isLoading}
                            className={`h-7 w-7 rounded-full border-2 transition-all ${
                              categoryFormData.color === color
                                ? "scale-110 border-foreground"
                                : "border-transparent hover:scale-105"
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelCategoryForm}
                        disabled={isLoading}
                        className="h-8 flex-1 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={isLoading || !categoryFormData.name.trim()}
                        className="h-8 flex-1 text-xs"
                      >
                        Create Category
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="category-select"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Select
                      value={formData.categoryId}
                      onValueChange={handleCategoryChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-9 w-full text-xs lg:h-10 lg:text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {sortedCategories.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id}
                            className="text-xs lg:text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="create-new"
                          className="text-xs lg:text-sm"
                        >
                          <div className="flex items-center gap-2 font-medium text-primary">
                            <Plus className="h-3 w-3" />
                            Create Custom Category
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice" className="text-xs lg:text-sm">
                Selling Price *
              </Label>
              <Input
                id="sellingPrice"
                type="text"
                inputMode="decimal"
                value={formattedSellingPrice.displayValue}
                onChange={formattedSellingPrice.handleChange}
                onBlur={formattedSellingPrice.handleBlur}
                required
                disabled={isLoading}
                className="h-9 text-xs lg:h-10 lg:text-sm"
              />
            </div>

            {/* Stock Quantity & Low Stock Alert */}
            <div className="grid grid-cols-2 gap-2 lg:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stockQty" className="text-xs lg:text-sm">
                  Stock Quantity *
                </Label>
                <Input
                  id="stockQty"
                  type="number"
                  min="0"
                  value={formData.stockQty}
                  onChange={(e) => setFormData({ stockQty: e.target.value })}
                  required
                  disabled={isLoading}
                  className="h-9 text-xs lg:h-10 lg:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="lowStockThreshold"
                  className="text-xs lg:text-sm"
                >
                  Low Stock Alert *
                </Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({ lowStockThreshold: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="h-9 text-xs lg:h-10 lg:text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
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
                disabled={isLoading || showCategoryForm}
                className="h-9 flex-1 text-xs lg:h-10 lg:flex-none lg:text-sm"
              >
                {isLoading ? "Saving..." : product ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
