import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Deletion Instructions | TindaKo',
  description: 'How to delete your data from TindaKo',
}

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Data Deletion Instructions
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          <strong>Last Updated:</strong> February 3, 2026
        </p>

        <div className="space-y-8 text-gray-700">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Right to Delete Data</h2>
            <p className="mb-4">
              At TindaKo, we respect your right to control your personal information. You can
              delete your data at any time using the methods described below.
            </p>
          </section>

          {/* Local Data Deletion */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Delete Local Data (Instant)
            </h2>
            <p className="mb-4">
              To delete data stored locally on your device (products, sales, customers, etc.):
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Steps:</h3>
              <ol className="space-y-3 text-blue-800">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <span>Open TindaKo and sign in to your account</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <span>Navigate to <strong>Settings</strong> from the sidebar</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <span>Scroll down to the <strong>Data Management</strong> section</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">4.</span>
                  <span>Click <strong>"Clear Local Data"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">5.</span>
                  <span>Confirm the deletion when prompted</span>
                </li>
              </ol>
              <p className="mt-4 text-sm">
                <strong>Note:</strong> This will immediately delete all business data (products,
                sales, customers, inventory, utang records) from your device. This action cannot
                be undone.
              </p>
            </div>
          </section>

          {/* Account and Cloud Data Deletion */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Delete Account & Cloud Backup (Complete Removal)
            </h2>
            <p className="mb-4">
              To permanently delete your account and all cloud backups:
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-3">Contact Us for Account Deletion:</h3>
              <div className="space-y-4 text-red-800">
                <p>
                  Send an email to:{' '}
                  <a
                    href="mailto:support@tindako.app?subject=Data Deletion Request"
                    className="font-medium underline"
                  >
                    support@tindako.app
                  </a>
                </p>
                <div>
                  <p className="font-medium mb-2">Include in your email:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Subject:</strong> Data Deletion Request
                    </li>
                    <li>
                      <strong>Email address:</strong> The email you used to sign in (Google or
                      Facebook email)
                    </li>
                    <li>
                      <strong>Store name:</strong> Your store's name (if you remember it)
                    </li>
                    <li>
                      <strong>Confirmation:</strong> State "I want to permanently delete my
                      account and all associated data"
                    </li>
                  </ul>
                </div>
                <p className="mt-4">
                  <strong>Processing time:</strong> We will process your request within{' '}
                  <strong>7 business days</strong> and send you a confirmation email.
                </p>
              </div>
            </div>
          </section>

          {/* What Gets Deleted */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Gets Deleted?</h2>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  ✓ Account Information Deleted:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Your email address</li>
                  <li>Store name</li>
                  <li>Profile picture (from OAuth provider)</li>
                  <li>OAuth provider association</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  ✓ Business Data Deleted:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>All products and categories</li>
                  <li>All sales transactions</li>
                  <li>Customer records (names, phone numbers, addresses)</li>
                  <li>Customer credit/utang records</li>
                  <li>Inventory movements</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-yellow-50">
                <h3 className="font-semibold text-gray-900 mb-2">
                  ⓘ What Is NOT Deleted:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>
                    Anonymized usage logs (for debugging and improving the service - no personal
                    identifiers)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Revoke OAuth Access */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Revoke OAuth Access (Optional)
            </h2>
            <p className="mb-4">
              If you signed in with Google or Facebook, you can also revoke TindaKo's access:
            </p>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Google:</h3>
                <ol className="space-y-2 text-gray-700">
                  <li>1. Go to <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Account Permissions</a></li>
                  <li>2. Find "TindaKo" in the list</li>
                  <li>3. Click "Remove Access"</li>
                </ol>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Facebook:</h3>
                <ol className="space-y-2 text-gray-700">
                  <li>1. Go to <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Apps and Websites</a></li>
                  <li>2. Find "TindaKo" in the list</li>
                  <li>3. Click "Remove"</li>
                </ol>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              <strong>Note:</strong> Revoking OAuth access will log you out but does NOT delete
              your data from TindaKo. You must still follow step 2 above to delete your account
              and data.
            </p>
          </section>

          {/* Important Notes */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Notes</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-xl">⚠️</span>
                  <span>
                    <strong>Data deletion is permanent.</strong> Once deleted, your data cannot
                    be recovered.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-xl">💾</span>
                  <span>
                    <strong>Backup before deleting.</strong> If you think you might need your
                    data later, export or screenshot your important information first.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-xl">🌐</span>
                  <span>
                    <strong>Multi-device data.</strong> Deleting local data only affects the
                    current device. To delete all data across all devices, request account
                    deletion via email.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-xl">📧</span>
                  <span>
                    <strong>Confirmation email.</strong> You will receive an email confirming
                    when your data has been completely deleted.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Questions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions?</h2>
            <p className="mb-4">
              If you have any questions about data deletion or need assistance, contact us:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:support@tindako.app" className="text-blue-600 hover:underline">
                  support@tindako.app
                </a>
              </p>
              <p className="mt-2 text-sm text-blue-800">
                We typically respond within 1-2 business days.
              </p>
            </div>
          </section>

          {/* Related Pages */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Related Pages</h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:underline font-medium"
              >
                Privacy Policy →
              </a>
              <a
                href="/terms-of-service"
                className="text-blue-600 hover:underline font-medium"
              >
                Terms of Service →
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
          <p>
            <a href="/" className="text-blue-600 hover:underline">
              Return to TindaKo
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
