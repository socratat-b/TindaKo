import Link from 'next/link';
import { InstallButton } from '@/components/pwa/install-button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <main className="max-w-2xl w-full space-y-8 text-center">
        {/* Logo/Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-2xl text-white text-3xl font-bold mb-4">
            TK
          </div>
          <h1 className="text-5xl font-bold text-gray-900">TindaKo POS</h1>
          <p className="text-xl text-gray-600">Offline-First Point of Sale</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-semibold text-gray-900 mb-1">Works Offline</h3>
            <p className="text-sm text-gray-600">No internet? No problem. All sales work offline.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">☁️</div>
            <h3 className="font-semibold text-gray-900 mb-1">Auto Sync</h3>
            <p className="text-sm text-gray-600">Automatically syncs to cloud when online.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 mb-1">Track Utang</h3>
            <p className="text-sm text-gray-600">Manage customer credit and payments easily.</p>
          </div>
        </div>

        {/* Install Button */}
        <div className="space-y-4">
          <InstallButton />

          {/* Login Link */}
          <div className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Log in
            </Link>
          </div>
        </div>

        {/* Quick Info */}
        <div className="pt-8 text-sm text-gray-500">
          Perfect for Sari-Sari stores, small shops, and retail businesses
        </div>
      </main>
    </div>
  );
}
