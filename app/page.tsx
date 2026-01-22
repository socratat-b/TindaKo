'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { InstallButton } from '@/components/pwa/install-button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <main className="max-w-2xl w-full space-y-8 text-center">
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-2"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 rounded-2xl text-white text-3xl font-bold mb-4"
          >
            TK
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-5xl font-bold text-gray-900"
          >
            TindaKo
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-600"
          >
            Offline-First Point of Sale
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8"
        >
          {[
            { emoji: '📱', title: 'Works Offline', desc: 'No internet? No problem. All sales work offline.' },
            { emoji: '☁️', title: 'Auto Sync', desc: 'Automatically syncs to cloud when online.' },
            { emoji: '💰', title: 'Track Utang', desc: 'Manage customer credit and payments easily.' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1, ease: 'easeOut' }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="text-3xl mb-2">{feature.emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Install Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0, ease: 'easeOut' }}
          className="space-y-4"
        >
          <InstallButton />

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="text-sm text-gray-600"
          >
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
              Log in
            </Link>
          </motion.div>
        </motion.div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="pt-8 text-sm text-gray-500"
        >
          Perfect for Sari-Sari stores, small shops, and retail businesses
        </motion.div>
      </main>
    </div>
  );
}
