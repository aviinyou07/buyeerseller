import mysql from 'mysql2/promise';

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Yoganshu@123',
    database: 'kvon_buyer_seller'
  });

  try {
    const userId = 2; // Test user 2
    const email = ""; // empty email
    
    await pool.query(
      'UPDATE users SET email = ? WHERE id = ?',
      [email, userId]
    );
    console.log("Empty email update succeeded.");

  } catch (e) {
    console.error("ERROR OCCURRED:", e.message);
  } finally {
    await pool.end();
  }
}
test();
