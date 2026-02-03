import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | TindaKo',
  description: 'Terms of Service for TindaKo - Offline-first POS for Philippine Sari-Sari Stores',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>

        <p className="text-sm text-gray-600 mb-8">
          <strong>Last Updated:</strong> February 3, 2026
        </p>

        <div className="space-y-8 text-gray-700">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              Welcome to TindaKo, an offline-first Point of Sale (POS) application for Philippine
              Sari-Sari stores. By accessing or using TindaKo, you agree to be bound by these Terms
              of Service.
            </p>
            <p>
              If you do not agree to these terms, please do not use TindaKo.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              TindaKo provides an offline-first POS system that allows you to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Manage products, inventory, and categories</li>
              <li>Process sales transactions (cash, GCash, credit/utang)</li>
              <li>Track customer credit (utang) and payments</li>
              <li>Generate sales reports and analytics</li>
              <li>Backup data to the cloud (optional)</li>
              <li>Sync data across multiple devices</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="mb-4">
              To use TindaKo, you must create an account by signing in with Google or Facebook.
              You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree to use TindaKo only for lawful purposes. You will NOT:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the service for any illegal activities</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Upload malicious code or viruses</li>
              <li>Interfere with the proper functioning of the service</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Use the service to store or transmit illegal content</li>
            </ul>
          </section>

          {/* Data and Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data and Privacy</h2>
            <p className="mb-4">
              Your use of TindaKo is subject to our{' '}
              <a href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              . By using TindaKo, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your data is stored locally on your device</li>
              <li>Cloud backup is optional and encrypted</li>
              <li>You are responsible for backing up your data</li>
              <li>We are not liable for data loss</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="mb-4">
              TindaKo and all its contents, features, and functionality are owned by the TindaKo
              team and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mb-4">You retain ownership of:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your business data (products, sales, customers)</li>
              <li>Your store name and branding</li>
              <li>Any content you create within TindaKo</li>
            </ul>
          </section>

          {/* Offline Functionality */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Offline Functionality</h2>
            <p className="mb-4">
              TindaKo is designed to work offline. However, please note:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Cloud backup requires an internet connection</li>
              <li>OAuth sign-in requires internet (first time only)</li>
              <li>Multi-device sync requires internet connection</li>
              <li>Offline functionality depends on your device's browser capabilities</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="mb-4">
              TindaKo is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.
              To the fullest extent permitted by law:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We are not liable for any data loss or corruption</li>
              <li>We are not liable for business losses or damages</li>
              <li>We are not liable for third-party service interruptions</li>
              <li>You use TindaKo at your own risk</li>
            </ul>
            <p className="mt-4 font-medium">
              IMPORTANT: Always maintain regular backups of your business data.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
            <p className="mb-4">
              While TindaKo works offline, cloud services may experience downtime. We do not
              guarantee:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>100% uptime for cloud backup services</li>
              <li>Immediate sync across devices</li>
              <li>Availability of third-party OAuth services</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="mb-4">
              You may terminate your account at any time by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Logging out and clearing your local data</li>
              <li>Contacting us to delete your cloud data</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="mb-4">
              We may modify these Terms of Service at any time. Changes will be effective
              immediately upon posting. Your continued use of TindaKo after changes constitutes
              acceptance of the modified terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p>
              These Terms of Service are governed by the laws of the Philippines. Any disputes
              shall be resolved in the courts of the Philippines.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email:</strong> <a href="mailto:support@tindako.app" className="text-blue-600 hover:underline">support@tindako.app</a></p>
              <p className="mt-2"><strong>Project:</strong> TindaKo - Offline-first POS PWA</p>
              <p className="mt-2"><strong>Location:</strong> Philippines</p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="font-medium text-yellow-900 mb-3">Important Notice:</p>
              <p className="text-yellow-800">
                TindaKo is a tool to help you manage your sari-sari store. However, you are
                ultimately responsible for:
              </p>
              <ul className="mt-3 space-y-2 text-yellow-800">
                <li>✓ Accuracy of your business records</li>
                <li>✓ Compliance with local tax and business laws</li>
                <li>✓ Backing up your data regularly</li>
                <li>✓ Security of your device and account</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
          <p>These terms are effective as of February 3, 2026</p>
          <p className="mt-2">
            <a href="/" className="text-blue-600 hover:underline">
              Return to TindaKo
            </a>
            {' • '}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
