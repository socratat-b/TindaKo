import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | TindaKo',
  description: 'Privacy Policy for TindaKo - Offline-first POS for Philippine Sari-Sari Stores',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

        <p className="text-sm text-gray-600 mb-8">
          <strong>Last Updated:</strong> February 3, 2026
        </p>

        <div className="space-y-8 text-gray-700">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="mb-4">
              Welcome to TindaKo, an offline-first Point of Sale (POS) application designed
              specifically for Philippine Sari-Sari stores. We are committed to protecting your
              privacy and ensuring the security of your personal information.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, and protect your data
              when you use TindaKo.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-medium text-gray-800 mb-3">1. Authentication Information</h3>
            <p className="mb-4">
              When you sign in to TindaKo using Google or Facebook, we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Email address:</strong> Used as your unique identifier</li>
              <li><strong>Display name:</strong> From your Google or Facebook profile</li>
              <li><strong>Profile picture:</strong> Optional, from your OAuth provider</li>
              <li><strong>OAuth provider:</strong> Whether you signed in via Google or Facebook</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">2. Store Information</h3>
            <p className="mb-4">You provide the following information:</p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Store name:</strong> Your sari-sari store's name (editable)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">3. Business Data</h3>
            <p className="mb-4">
              When you use TindaKo, we store your business data locally on your device and
              optionally back it up to the cloud:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Products (names, prices, stock quantities, barcodes)</li>
              <li>Categories</li>
              <li>Customers (names, phone numbers, addresses - if you add them)</li>
              <li>Sales transactions</li>
              <li>Inventory movements</li>
              <li>Customer credit/utang records</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Authenticate you:</strong> Verify your identity when you sign in</li>
              <li><strong>Provide the service:</strong> Enable POS functionality for your store</li>
              <li><strong>Sync your data:</strong> Backup your business data across devices</li>
              <li><strong>Personalize experience:</strong> Display your store name and profile</li>
              <li><strong>Restore your data:</strong> Recover your data when you log in on a new device</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Storage and Security</h2>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Local Storage</h3>
            <p className="mb-4">
              TindaKo is an <strong>offline-first application</strong>. All your data is stored
              locally on your device using IndexedDB (browser database). This means:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Your data works completely offline</li>
              <li>Data is stored only on your device by default</li>
              <li>No one else can access your local data</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Cloud Backup (Optional)</h3>
            <p className="mb-4">
              When you click "Backup to Cloud", we securely store your data in Supabase
              (our database provider):
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Data is encrypted in transit (HTTPS)</li>
              <li>Data is encrypted at rest</li>
              <li>Only you can access your data (Row Level Security enabled)</li>
              <li>Used for multi-device sync and data recovery</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Data Isolation</h3>
            <p className="mb-4">
              Your data is completely isolated from other users. We use Row Level Security (RLS)
              to ensure you can only access your own data.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="mb-4">TindaKo uses the following third-party services:</p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">1. Google OAuth</h3>
                <p>For Google sign-in authentication. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google's Privacy Policy</a>.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">2. Facebook OAuth</h3>
                <p>For Facebook sign-in authentication. See <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook's Privacy Policy</a>.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">3. Supabase</h3>
                <p>For cloud data backup and authentication. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase's Privacy Policy</a>.</p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
            <p className="mb-4">
              <strong>We do NOT sell, trade, or rent your personal information or business data
              to third parties.</strong>
            </p>
            <p className="mb-4">
              We only share data with third-party services as necessary to provide the service:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Google/Facebook (for OAuth authentication only)</li>
              <li>Supabase (for cloud backup and data storage)</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="mb-4">You have the following rights regarding your data:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> You can access all your data within the app at any time</li>
              <li><strong>Export:</strong> You can export your data (future feature)</li>
              <li><strong>Delete:</strong> You can delete all your local data from Settings</li>
              <li><strong>Correct:</strong> You can edit your store name and all business data</li>
              <li><strong>Withdraw consent:</strong> You can log out and delete your account</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="mb-4">We retain your data as follows:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Local data:</strong> Remains on your device until you manually delete it</li>
              <li><strong>Cloud backup:</strong> Retained indefinitely unless you request deletion</li>
              <li><strong>Authentication data:</strong> Retained as long as your account is active</li>
            </ul>
            <p className="mt-4">
              To permanently delete your account and all cloud data, please contact us.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p>
              TindaKo is intended for business use only. We do not knowingly collect personal
              information from children under 13. If you believe we have collected information
              from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by updating the "Last Updated" date at the top of this policy.
            </p>
            <p>
              Continued use of TindaKo after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or how we handle your data,
              please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email:</strong> <a href="mailto:support@tindako.app" className="text-blue-600 hover:underline">support@tindako.app</a></p>
              <p className="mt-2"><strong>Project:</strong> TindaKo - Offline-first POS PWA</p>
              <p className="mt-2"><strong>Location:</strong> Philippines</p>
            </div>
          </section>

          {/* Summary */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="font-medium text-blue-900 mb-3">Your Privacy Matters:</p>
              <ul className="space-y-2 text-blue-800">
                <li>✓ Your data is stored locally on your device</li>
                <li>✓ Cloud backup is optional and encrypted</li>
                <li>✓ Only you can access your business data</li>
                <li>✓ We never sell your data to third parties</li>
                <li>✓ You can delete your data anytime</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
          <p>This privacy policy is effective as of February 3, 2026</p>
          <p className="mt-2">
            <a href="/" className="text-blue-600 hover:underline">
              Return to TindaKo
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
