import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Read JWT_SECRET from .env
const envPath = path.join(process.cwd(), '.env');
const env = fs.readFileSync(envPath, 'utf8');
const secretMatch = env.match(/JWT_SECRET=(.*)/);
const JWT_SECRET = secretMatch ? secretMatch[1].trim() : 'your_jwt_secret_key_here';

const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '24h' });
console.log('Token:', token);

// Test GET /api/wishlists
async function testWishlist() {
  try {
    const res = await fetch('http://localhost:4000/api/wishlists', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    console.log('Wishlist status:', res.status);
    console.log('Wishlist data:', data);
  } catch (err) {
    console.error('Error fetching wishlists:', err.message);
  }
}

testWishlist();
