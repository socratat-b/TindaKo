'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PrivacyPolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyPolicyDialog({ open, onOpenChange }: PrivacyPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: January 23, 2026
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
              <p className="text-muted-foreground">
                TindaKo ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our offline-first Point of Sale application.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Information We Collect</h3>
              <p className="text-muted-foreground mb-2">We collect the following information:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li><strong>Account Information:</strong> Email address and password (encrypted)</li>
                <li><strong>Business Data:</strong> Store name, products, inventory, sales transactions, customer information (names, utang records)</li>
                <li><strong>Settings:</strong> App preferences (theme, language, timezone)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. How We Store Your Data</h3>
              <p className="text-muted-foreground mb-2">
                TindaKo is an <strong>offline-first application</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li><strong>Local Storage:</strong> All your data is stored locally on your device using IndexedDB (via Dexie.js)</li>
                <li><strong>Cloud Backup:</strong> When you manually click "Backup to Cloud", your data is encrypted and stored in Supabase (PostgreSQL database) as a backup</li>
                <li><strong>Your Control:</strong> You have full control over when data is backed up to the cloud</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. How We Use Your Information</h3>
              <p className="text-muted-foreground mb-2">We use your information to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Provide and maintain the TindaKo POS application</li>
                <li>Authenticate your account and secure your data</li>
                <li>Backup and restore your business data when you request it</li>
                <li>Improve and optimize the application</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Data Security</h3>
              <p className="text-muted-foreground">
                We implement industry-standard security measures including encryption, secure authentication (Supabase Auth), and Row Level Security (RLS) policies to ensure your data is only accessible by you. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Data Sharing</h3>
              <p className="text-muted-foreground">
                We do NOT sell, trade, or share your personal or business data with third parties. Your data is yours alone. The only third-party service we use is Supabase for cloud backup storage, which is bound by their own privacy policies.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Your Rights</h3>
              <p className="text-muted-foreground mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Access your data at any time (it's stored locally on your device)</li>
                <li>Delete your data using the "Clear Local Data" option in settings</li>
                <li>Request deletion of your cloud backup by contacting us</li>
                <li>Export your data (currently manual, future feature)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Data Retention</h3>
              <p className="text-muted-foreground">
                Local data is retained on your device until you manually clear it. Cloud backups are retained as long as your account is active. If you delete your account, all cloud data will be permanently deleted within 30 days.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Children's Privacy</h3>
              <p className="text-muted-foreground">
                TindaKo is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Changes to This Policy</h3>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">11. Contact Us</h3>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong> bedisscottandrew@gmail.com
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
