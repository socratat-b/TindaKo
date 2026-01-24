'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) return null

  return (
    <div className={`flex flex-col gap-2 md:flex-row md:items-center md:justify-between ${className}`}>
      {/* Items count - Mobile first */}
      <p className="text-center text-xs text-muted-foreground md:text-left md:text-sm">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> items
      </p>

      {/* Page controls - Mobile optimized */}
      <div className="flex items-center justify-center gap-1 md:gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 md:h-9 md:w-9"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers - Simplified for mobile */}
        <div className="flex items-center gap-1">
          {totalPages <= 5 ? (
            // Show all pages if 5 or less
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className="h-8 min-w-[2rem] px-2 text-xs md:h-9 md:min-w-[2.25rem] md:text-sm"
              >
                {page}
              </Button>
            ))
          ) : (
            // Simplified pagination for many pages
            <>
              {/* First page */}
              <Button
                variant={currentPage === 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(1)}
                className="h-8 min-w-[2rem] px-2 text-xs md:h-9 md:min-w-[2.25rem] md:text-sm"
              >
                1
              </Button>

              {/* Ellipsis if needed */}
              {currentPage > 3 && (
                <span className="px-1 text-xs text-muted-foreground md:text-sm">...</span>
              )}

              {/* Middle pages around current */}
              {currentPage > 2 && currentPage < totalPages - 1 && (
                <>
                  {currentPage > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(currentPage - 1)}
                      className="h-8 min-w-[2rem] px-2 text-xs md:h-9 md:min-w-[2.25rem] md:text-sm"
                    >
                      {currentPage - 1}
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 min-w-[2rem] px-2 text-xs md:h-9 md:min-w-[2.25rem] md:text-sm"
                  >
                    {currentPage}
                  </Button>
                  {currentPage < totalPages - 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(currentPage + 1)}
                      className="h-8 min-w-[2rem] px-2 text-xs md:h-9 md:min-w-[2.25rem] md:text-sm"
                    >
                      {currentPage + 1}
                    </Button>
                  )}
                </>
              )}

              {/* Second page if current is first */}
              {currentPage === 1 && totalPages > 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(2)}
                  className="h-8 min-w-[2rem] px-2 text-xs md:h-9 md:min-w-[2.25rem] md:text-sm"
                >
                  2
                </Button>
              )}

              {/* Second to last page if current is last */}
              {currentPage === totalPages && totalPages > 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages - 1)}
                  className="h-8 min-w-[2rem] px-2 text-xs md:h-9 md:min-w-[2.25rem] md:text-sm"
                >
                  {totalPages - 1}
                </Button>
              )}

              {/* Ellipsis if needed */}
              {currentPage < totalPages - 2 && (
                <span className="px-1 text-xs text-muted-foreground md:text-sm">...</span>
              )}

              {/* Last page */}
              <Button
                variant={currentPage === totalPages ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="h-8 min-w-[2rem] px-2 text-xs md:h-9 md:min-w-[2.25rem] md:text-sm"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 md:h-9 md:w-9"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
