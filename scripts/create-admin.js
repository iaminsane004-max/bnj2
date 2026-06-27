const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually to retrieve credentials without requiring external dotenv dependencies
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIdx = trimmed.indexOf('=');
    if (separatorIdx > 0) {
      const key = trimmed.substring(0, separatorIdx).trim();
      const value = trimmed.substring(separatorIdx + 1).trim().replace(/(^["']|["']$)/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project-id')) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Please configure your NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n🍞 \x1b[33mBake & Joy — Admin Creator\x1b[0m 🍞\n');

rl.question('Enter Owner Email: ', (email) => {
  if (!email.includes('@')) {
    console.error('\x1b[31m%s\x1b[0m', 'Invalid email address format.');
    rl.close();
    process.exit(1);
  }
  rl.question('Enter Password (min 6 chars): ', async (password) => {
    if (password.length < 6) {
      console.error('\x1b[31m%s\x1b[0m', 'Password must be at least 6 characters.');
      rl.close();
      process.exit(1);
    }
    
    try {
      console.log('\nCreating user in Supabase Auth...');
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password: password,
        email_confirm: true, // auto-confirms email verification
      });

      if (error) throw error;

      console.log('\x1b[32m%s\x1b[0m', `\nSuccess! Created admin user account: ${data.user.email}`);
      console.log('You can now log in at http://localhost:3000/admin/login');
    } catch (err) {
      console.error('\x1b[31m%s\x1b[0m', `\nFailed to create user: ${err.message}`);
    } finally {
      rl.close();
    }
  });
});
