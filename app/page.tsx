'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { InstallButton } from '@/components/pwa/install-button'
import {
  Wifi,
  WifiOff,
  Package,
  CreditCard,
  BarChart3,
  Cloud,
  Smartphone,
  Lock,
  Store,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const features = [
  {
    icon: WifiOff,
    title: 'Offline-First',
    description: 'Gumagana kahit walang internet. 30 days offline capability.',
    accent: 'from-teal-500 to-emerald-500',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track products, stock levels, at low stock alerts.',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: CreditCard,
    title: 'Utang Tracking',
    description: 'Madaling record ng utang at bayad ng customers.',
    accent: 'from-violet-500 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Sales Reports',
    description: 'Tingnan ang kita, top products, at daily analytics.',
    accent: 'from-orange-500 to-amber-500',
  },
  {
    icon: Lock,
    title: 'Simple Login',
    description: 'Phone number + PIN lang. Walang email needed.',
    accent: 'from-rose-500 to-pink-500',
  },
  {
    icon: Cloud,
    title: 'Cloud Backup',
    description: 'Manual backup kapag ready ka. Restore anytime.',
    accent: 'from-indigo-500 to-blue-500',
  },
]

const benefits = [
  {
    icon: Zap,
    text: 'Fast checkout kahit maraming customers',
  },
  {
    icon: Shield,
    text: 'Secure data with PIN protection',
  },
  {
    icon: Smartphone,
    text: 'Works on any phone or tablet',
  },
  {
    icon: TrendingUp,
    text: 'Track kita at inventory real-time',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-20 w-60 h-60 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-cyan-200/30 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            {/* Logo */}
            <motion.div variants={itemVariants} className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl blur-xl opacity-60" />
                <div className="relative bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-4 sm:p-5 shadow-xl">
                  <Store className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4"
            >
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                TindaKo
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-gray-700 font-medium mb-3"
            >
              Para sa Sari-Sari Store Owners
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10"
            >
              Offline-first Point of Sale system na gumagana kahit walang internet.
              Simple, mabilis, at secure.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8"
            >
              <InstallButton />

              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/50 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Magsimula Ngayon</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-teal-700 bg-white border-2 border-teal-200 rounded-xl hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 hover:scale-105"
              >
                Log In
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
            >
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <benefit.icon className="w-4 h-4 text-teal-600" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Lahat ng Kailangan Mo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete POS solution para sa iyong tindahan
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-500 hover:-translate-y-1"
              >
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-emerald-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-4 sm:mb-5 inline-flex">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.accent} shadow-lg`}
                    >
                      <feature.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 sm:py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Paano Gumagana?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tatlong hakbang lang para magsimula
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '1',
                title: 'Install & Sign Up',
                description: 'I-install ang app at mag-register gamit ang phone number at PIN',
                icon: Smartphone,
              },
              {
                step: '2',
                title: 'Setup Products',
                description: 'Idagdag ang mga produkto, categories, at presyo',
                icon: Package,
              },
              {
                step: '3',
                title: 'Start Selling',
                description: 'Magsimulang mag-benta offline. Backup to cloud anytime.',
                icon: Zap,
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="mb-6 inline-flex relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full blur-xl opacity-40" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
                    <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-teal-500">
                    <span className="text-sm font-bold text-teal-600">{step.step}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>

                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-teal-300 to-emerald-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready Ka Na Ba?
            </h2>
            <p className="text-lg sm:text-xl text-teal-50 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of Filipino store owners using TindaKo. Free to start, easy to use.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-teal-700 bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Simulan Ngayon - Libre!</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                May Account Na?
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Store className="w-5 h-5 text-teal-500" />
            <span className="text-lg font-semibold text-white">TindaKo</span>
          </div>
          <p className="text-sm">
            Offline-First POS for Philippine Sari-Sari Stores
          </p>
          <p className="text-xs mt-4 text-gray-500">
            © 2026 TindaKo. Built with ❤️ for Filipino store owners.
          </p>
        </div>
      </footer>
    </div>
  )
}
