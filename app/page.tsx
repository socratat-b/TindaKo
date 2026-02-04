'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { InstallButton } from '@/components/pwa/install-button'
import {
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
  ArrowRight,
  Sparkles,
  Heart,
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
    description: 'Google or Facebook login. Quick, easy, at secure.',
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
    text: 'Secure cloud backup with encryption',
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />

      {/* Decorative Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(217, 119, 6) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(217, 119, 6) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Bold Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              x: [0, 30, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 -left-32 w-80 h-80 bg-gradient-to-tr from-emerald-500/15 to-green-600/15"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          />
          <motion.div
            animate={{
              rotate: [0, -180, 0],
              y: [0, -40, 0]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-bl from-rose-400/20 to-pink-500/20 rounded-3xl blur-2xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center relative"
          >
            {/* Decorative Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300/50 rounded-full mb-6 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-bold text-orange-800 tracking-wide">LIBRE • OFFLINE • MABILIS</span>
            </motion.div>

            {/* Heading with Custom Typography */}
            <motion.h1
              variants={itemVariants}
              className="relative mb-4"
              style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
            >
              <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-2">
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm">
                  TindaKo
                </span>
              </span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
                Para sa iyong{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-emerald-700">Tindahan</span>
                  <motion.span
                    className="absolute inset-x-0 bottom-1 h-3 bg-emerald-300/60 -rotate-1"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                  />
                </span>
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed font-medium"
            >
              Walang internet? <span className="text-orange-600 font-bold">Walang problema!</span>
              <br className="hidden sm:block" />
              Point of Sale system na <span className="italic">tunay na gumagana offline</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-bold text-white bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/40 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-700 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">Simulan Ngayon</span>
                  <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <InstallButton />

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-gray-900 bg-white border-3 border-gray-900 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-lg"
                >
                  Log In
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Indicators - Redesigned */}
            <motion.div
              variants={itemVariants}
              className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-6 py-4 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-sm"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <benefit.icon className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                  <span className="text-sm font-semibold text-gray-700">{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-b from-white/80 to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <span className="inline-block px-4 py-2 bg-orange-100 border-2 border-orange-300 rounded-full text-sm font-bold text-orange-700 tracking-wide mb-6">
              COMPLETE SOLUTION
            </span>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight"
              style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
            >
              Lahat ng Kailangan Mo,{' '}
              <span className="text-orange-600">Nandito Na</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              Kompletong POS system, walang kulang
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-orange-300 transition-all duration-500 overflow-hidden"
              >
                {/* Decorative Corner */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500" />

                {/* Accent Bar */}
                <motion.div
                  className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${feature.accent}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                />

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-6 inline-flex">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${feature.accent} shadow-xl`}
                    >
                      <feature.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-orange-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
            >
              Sobrang <span className="text-orange-400">Dali Lang</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              Tatlong hakbang lang, tapos na!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connector Lines */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

            {[
              {
                step: '1',
                title: 'Install & Sign Up',
                description: 'I-install ang app at mag-login gamit ang Google or Facebook',
                icon: Smartphone,
                color: 'from-orange-500 to-amber-500'
              },
              {
                step: '2',
                title: 'Setup Products',
                description: 'Idagdag ang mga produkto, categories, at presyo',
                icon: Package,
                color: 'from-amber-500 to-yellow-500'
              },
              {
                step: '3',
                title: 'Start Selling',
                description: 'Magsimulang mag-benta offline. Backup to cloud anytime.',
                icon: Zap,
                color: 'from-emerald-500 to-green-500'
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative text-center group"
              >
                {/* Step Number Badge */}
                <motion.div
                  className="mb-8 inline-flex relative"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-full blur-2xl opacity-60`} />
                  <div className={`relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20`}>
                    <step.icon className="w-12 h-12 sm:w-14 sm:h-14 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-gray-900">
                    <span className="text-xl font-black text-gray-900">{step.step}</span>
                  </div>
                </motion.div>

                <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 group-hover:text-orange-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg font-medium max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-amber-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-300/30 to-green-400/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-3 border-orange-400 rounded-full mb-8 shadow-xl"
            >
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <span className="text-sm font-black text-gray-900 tracking-wide">
                MADE WITH LOVE FOR PINOY STORE OWNERS
              </span>
            </motion.div>

            <h2
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight"
              style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
            >
              Handa Ka Na Ba?
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Simulan Mo Na!
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Libu-libong sari-sari store owners ang gumagamit na ng TindaKo.
              <br className="hidden sm:block" />
              <span className="text-orange-600 font-bold">Libre, walang bayad, simple lang!</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center justify-center gap-3 px-12 py-6 text-xl font-black text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">Simulan Ngayon - LIBRE!</span>
                  <Sparkles className="w-6 h-6 relative" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-12 py-6 text-xl font-black text-gray-900 bg-white border-4 border-gray-900 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-xl"
                >
                  May Account Na?
                </Link>
              </motion.div>
            </div>

            {/* Trust Line */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-12 text-sm text-gray-600 font-medium"
            >
              ✓ Walang credit card needed • ✓ Setup in 2 minutes • ✓ Offline-ready agad
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-950 text-gray-300 py-12 sm:py-16 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-xl">
                <Store className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span
                className="text-3xl font-black text-white"
                style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
              >
                TindaKo
              </span>
            </div>

            <p className="text-lg font-medium text-gray-400 mb-8 max-w-md">
              Offline-First POS para sa Philippine Sari-Sari Stores
            </p>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm font-semibold">
              <Link href="/terms-of-service" className="text-gray-400 hover:text-orange-400 transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-orange-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/data-deletion" className="text-gray-400 hover:text-orange-400 transition-colors">
                Data Deletion
              </Link>
            </div>

            {/* Copyright */}
            <div className="pt-8 border-t border-gray-700/50 w-full max-w-2xl">
              <p className="text-sm text-gray-500">
                © 2026 TindaKo. Built with <Heart className="inline w-4 h-4 text-red-500 fill-red-500 mx-1" /> for Filipino store owners.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Simple. Mabilis. Offline.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
