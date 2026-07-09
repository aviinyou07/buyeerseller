import mysql from 'mysql2/promise';

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Yoganshu@123',
    database: 'kvon_buyer_seller'
  });

  try {
    const userId = 1; // test user
    const full_name = "Test Name";
    const email = "test12345@example.com";
    const phone = "+917734963084"; // Use the one from screenshot
    
    console.log("Updating users...");
    await pool.query(
      'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?',
      [full_name, email, phone, userId]
    );

    console.log("Updating user_addresses...");
    const [existing] = await pool.query(
      'SELECT id FROM user_addresses WHERE user_id = ? AND is_default = 1 LIMIT 1',
      [userId]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE user_addresses SET address_line = ? WHERE id = ?',
        ['Test address', existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO user_addresses (user_id, title, address_line, is_default) VALUES (?, ?, ?, 1)',
        [userId, 'Default Address', 'Test address']
      );
    }

    console.log("Updating seller_profiles...");
    const [existingSeller] = await pool.query('SELECT id FROM seller_profiles WHERE user_id = ? LIMIT 1', [userId]);
    
    if (existingSeller.length > 0) {
      await pool.query(
        'UPDATE seller_profiles SET business_name = ?, gst_number = ? WHERE id = ?',
        [null, null, existingSeller[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO seller_profiles (user_id, business_name, gst_number, is_verified) VALUES (?, ?, ?, 0)',
        [userId, null, null]
      );
    }

    console.log("All updates succeeded.");

  } catch (e) {
    console.error("ERROR OCCURRED:", e);
  } finally {
    await pool.end();
  }
}
test();
