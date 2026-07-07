import pool from './src/db.js';

async function alterTable() {
  try {
    console.log("Altering table otp_store...");
    // Just modify to VARCHAR(50) so it accommodates any purpose
    await pool.query("ALTER TABLE otp_store MODIFY COLUMN purpose VARCHAR(50) NOT NULL;");
    console.log("Table altered successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error altering table:", error);
    process.exit(1);
  }
}

alterTable();
