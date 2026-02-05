'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ShoppingCart,
  Package,
  Archive,
  Users,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navigation = [
  {
    name: 'POS',
    href: '/pos',
    icon: ShoppingCart,
    description: 'Point of Sale',
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
    description: 'Product & category management',
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Archive,
    description: 'Stock adjustments & alerts',
  },
  {
    name: 'Utang',
    href: '/utang',
    icon: Users,
    description: 'Customer credit tracking',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Sales reports',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App settings',
  },
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 md:hidden">
            <span className="text-lg font-semibold text-foreground">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Separator className="md:hidden" />

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-500 dark:to-amber-500 text-white shadow-md'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span
                      className={cn(
                        'text-xs',
                        isActive
                          ? 'text-white/80'
                          : 'text-muted-foreground'
                      )}
                    >
                      {item.description}
                    </span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer info */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <p className="font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">TindaKo</p>
              <p className="mt-1">Sari-Sari store management</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
