'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TermsOfServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsOfServiceDialog({ open, onOpenChange }: TermsOfServiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Last updated: January 23, 2026
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing and using TindaKo ("the Application"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Application.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Description of Service</h3>
              <p className="text-muted-foreground">
                TindaKo is an offline-first Point of Sale (POS) application designed for small retail businesses in the Philippines, particularly Sari-Sari stores. The Application allows you to manage inventory, process sales, track customer credit (utang), and generate reports.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. User Accounts</h3>
              <p className="text-muted-foreground mb-2">To use TindaKo, you must:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Create an account with a valid email address</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Be at least 13 years of age or have parental consent</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. License to Use</h3>
              <p className="text-muted-foreground">
                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use TindaKo for your personal or business use. This is <strong>free software</strong> provided as-is for your benefit.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Acceptable Use</h3>
              <p className="text-muted-foreground mb-2">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Use the Application for any illegal purposes</li>
                <li>Attempt to gain unauthorized access to the Application or its systems</li>
                <li>Interfere with or disrupt the Application's functionality</li>
                <li>Reverse engineer, decompile, or disassemble the Application</li>
                <li>Use the Application to store or transmit malicious code</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Data and Backups</h3>
              <p className="text-muted-foreground">
                <strong>YOU ARE RESPONSIBLE FOR YOUR DATA.</strong> While TindaKo provides cloud backup functionality, you should maintain your own backups. We are not responsible for any data loss that may occur. The Application stores data locally on your device, and you control when to backup to the cloud.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Disclaimer of Warranties</h3>
              <p className="text-muted-foreground">
                THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. We do not guarantee that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 mt-2">
                <li>The Application will be error-free or uninterrupted</li>
                <li>Defects will be corrected</li>
                <li>The Application is free of viruses or harmful components</li>
                <li>The results from using the Application will meet your requirements</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Limitation of Liability</h3>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 mt-2">
                <li>Your use or inability to use the Application</li>
                <li>Any unauthorized access to or use of your data</li>
                <li>Any interruption or cessation of the Application</li>
                <li>Any bugs, viruses, or errors in the Application</li>
                <li>Any business decisions made based on data from the Application</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Financial Responsibility</h3>
              <p className="text-muted-foreground">
                TindaKo is a tool to help you manage your business. You are solely responsible for all financial decisions, tax compliance, accounting accuracy, and business operations. We are not accountants, lawyers, or financial advisors. Consult professionals for business and financial advice.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Modifications to Service</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify, suspend, or discontinue the Application at any time without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">11. Termination</h3>
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the Application immediately, without prior notice, if you breach these Terms. Upon termination, your right to use the Application will cease immediately.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">12. Governing Law</h3>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">13. Open Source</h3>
              <p className="text-muted-foreground">
                TindaKo is open-source software. The source code is available on GitHub at: <a href="https://github.com/socratat-b/TindaKo" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/socratat-b/TindaKo</a>
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">14. Changes to Terms</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last updated" date. Your continued use of the Application after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">15. Contact Information</h3>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Developer:</strong> Scott Andrew Bedis<br />
                <strong>Email:</strong> bedisscottandrew@gmail.com<br />
                <strong>GitHub:</strong> <a href="https://github.com/socratat-b/TindaKo" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/socratat-b/TindaKo</a>
              </p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-muted-foreground text-xs">
                By using TindaKo, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
