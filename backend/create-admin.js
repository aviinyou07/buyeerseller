import pool from './src/db.js';
import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  console.log('--- Create New Admin Account ---');
  try {
    const fullName = await question('Enter Full Name: ');
    const email = await question('Enter Email: ');
    const phone = await question('Enter Phone Number (e.g., +919999999999): ');
    const password = await question('Enter Password: ');

    if (!fullName || !email || !password) {
      console.log('Error: Full Name, Email, and Password are required!');
      rl.close();
      process.exit(1);
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      console.log(`Error: User with email ${email} already exists.`);
      rl.close();
      process.exit(1);
    }

    await pool.query(`
      INSERT INTO users (uuid, full_name, phone, email, password_hash, role, account_status, created_at, updated_at) 
      VALUES (UUID(), ?, ?, ?, ?, 'admin', 'active', NOW(), NOW())
    `, [fullName, phone || null, email, passwordHash]);

    console.log(`\nSuccess! Admin account created for ${email}.`);
  } catch (error) {
    console.error('Error creating admin account:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();

