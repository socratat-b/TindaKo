import Link from 'next/link'

export default async function POSPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">POS</h1>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground mb-4">
          Welcome to TindaKo POS! The point of sale interface will be implemented here.
        </p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Upcoming features:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Product scanning and selection</li>
            <li>Shopping cart management</li>
            <li>Payment processing</li>
            <li>Utang (credit) tracking</li>
            <li>Receipt generation</li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Quick links:</p>
          <div className="flex gap-2">
            <Link
              href="/products"
              className="px-3 py-1.5 text-sm rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/inventory"
              className="px-3 py-1.5 text-sm rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Inventory
            </Link>
            <Link
              href="/utang"
              className="px-3 py-1.5 text-sm rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Utang
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
