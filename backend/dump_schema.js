import mysql from 'mysql2/promise';

async function dump() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Yoganshu@123',
    database: 'kvon_buyer_seller'
  });

  try {
    const [addr] = await pool.query('DESCRIBE user_addresses');
    console.log('user_addresses:', addr);
    const [sell] = await pool.query('DESCRIBE seller_profiles');
    console.log('seller_profiles:', sell);
    const [users] = await pool.query('DESCRIBE users');
    console.log('users:', users);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
dump();
