/**
 * Emergency fix: Drop constraints blocking auth signup
 * This script uses the anon key with RPC to execute SQL
 */

const https = require('https');

const SUPABASE_URL = 'https://rfgaeusruoxwirioykvb.supabase.co';
const ANON_KEY = 'sb_publishable_Q1Ot-NZ8PMmlLAZv351nRQ_PuGLt62I';

const SQL_STATEMENTS = [
  "ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS stores_email_key;",
  "ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS stores_provider_check;",
  "ALTER TABLE public.stores ADD CONSTRAINT stores_provider_check CHECK (provider IN ('google', 'email', 'phone'));"
];

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'rfgaeusruoxwirioykvb.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔧 Fixing database constraints...\n');

  for (let i = 0; i < SQL_STATEMENTS.length; i++) {
    const sql = SQL_STATEMENTS[i];
    console.log(`[${i + 1}/${SQL_STATEMENTS.length}] Executing:`);
    console.log(`   ${sql.substring(0, 70)}...`);

    try {
      await executeSql(sql);
      console.log('   ✅ Success\n');
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}\n`);
      console.error('You need to run this SQL manually in Supabase SQL Editor:');
      console.error('https://supabase.com/dashboard/project/rfgaeusruoxwirioykvb/sql/new\n');
      process.exit(1);
    }
  }

  console.log('✅ All constraints fixed successfully!');
}

main().catch(console.error);
