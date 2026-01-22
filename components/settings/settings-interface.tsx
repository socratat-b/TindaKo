'use client'

import { motion } from 'framer-motion'
import { GeneralSettingsSection } from './general-settings-section'
import { DisplaySettingsSection } from './display-settings-section'
import { InventorySettingsSection } from './inventory-settings-section'
import { SalesSettingsSection } from './sales-settings-section'
import { DataSettingsSection } from './data-settings-section'
import { AboutSection } from './about-section'

interface SettingsInterfaceProps {
  userId: string
}

export default function SettingsInterface({ userId }: SettingsInterfaceProps) {
  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="mb-4 lg:mb-6"
      >
        <h1 className="text-lg lg:text-2xl font-bold">Settings</h1>
        <p className="text-xs lg:text-sm text-muted-foreground mt-1">
          Manage your store preferences and configuration
        </p>
      </motion.div>

      {/* Scrollable Content */}
      <div className="h-[calc(100vh-12rem)] lg:h-[calc(100vh-14rem)] overflow-y-auto">
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
          <DataSettingsSection userId={userId} />
          <AboutSection />
        </motion.div>
      </div>
    </div>
  )
}
