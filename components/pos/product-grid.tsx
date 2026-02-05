"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Product } from "@/lib/db/schema";
import { useCart } from "@/lib/hooks/use-cart";
import { useFormatCurrency } from "@/lib/utils/currency";
import { useSyncStore } from "@/lib/stores/sync-store";
import { useProductsStore } from "@/lib/stores/products-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Package, Loader2 } from "lucide-react";
import { CategoryFilter } from "@/components/shared/category-filter";

interface ProductGridProps {
  userId: string;
}

export function ProductGrid({ userId }: ProductGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { addItem, items: cartItems } = useCart();
  const formatCurrency = useFormatCurrency();
  const { status: syncStatus } = useSyncStore();

  // Get products from Zustand store
  const { products, categories, isLoading, loadProducts, refreshProducts } =
    useProductsStore();

  // Load products on mount and when data is restored
  useEffect(() => {
    loadProducts(userId);

    // Listen for data restore event (from cloud sync)
    const handleDataRestored = () => {
      refreshProducts(userId);
    };

    window.addEventListener("data-restored", handleDataRestored);
    return () =>
      window.removeEventListener("data-restored", handleDataRestored);
  }, [userId, loadProducts, refreshProducts]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchQuery));

      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    if (product.stockQty <= 0) {
      alert("Product is out of stock");
      return;
    }
    addItem(product);
  };

  // Show loading skeleton when syncing or initially loading with no data
  const showLoadingSkeleton =
    (isLoading && products.length === 0) ||
    (syncStatus === "syncing" && products.length === 0);

  if (showLoadingSkeleton) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary lg:w-10 lg:h-10" />
        <p className="text-sm text-muted-foreground lg:text-base">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search and Filter - Fixed at top */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-none flex flex-col lg:flex-row gap-2 mb-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <CategoryFilter
          categories={categories}
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full lg:w-[180px] h-9 text-sm"
        />
      </motion.div>

      {/* Product List - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-3">
            <div className="rounded-full bg-orange-500/10 p-3">
              <Package className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {searchQuery || selectedCategory !== "all"
                  ? "No products found"
                  : "No products available"}
              </p>
              {!searchQuery && selectedCategory === "all" && products.length === 0 && (
                <>
                  <p className="text-xs text-muted-foreground px-4">
                    Add products to start selling
                  </p>
                  <Button
                    onClick={() => router.push("/products")}
                    size="sm"
                    className="mt-3"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Product
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 pb-2">
            {filteredProducts.map((product, index) => {
              const category = categories.find(
                (c) => c.id === product.categoryId,
              );

              // Calculate remaining stock after cart items
              const cartItem = cartItems.find(
                (item) => item.productId === product.id,
              );
              const cartQty = cartItem?.quantity || 0;
              const remainingStock = product.stockQty - cartQty;

              const isOutOfStock = remainingStock <= 0;
              const isLowStock =
                !isOutOfStock && remainingStock <= product.lowStockThreshold;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.03,
                    ease: "easeOut",
                  }}
                  className="w-full"
                >
                  <Card
                    className={`p-2.5 cursor-pointer transition-all active:scale-[0.99] w-full ${
                      isOutOfStock ? "opacity-50" : ""
                    }`}
                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                  >
                    <div className="flex items-start gap-2.5 w-full">
                      {/* Product Info */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="flex-1 min-w-0 font-semibold text-sm leading-tight break-words">
                            {product.name}
                          </h3>
                          {category && (
                            <Badge
                              variant="secondary"
                              className="text-xs h-5 px-1.5 shrink-0"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                              }}
                            >
                              {category.name}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(product.sellingPrice)}
                          </p>
                          <p
                            className={`text-xs font-medium ${
                              isOutOfStock
                                ? "text-destructive"
                                : isLowStock
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {isOutOfStock
                              ? "Out of stock"
                              : `${remainingStock} left`}
                          </p>
                        </div>
                      </div>

                      {/* Add Button */}
                      {!isOutOfStock && (
                        <Button
                          size="icon"
                          className="h-10 w-10 shrink-0 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
