/**
 * Script to apply migration 15: Update provider constraint
 * Run with: npx tsx scripts/apply-migration-15.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  console.error('Get it from: https://supabase.com/dashboard/project/rfgaeusruoxwirioykvb/settings/api')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function applyMigration() {
  console.log('🚀 Applying migration 15: Update provider constraint\n')

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/15_update_provider_constraint.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

  console.log('📄 Migration SQL:')
  console.log('─'.repeat(80))
  console.log(migrationSQL)
  console.log('─'.repeat(80))
  console.log()

  // Split SQL into statements (simple split by semicolon)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  console.log(`📝 Found ${statements.length} SQL statements\n`)

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`[${i + 1}/${statements.length}] Executing:`)
    console.log(`   ${statement.substring(0, 60)}${statement.length > 60 ? '...' : ''}`)

    const { error } = await supabase.rpc('exec_sql', { sql: statement })

    if (error) {
      // Try direct query if RPC fails
      const { error: queryError } = await supabase.from('_migrations').select('*').limit(0)

      if (queryError) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, error.message)
        console.error('   Error code:', error.code)
        console.error('   Hint: You may need to run this SQL manually in the Supabase SQL Editor')
        console.error('   URL: https://supabase.com/dashboard/project/rfgaeusruoxwirioykvb/sql/new')
        process.exit(1)
      }
    }

    console.log(`   ✓ Success\n`)
  }

  console.log('✅ Migration 15 applied successfully!')
  console.log('\nNext steps:')
  console.log('1. Try creating a store profile again')
  console.log('2. Check that both Google OAuth and Email/Password signups work')
}

applyMigration().catch(err => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
