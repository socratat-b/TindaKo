'use client'

import { motion } from 'framer-motion'
import { GeneralSettingsSection } from './general-settings-section'
import { DisplaySettingsSection } from './display-settings-section'
import { InventorySettingsSection } from './inventory-settings-section'
import { SalesSettingsSection } from './sales-settings-section'
import { DataSettingsSection } from './data-settings-section'
import { AppSettingsSection } from './app-settings-section'
import { AboutSection } from './about-section'

interface SettingsInterfaceProps {
  userId: string
}

export default function SettingsInterface({ userId }: SettingsInterfaceProps) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <h1 className="text-lg lg:text-2xl font-bold">Settings</h1>
        <p className="text-xs lg:text-sm text-muted-foreground mt-1">
          Manage your store preferences and configuration
        </p>
      </motion.div>

      {/* Settings Sections */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        className="space-y-3 md:space-y-6 pb-6"
      >
        <GeneralSettingsSection />
        <DisplaySettingsSection />
        <InventorySettingsSection />
        <SalesSettingsSection />
        <DataSettingsSection />
        <AppSettingsSection />
        <AboutSection />
      </motion.div>
    </div>
  )
}
