const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const seedDatabase = async () => {
  console.log('Starting raw SQL database seeding...');
  
  try {
    // Disable Foreign Key checks for clean truncation in MySQL
    await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    // Truncate existing tables using raw SQL
    const tables = [
      'daily_statistics', 'admin_audit_logs', 'notifications', 'cms_pages', 
      'banners', 'government_schemes', 'transactions', 'order_items', 'orders', 
      'listing_reports', 'listing_reviews', 'listing_comments', 'listing_approval_history', 
      'listing_attributes', 'listing_images', 'listings', 'form_fields', 'forms', 
      'admin_categories', 'seller_profiles', 'users', 'categories', 'subcategories'
    ];
    
    for (const table of tables) {
      await pool.query(`TRUNCATE TABLE ${table};`);
    }
    
    console.log('Existing tables truncated.');
    
    // Hash passwords
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    const userPasswordHash = bcrypt.hashSync('user123', 10);

    // 1. Seed Users (Admin + 5 regular users)
    await pool.query(`
      INSERT INTO users (id, uuid, full_name, phone, email, password_hash, role, account_status, created_at, updated_at) VALUES
      (1, UUID(), 'System Administrator', '+919999999999', 'admin@gmail.com', ?, 'admin', 'active', NOW(), NOW()),
      (2, UUID(), 'Rajesh Kumar', '+919876543210', 'rajesh@example.com', ?, 'user', 'active', NOW(), NOW()),
      (3, UUID(), 'Amit Sharma', '+919123456789', 'amit@example.com', ?, 'user', 'active', NOW(), NOW()),
      (4, UUID(), 'Vikram Singh', '+919345678901', 'vikram@example.com', ?, 'user', 'active', NOW(), NOW()),
      (5, UUID(), 'Suresh Patel', '+919456789012', 'suresh@example.com', ?, 'user', 'blocked', NOW(), NOW()),
      (6, UUID(), 'Pooja Verma', '+919567890123', 'pooja@example.com', ?, 'user', 'suspended', NOW(), NOW());
    `, [
      adminPasswordHash, 
      userPasswordHash, 
      userPasswordHash, 
      userPasswordHash, 
      userPasswordHash, 
      userPasswordHash
    ]);
    console.log('Users seeded.');

    // 2. Seed Seller Profiles for Rajesh (2) and Amit (3)
    await pool.query(`
      INSERT INTO seller_profiles (id, user_id, business_name, gst_number, is_verified) VALUES
      (1, 2, 'Rajesh Agri-Tools Pvt Ltd', '07AAAAA1111A1Z1', 1),
      (2, 3, 'Amit Electronics Store', '07BBBBB2222B2Z2', 0);
    `);
    console.log('Seller profiles seeded.');

    // 3. Seed Categories (Agriculture, Electronics, Vehicles, Home & Kitchen, Fashion and all subcategories)
    await pool.query(`
      INSERT INTO admin_categories (id, parent_id, name, slug, is_active) VALUES
      (1, NULL, 'Agriculture', 'agriculture', 1),
      (2, 1, 'Seeds', 'seeds', 1),
      (3, 1, 'Fertilizers', 'fertilizers', 1),
      (4, 1, 'Equipment', 'equipment', 1),
      (5, NULL, 'Electronics', 'electronics', 1),
      (6, 5, 'Mobile', 'mobile', 1),
      (7, 5, 'Laptop', 'laptop', 1),
      (8, 5, 'Accessories', 'accessories', 1),
      (20, NULL, 'Vehicles', 'vehicles', 1),
      (30, NULL, 'Home & Kitchen', 'home-kitchen', 1),
      (40, NULL, 'Fashion', 'fashion', 1),
      (9, 20, 'Car', 'car', 1),
      (10, 20, 'Bike', 'bike', 1),
      (11, 20, 'Scooter', 'scooter', 1),
      (12, 20, 'Cycle', 'cycle', 1),
      (13, 20, 'Auto Parts', 'auto-parts', 1),
      (14, 30, 'Sofa', 'sofa', 1),
      (15, 30, 'Bed', 'bed', 1),
      (16, 30, 'Table', 'table', 1),
      (17, 30, 'Chair', 'chair', 1),
      (18, 30, 'Mixer', 'mixer', 1),
      (19, 30, 'Fridge', 'fridge', 1),
      (200, 40, 'Men Wear', 'men-wear', 1),
      (21, 40, 'Women Wear', 'women-wear', 1),
      (22, 40, 'Shoes', 'shoes', 1),
      (23, 40, 'Bags', 'bags', 1),
      (24, 40, 'Watches', 'watches', 1),
      (25, 5, 'Iron', 'iron', 1),
      (26, 5, 'Induction', 'induction', 1),
      (27, 5, 'Headphones', 'headphones', 1),
      (28, 5, 'Speaker', 'speaker', 1),
      (29, 5, 'Camera', 'camera', 1);
    `);

    await pool.query(`
      INSERT INTO categories (id, slug, title, title_key, description, description_key, accent) VALUES
      (1, 'agriculture', 'Agriculture', 'agriculture', 'Farming tools, seeds and fertilizers', 'agricultureDesc', 'blue'),
      (5, 'electronics', 'Electronics', 'electronics', 'Mobiles, laptops, appliances', 'electronicsDesc', 'blue'),
      (20, 'vehicles', 'Vehicles', 'vehicles', 'Cars, bikes, auto accessories', 'vehiclesDesc', 'green'),
      (30, 'home-kitchen', 'Home & Kitchen', 'homeKitchen', 'Sofa, tables, bed, appliances', 'homeKitchenDesc', 'orange'),
      (40, 'fashion', 'Fashion', 'fashion', 'Clothing, bags, shoes, watches', 'fashionDesc', 'purple');
    `);

    await pool.query(`
      INSERT INTO subcategories (id, category_id, slug, name, image) VALUES
      (2, 1, 'seeds', 'Seeds', ''),
      (3, 1, 'fertilizers', 'Fertilizers', ''),
      (4, 1, 'equipment', 'Equipment', ''),
      (6, 5, 'mobile', 'Mobile', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'),
      (7, 5, 'laptop', 'Laptop', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300'),
      (8, 5, 'accessories', 'Accessories', ''),
      (9, 20, 'car', 'Car', 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=300'),
      (10, 20, 'bike', 'Bike', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300'),
      (11, 20, 'scooter', 'Scooter', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300'),
      (12, 20, 'cycle', 'Cycle', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300'),
      (13, 20, 'auto-parts', 'Auto Parts', 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300'),
      (14, 30, 'sofa', 'Sofa', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300'),
      (15, 30, 'bed', 'Bed', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300'),
      (16, 30, 'table', 'Table', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300'),
      (17, 30, 'chair', 'Chair', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300'),
      (18, 30, 'mixer', 'Mixer', 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=300'),
      (19, 30, 'fridge', 'Fridge', 'https://images.unsplash.com/photo-1571175432247-5c86c457ee5b?w=300'),
      (200, 40, 'men-wear', 'Men Wear', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300'),
      (21, 40, 'women-wear', 'Women Wear', 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=300'),
      (22, 40, 'shoes', 'Shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'),
      (23, 40, 'bags', 'Bags', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300'),
      (24, 40, 'watches', 'Watches', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'),
      (25, 5, 'iron', 'Iron', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300'),
      (26, 5, 'induction', 'Induction', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300'),
      (27, 5, 'headphones', 'Headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'),
      (28, 5, 'speaker', 'Speaker', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300'),
      (29, 5, 'camera', 'Camera', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300');
    `);
    console.log('Categories, categories (user), and subcategories (user) seeded.');

    // 4. Seed Forms and Fields
    await pool.query(`
      INSERT INTO forms (id, category_id, title) VALUES
      (1, 6, 'Mobile Properties'),
      (2, 4, 'Tractor/Equipment Properties');
    `);
    
    await pool.query(`
      INSERT INTO form_fields (id, form_id, label, field_key, field_type) VALUES
      (1, 1, 'Brand', 'brand', 'Dropdown'),
      (2, 1, 'RAM (GB)', 'ram', 'Number'),
      (3, 1, 'Storage (GB)', 'storage', 'Dropdown'),
      (4, 1, 'Battery Capacity', 'battery', 'Text'),
      (5, 1, 'Warranty (Months)', 'warranty', 'Number'),
      (6, 2, 'HP Power', 'hp_power', 'Number'),
      (7, 2, 'Manufacturer Year', 'mfg_year', 'Number'),
      (8, 2, 'Hours Used', 'hours_used', 'Number');
    `);
    console.log('Dynamic forms seeded.');

    // 5. Seed Listings (approved, pending, rejected)
    await pool.query(`
      INSERT INTO listings (id, uuid, seller_id, category_id, title, description, price, quantity, listing_status, views_count, likes_count, is_featured, approved_at, created_at) VALUES
      (1, UUID(), 1, 4, 'Mahindra Arjun 555 Tractor', 'Excellent condition Mahindra Arjun 555 DI Tractor. Sparingly used in fields, regularly serviced, 2023 model.', 520000.00, 1, 'approved', 320, 45, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
      (2, UUID(), 2, 6, 'iPhone 14 Pro Max 256GB', 'Brand new seal-packed Indian unit iPhone 14 Pro Max in Deep Purple color. Bill, box, warranty included.', 115000.00, 2, 'pending', 14, 2, 0, NULL, NOW()),
      (3, UUID(), 1, 2, 'Premium Organic Wheat Seeds 50kg', 'High-yield wheat seeds hybrid variety. Tested for high germination rate and pest resistance.', 1800.00, 100, 'approved', 154, 23, 0, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
      (4, UUID(), 2, 6, 'Refurbished Samsung Galaxy S22 Ultra', 'Good condition phone. Some scratches on the screen. Selling cheap as buying a new phone.', 42000.00, 1, 'rejected', 21, 0, 0, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));
    `);
    console.log('Listings seeded.');

    // 6. Listing Images
    await pool.query(`
      INSERT INTO listing_images (id, listing_id, image_url) VALUES
      (1, 1, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500'),
      (2, 2, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'),
      (3, 3, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500');
    `);

    // 7. Listing Attributes
    await pool.query(`
      INSERT INTO listing_attributes (id, listing_id, form_field_id, value) VALUES
      (1, 1, 6, '55'),
      (2, 1, 7, '2023'),
      (3, 1, 8, '180'),
      (4, 2, 1, 'Apple'),
      (5, 2, 2, '6'),
      (6, 2, 3, '256'),
      (7, 2, 4, '4323 mAh'),
      (8, 2, 5, '12');
    `);
    console.log('Listing details, images, and attributes seeded.');

    // 8. Listing Approval History
    await pool.query(`
      INSERT INTO listing_approval_history (id, listing_id, admin_id, action, remarks, created_at) VALUES
      (1, 1, 1, 'approved', 'Documents verified. Approved listing.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
      (2, 3, 1, 'approved', 'Seeds certification verified. Approved.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
      (3, 4, 1, 'rejected', 'Fails quality guidelines. Real images are required.', DATE_SUB(NOW(), INTERVAL 1 DAY));
    `);

    // 9. Comments & Reviews
    await pool.query(`
      INSERT INTO listing_comments (id, listing_id, user_id, parent_comment_id, comment, created_at) VALUES
      (1, 1, 3, NULL, 'Is the price negotiable? I am interested in buying.', NOW());
    `);
    
    await pool.query(`
      INSERT INTO listing_reviews (id, listing_id, user_id, rating, review, created_at) VALUES
      (1, 1, 3, 5, 'Great seller. Excellent communication. Product exactly as described.', NOW());
    `);

    // 10. Reports
    await pool.query(`
      INSERT INTO listing_reports (id, listing_id, reported_by, reason, status) VALUES
      (1, 4, 2, 'Fake Product', 'pending');
    `);
    console.log('Reviews, comments, and complaints seeded.');

    // 11. Orders, Items, Transactions
    await pool.query(`
      INSERT INTO orders (id, order_number, buyer_id, seller_id, total_amount, order_status, created_at) VALUES
      (1, 'ORD-2026-00001', 3, 1, 520000.00, 'delivered', DATE_SUB(NOW(), INTERVAL 4 DAY)),
      (2, 'ORD-2026-00002', 4, 1, 3600.00, 'pending', NOW());
    `);

    await pool.query(`
      INSERT INTO order_items (id, order_id, listing_id, quantity, price) VALUES
      (1, 1, 1, 1, 520000.00),
      (2, 2, 3, 2, 1800.00);
    `);

    await pool.query(`
      INSERT INTO transactions (id, order_id, transaction_id, payment_status) VALUES
      (1, 1, 'TXN-ABC-12345', 'success'),
      (2, 2, 'TXN-XYZ-98765', 'pending');
    `);
    console.log('Orders, order items, and transactions seeded.');

    // 12. Government Schemes
    await pool.query(`
      INSERT INTO government_schemes (id, category_id, title, description, scheme_type, start_date, end_date) VALUES
      (1, 1, 'PM Kisan Samman Nidhi Yojana', 'Direct financial assistance of Rs. 6000/- per year in three equal installments to small and marginal farmer families.', 'current', '2026-01-01', '2026-12-31'),
      (2, 1, 'Subsidized Solar Pump Scheme', 'Providing up to 90% subsidy for solar water pumps to help farmers transition from diesel to green energy.', 'upcoming', '2026-07-01', '2026-10-31');
    `);

    // 13. Banners & CMS
    await pool.query(`
      INSERT INTO banners (id, title, image_url) VALUES
      (1, 'Mega Agriculture Mela 2026', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=500'),
      (2, 'Get Verified Seller Badge Now', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500');
    `);

    await pool.query(`
      INSERT INTO cms_pages (id, title, slug, content) VALUES
      (1, 'About Us', 'about-us', 'We are a premier B2B and B2C marketplace platform built to connect buyers and sellers seamlessly.'),
      (2, 'Terms & Conditions', 'terms-and-conditions', 'Please read our platform terms of service policy before making purchase orders.');
    `);

    // 14. Notifications & Admin Audit Logs
    await pool.query(`
      INSERT INTO notifications (id, user_id, title, message, is_read) VALUES
      (1, 2, 'Listing Approved', 'Your listing Mahindra Arjun 555 Tractor has been approved by the admin team.', 0);
    `);

    await pool.query(`
      INSERT INTO admin_audit_logs (id, admin_id, action, entity_type, entity_id, created_at) VALUES
      (1, 1, 'Category Created: Electronics', 'Category', 5, DATE_SUB(NOW(), INTERVAL 5 DAY)),
      (2, 1, 'Approved Seller Business: Rajesh Agri-Tools Pvt Ltd', 'SellerProfile', 1, DATE_SUB(NOW(), INTERVAL 3 DAY));
    `);

    // 15. Daily Statistics
    await pool.query(`
      INSERT INTO daily_statistics (id, stat_date, total_users, total_orders, total_revenue) VALUES
      (1, '2026-05-21', 110, 8, 12400.00),
      (2, '2026-05-22', 112, 9, 14500.00),
      (3, '2026-05-23', 115, 12, 22000.00),
      (4, '2026-05-24', 118, 15, 35000.00),
      (5, '2026-05-25', 120, 11, 18000.00),
      (6, '2026-05-26', 125, 14, 52400.00),
      (7, '2026-05-27', 130, 16, 520000.00);
    `);
    console.log('Banners, notifications, audit logs, and analytics stats seeded.');

    // Enable Foreign Key checks
    await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
    
    console.log('Seeding completed successfully using raw SQL!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed with error:', err);
    await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
