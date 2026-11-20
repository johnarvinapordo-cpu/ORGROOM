import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { ensureDatabase, pool } from '../server/db.js';
import { MAX_ACCOUNT_CAPACITY, ACCOUNT_CAPACITY_LOCK_NAME } from '../server/account-config.js';

const normalizeEmail = value => String(value || '').trim().toLowerCase();
const allowedEmail = value => /^[^\s@]+@(gmail\.com|cmdi\.edu\.ph)$/i.test(value);
const strongPassword = value => typeof value === 'string' && value.length >= 12 && /[A-Za-z]/.test(value) && /\d/.test(value);

let connection;
let lockAcquired = false;
let transactionStarted = false;

try {
  await ensureDatabase();
  connection = await pool.getConnection();
  const [lockRows] = await connection.query('SELECT GET_LOCK(?, 15) AS acquired', [ACCOUNT_CAPACITY_LOCK_NAME]);
  lockAcquired = Number(lockRows[0]?.acquired) === 1;
  if (!lockAcquired) throw new Error('Could not obtain the account provisioning lock. Try again.');

  await connection.beginTransaction();
  transactionStarted = true;

  const [setupRows] = await connection.query(
    'SELECT setup_key FROM orgroom_security_setup WHERE setup_key=? LIMIT 1',
    ['INITIAL_SUPER_ADMIN']
  );
  if (setupRows.length) throw new Error('Initial Super Admin setup has already been completed. This command cannot be reused.');

  const [existingSuperAdmins] = await connection.query(
    "SELECT id FROM users WHERE UPPER(role)='SUPER_ADMIN' ORDER BY id LIMIT 1"
  );
  if (existingSuperAdmins.length) {
    await connection.query(
      'INSERT INTO orgroom_security_setup (setup_key,completed_by_user_id) VALUES (?,?)',
      ['INITIAL_SUPER_ADMIN', Number(existingSuperAdmins[0].id)]
    );
    await connection.commit();
    transactionStarted = false;
    console.log('A Super Admin account already exists. The existing account was preserved and one-time setup is now locked. No account was created.');
  } else {
    const name = String(process.env.SUPER_ADMIN_NAME || '').trim().slice(0, 255);
    const email = normalizeEmail(process.env.SUPER_ADMIN_EMAIL);
    const password = process.env.SUPER_ADMIN_PASSWORD || '';

    if (!name || !allowedEmail(email) || !strongPassword(password)) {
      throw new Error('Set SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, and a SUPER_ADMIN_PASSWORD of at least 12 characters containing letters and numbers in the current terminal session.');
    }

    const [countRows] = await connection.query('SELECT COUNT(*) AS total FROM users');
    const currentCount = Number(countRows[0]?.total || 0);
    if (currentCount >= MAX_ACCOUNT_CAPACITY) {
      throw new Error(`The account capacity is already reached (${currentCount} / ${MAX_ACCOUNT_CAPACITY}). No account was created.`);
    }

    const [existingEmail] = await connection.query('SELECT id FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1', [email]);
    if (existingEmail.length) throw new Error('That email already belongs to an existing ORGROOM account. Use a different authorized email for the initial Super Admin.');

    const passwordHash = await bcrypt.hash(password, 12);
    const [created] = await connection.query(
      'INSERT INTO users (name,email,password_hash,role,organization,department,position,is_verified,is_active) VALUES (?,?,?,?,?,?,?,1,1)',
      [name, email, passwordHash, 'SUPER_ADMIN', 'Administration', 'Administration', 'Super Administrator']
    );
    await connection.query(
      'INSERT INTO orgroom_security_setup (setup_key,completed_by_user_id) VALUES (?,?)',
      ['INITIAL_SUPER_ADMIN', Number(created.insertId)]
    );
    await connection.commit();
    transactionStarted = false;
    console.log('Initial Super Admin account created and one-time setup locked. Sign in using the credentials supplied for this command.');
  }
} catch (error) {
  if (transactionStarted && connection) {
    try { await connection.rollback(); } catch {}
  }
  console.error(`Super Admin setup failed: ${error.message || error}`);
  process.exitCode = 1;
} finally {
  if (connection) {
    if (lockAcquired) {
      try { await connection.query('SELECT RELEASE_LOCK(?)', [ACCOUNT_CAPACITY_LOCK_NAME]); } catch {}
    }
    connection.release();
  }
  await pool.end();
}
