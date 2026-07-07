const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/inventory.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          department VARCHAR(100),
          phone VARCHAR(20),
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Device categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS device_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Devices table
      db.run(`
        CREATE TABLE IF NOT EXISTS devices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_name VARCHAR(255) NOT NULL,
          category_id INTEGER,
          serial_number VARCHAR(255) UNIQUE NOT NULL,
          model VARCHAR(255),
          manufacturer VARCHAR(255),
          purchase_date DATE,
          purchase_price DECIMAL(10,2),
          warranty_expiry DATE,
          status VARCHAR(50) DEFAULT 'available',
          location VARCHAR(255),
          specifications TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES device_categories(id)
        )
      `);

      // Device assignments table
      db.run(`
        CREATE TABLE IF NOT EXISTS device_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          assigned_by INTEGER NOT NULL,
          assignment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          return_date DATETIME,
          expected_return_date DATE,
          status VARCHAR(50) DEFAULT 'active',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (device_id) REFERENCES devices(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (assigned_by) REFERENCES users(id)
        )
      `);

      // Repair logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS repair_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id INTEGER NOT NULL,
          reported_by INTEGER NOT NULL,
          issue_description TEXT NOT NULL,
          repair_description TEXT,
          repair_cost DECIMAL(10,2),
          repair_date DATE,
          technician_name VARCHAR(255),
          status VARCHAR(50) DEFAULT 'pending',
          priority VARCHAR(50) DEFAULT 'medium',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (device_id) REFERENCES devices(id),
          FOREIGN KEY (reported_by) REFERENCES users(id)
        )
      `);

      // Upgrade logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS upgrade_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id INTEGER NOT NULL,
          upgrade_type VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          upgrade_date DATE NOT NULL,
          performed_by INTEGER NOT NULL,
          cost DECIMAL(10,2),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (device_id) REFERENCES devices(id),
          FOREIGN KEY (performed_by) REFERENCES users(id)
        )
      `);

      // Parts inventory table
      db.run(`
        CREATE TABLE IF NOT EXISTS parts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          part_name VARCHAR(255) NOT NULL,
          part_number VARCHAR(100) UNIQUE NOT NULL,
          category VARCHAR(100),
          manufacturer VARCHAR(255),
          quantity INTEGER DEFAULT 0,
          min_quantity INTEGER DEFAULT 10,
          unit_price DECIMAL(10,2),
          location VARCHAR(255),
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Part usage logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS part_usage_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          part_id INTEGER NOT NULL,
          device_id INTEGER,
          repair_id INTEGER,
          quantity_used INTEGER NOT NULL,
          used_by INTEGER NOT NULL,
          usage_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          purpose TEXT,
          FOREIGN KEY (part_id) REFERENCES parts(id),
          FOREIGN KEY (device_id) REFERENCES devices(id),
          FOREIGN KEY (repair_id) REFERENCES repair_logs(id),
          FOREIGN KEY (used_by) REFERENCES users(id)
        )
      `);

      // CCTV cameras table
      db.run(`
        CREATE TABLE IF NOT EXISTS cctv_cameras (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          camera_name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          ip_address VARCHAR(50),
          model VARCHAR(255),
          manufacturer VARCHAR(255),
          installation_date DATE,
          status VARCHAR(50) DEFAULT 'active',
          recording_enabled BOOLEAN DEFAULT 1,
          storage_location VARCHAR(255),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // CCTV maintenance logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS cctv_maintenance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          camera_id INTEGER NOT NULL,
          maintenance_type VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          maintenance_date DATE NOT NULL,
          performed_by INTEGER NOT NULL,
          cost DECIMAL(10,2),
          next_maintenance_date DATE,
          status VARCHAR(50) DEFAULT 'completed',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (camera_id) REFERENCES cctv_cameras(id),
          FOREIGN KEY (performed_by) REFERENCES users(id)
        )
      `);

      // Insert default admin user (password: admin123)
      db.run(`
        INSERT OR IGNORE INTO users (username, email, password, full_name, role, department)
        VALUES (
          'admin',
          'admin@inventory.com',
          '$2a$10$rKvFkZhQcBPXvXL5f5Xzu.xGGHvqYqT8YvYxJ3QqPQ0bXqQwYLM8W',
          'System Administrator',
          'admin',
          'IT'
        )
      `);

      // Insert default categories
      const categories = [
        ['Laptop', 'Portable computers'],
        ['Desktop', 'Desktop computers'],
        ['Monitor', 'Display screens'],
        ['Printer', 'Printing devices'],
        ['Scanner', 'Scanning devices'],
        ['Network Equipment', 'Routers, switches, access points'],
        ['Mobile Device', 'Phones and tablets'],
        ['Server', 'Server equipment'],
        ['Storage', 'Hard drives and storage devices'],
        ['Peripheral', 'Keyboards, mice, and other peripherals']
      ];

      const stmt = db.prepare('INSERT OR IGNORE INTO device_categories (name, description) VALUES (?, ?)');
      categories.forEach(cat => stmt.run(cat));
      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting categories:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { db, initDatabase };
