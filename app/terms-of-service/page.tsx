'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, FileText } from 'lucide-react'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function TermsOfServicePage() {
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
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl" />
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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-xl hover:bg-white hover:border-orange-400 transition-all duration-300 shadow-sm hover:shadow-md"
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
          className="mx-auto max-w-4xl bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border-2 border-orange-200 overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 px-8 sm:px-12 py-12 sm:py-16 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-full mb-6">
                <FileText className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white tracking-wide">LEGAL DOCUMENT</span>
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight"
                style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
              >
                Terms of Service
              </h1>
              <p className="text-lg sm:text-xl text-orange-100 font-medium">
                Simple, straightforward, walang lihim
              </p>
              <p className="text-sm text-orange-200 mt-6">
                <strong>Last Updated:</strong> February 3, 2026
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 sm:px-12 py-12 space-y-10">
            {/* Introduction */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-black text-orange-600">1</span>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                    Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Welcome to TindaKo, an offline-first Point of Sale (POS) application for Philippine
                    Sari-Sari stores. By accessing or using TindaKo, you agree to be bound by these Terms
                    of Service.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    If you do not agree to these terms, please do not use TindaKo.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Description of Service */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-black text-orange-600">2</span>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                    Description of Service
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    TindaKo provides an offline-first POS system that allows you to:
                  </p>
                  <div className="space-y-2">
                    {[
                      'Manage products, inventory, and categories',
                      'Process sales transactions (cash, GCash, credit/utang)',
                      'Track customer credit (utang) and payments',
                      'Generate sales reports and analytics',
                      'Backup data to the cloud (optional)',
                      'Sync data across multiple devices'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* User Accounts */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-black text-orange-600">3</span>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                    User Accounts
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To use TindaKo, you must create an account by signing in with Google or Facebook.
                    You agree to:
                  </p>
                  <div className="space-y-2">
                    {[
                      'Provide accurate and complete information',
                      'Maintain the security of your account credentials',
                      'Notify us immediately of any unauthorized access',
                      'Be responsible for all activities under your account'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Important Notice */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-300 rounded-2xl p-6 sm:p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <h3 className="text-xl font-black text-orange-900">Important Notice</h3>
                </div>
                <p className="text-orange-800 mb-3 font-medium">
                  TindaKo is a tool to help you manage your sari-sari store. However, you are
                  ultimately responsible for:
                </p>
                <div className="space-y-2">
                  {[
                    'Accuracy of your business records',
                    'Compliance with local tax and business laws',
                    'Backing up your data regularly',
                    'Security of your device and account'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-orange-600 font-bold">✓</span>
                      <span className="text-orange-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                    Limitation of Liability
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    TindaKo is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.
                    To the fullest extent permitted by law:
                  </p>
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                    <p className="text-red-800 font-bold mb-2">
                      IMPORTANT: Always maintain regular backups of your business data.
                    </p>
                    <ul className="space-y-1 text-red-700 text-sm">
                      <li>• We are not liable for any data loss or corruption</li>
                      <li>• We are not liable for business losses or damages</li>
                      <li>• You use TindaKo at your own risk</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Contact Information */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-50 to-orange-50/30 border-2 border-gray-200 rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
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
              These terms are effective as of February 3, 2026
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
              <Link href="/" className="text-orange-600 hover:text-orange-700 transition-colors">
                Return to TindaKo
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/privacy-policy" className="text-orange-600 hover:text-orange-700 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/data-deletion" className="text-orange-600 hover:text-orange-700 transition-colors">
                Data Deletion
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
