'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Lock, Eye, Database, Cloud, UserCheck, AlertCircle } from 'lucide-react'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Noise Texture */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />

      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl" />
      </div>

      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-xl hover:bg-white hover:border-emerald-400 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Bumalik sa Home
          </Link>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border-2 border-emerald-200 overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-8 sm:px-12 py-12 sm:py-16 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-full mb-6">
                <Shield className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white tracking-wide">YOUR PRIVACY MATTERS</span>
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight"
                style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
              >
                Privacy Policy
              </h1>
              <p className="text-lg sm:text-xl text-emerald-100 font-medium">
                Transparent, secure, walang hidden agenda
              </p>
              <p className="text-sm text-emerald-200 mt-6">
                <strong>Last Updated:</strong> February 3, 2026
              </p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="px-8 sm:px-12 pt-12 pb-6">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-xl font-black text-emerald-900">Privacy Summary</h3>
                </div>
                <p className="text-emerald-800 mb-4 font-medium">
                  Your privacy is important to us. Here's what you need to know:
                </p>
                <div className="space-y-2">
                  {[
                    'Your data is stored locally on your device',
                    'Cloud backup is optional and encrypted',
                    'Only you can access your business data',
                    'We never sell your data to third parties',
                    'You can delete your data anytime'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-emerald-600 font-bold text-lg">✓</span>
                      <span className="text-emerald-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-8 sm:px-12 py-6 space-y-10">
            {/* What We Collect */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
                    Information We Collect
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">1. Authentication Information</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        When you sign in to TindaKo using Google or Facebook, we collect:
                      </p>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span className="text-gray-700"><strong>Email address:</strong> Used as your unique identifier</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span className="text-gray-700"><strong>Display name:</strong> From your Google or Facebook profile</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span className="text-gray-700"><strong>Profile picture:</strong> Optional, from your OAuth provider</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span className="text-gray-700"><strong>Store name:</strong> Your sari-sari store's name</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">2. Business Data</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        When you use TindaKo, we store your business data locally and optionally in the cloud:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {['Products', 'Categories', 'Customers', 'Sales', 'Inventory', 'Utang Records'].map((item, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-sm font-semibold text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Data Storage */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-purple-600" />
                </div>
                <div className="w-full">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
                    Data Storage & Security
                  </h2>

                  <div className="space-y-4">
                    {/* Local Storage */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
                      <h3 className="text-lg font-black text-indigo-900 mb-2">Local Storage (Device)</h3>
                      <p className="text-indigo-800 mb-3">
                        TindaKo is <strong>offline-first</strong>. All your data lives on your device:
                      </p>
                      <ul className="space-y-1 text-indigo-700 text-sm">
                        <li>✓ Works completely offline</li>
                        <li>✓ Data stored only on your device</li>
                        <li>✓ No one else can access it</li>
                      </ul>
                    </div>

                    {/* Cloud Backup */}
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-500 rounded-r-xl p-5">
                      <h3 className="text-lg font-black text-teal-900 mb-2">Cloud Backup (Optional)</h3>
                      <p className="text-teal-800 mb-3">
                        When you click "Backup to Cloud", we securely store your data:
                      </p>
                      <ul className="space-y-1 text-teal-700 text-sm">
                        <li>✓ Encrypted in transit (HTTPS)</li>
                        <li>✓ Encrypted at rest</li>
                        <li>✓ Row Level Security enabled</li>
                        <li>✓ Multi-device sync support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Data Sharing */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                    Data Sharing
                  </h2>
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6">
                    <p className="text-red-900 font-black text-lg mb-3">
                      WE DO NOT SELL YOUR DATA. PERIOD.
                    </p>
                    <p className="text-red-800 mb-3">
                      We only share data with third-party services necessary to provide the service:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span className="text-red-700"><strong>Google/Facebook:</strong> For OAuth authentication only</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span className="text-red-700"><strong>Supabase:</strong> For cloud backup and data storage</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span className="text-red-700">That's it. No one else.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Your Rights */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
                    Your Rights
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You have complete control over your data:
                  </p>
                  <div className="grid gap-3">
                    {[
                      { label: 'Access', description: 'View all your data within the app anytime' },
                      { label: 'Edit', description: 'Modify your store name and all business data' },
                      { label: 'Delete', description: 'Remove all local data from Settings' },
                      { label: 'Export', description: 'Download your data (future feature)' },
                      { label: 'Withdraw', description: 'Log out and delete your account anytime' }
                    ].map((right, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                        <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{right.label}</h4>
                          <p className="text-sm text-gray-600">{right.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Third-Party Services */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-2 border-gray-200 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-black text-gray-900">Third-Party Services</h2>
              </div>
              <p className="text-gray-700 mb-4">TindaKo uses the following services:</p>
              <div className="space-y-3">
                <div className="bg-white border border-blue-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">Google OAuth</h3>
                  <p className="text-sm text-gray-600 mb-3">For Google sign-in authentication.</p>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline"
                  >
                    View Google Privacy Policy →
                  </a>
                </div>
                <div className="bg-white border border-blue-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">Facebook OAuth</h3>
                  <p className="text-sm text-gray-600 mb-3">For Facebook sign-in authentication.</p>
                  <a
                    href="https://www.facebook.com/privacy/policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline"
                  >
                    View Facebook Privacy Policy →
                  </a>
                </div>
                <div className="bg-white border border-blue-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">Supabase</h3>
                  <p className="text-sm text-gray-600 mb-3">For cloud data backup and authentication.</p>
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline"
                  >
                    View Supabase Privacy Policy →
                  </a>
                </div>
              </div>
            </motion.section>

            {/* Contact Information */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-gradient-to-br from-orange-50 to-amber-50/30 border-2 border-orange-200 rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                Questions about this Privacy Policy or how we handle your data?
              </p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong className="text-gray-900">Email:</strong>{' '}
                  <a href="mailto:support@tindako.app" className="text-orange-600 hover:text-orange-700 font-semibold underline">
                    support@tindako.app
                  </a>
                </p>
                <p><strong className="text-gray-900">Project:</strong> TindaKo - Offline-first POS PWA</p>
                <p><strong className="text-gray-900">Location:</strong> Philippines</p>
              </div>
            </motion.section>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 sm:px-12 py-8 border-t-2 border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">
              This privacy policy is effective as of February 3, 2026
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
              <Link href="/" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                Return to TindaKo
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/terms-of-service" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/data-deletion" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                Data Deletion
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
