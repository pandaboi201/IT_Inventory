# IT Inventory Management System

A comprehensive full-stack web application for managing IT devices, tracking assignments, maintenance, repairs, parts inventory, and CCTV systems.

## Features

### 🖥️ Device Management
- Complete device inventory with categories (Laptops, Desktops, Printers, etc.)
- Track device details: serial numbers, models, manufacturers, specifications
- Monitor device status: Available, Assigned, Under Repair, Retired
- Purchase information and warranty tracking
- Device lifecycle management

### 👥 User & Assignment Management
- Role-based access control (Admin, Manager, User)
- Device assignment tracking
- Assignment history and return management
- Expected return dates and notifications
- User department and contact information

### 🔧 Repair & Maintenance Logs
- Create and track repair tickets
- Priority levels (Low, Medium, High, Critical)
- Repair status tracking (Pending, In Progress, Completed)
- Repair costs and technician information
- Complete repair history for each device

### ⬆️ Upgrade Tracking
- Document device upgrades (RAM, Storage, Software, etc.)
- Upgrade costs and dates
- Performed by tracking
- Upgrade history per device

### 📦 Parts Inventory
- Comprehensive parts catalog
- Stock level monitoring
- Low stock alerts (when quantity <= minimum quantity)
- Part usage tracking
- Link parts to repairs and devices

### 📹 CCTV Management
- CCTV camera inventory
- Location and IP address tracking
- Recording status monitoring
- Installation and maintenance scheduling
- Maintenance log history

### 📊 Dashboard & Reporting
- Real-time statistics
- Device availability overview
- Pending repairs summary
- Low stock alerts
- Recent activity feed
- Visual charts and graphs

## Technology Stack

### Backend
- **Node.js** with **Express.js** - REST API server
- **SQLite3** - Lightweight database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd IT_Inventory
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update the following:
# JWT_SECRET=your_secure_random_key_here
# PORT=5000
```

### Step 4: Initialize Database
The database will be automatically created and initialized when you start the server for the first time.

### Step 5: Start the Application

#### Development Mode
```bash
# Terminal 1 - Start backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

#### Production Mode
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Start production server
npm start
```

## Default Credentials

**Username:** admin  
**Password:** admin123

**⚠️ Important:** Change the default admin password immediately after first login!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices` - Create device (Admin/Manager)
- `PUT /api/devices/:id` - Update device (Admin/Manager)
- `DELETE /api/devices/:id` - Delete device (Admin only)
- `GET /api/devices/categories/all` - Get device categories

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment (Admin/Manager)
- `PUT /api/assignments/:id/return` - Return device (Admin/Manager)

### Repairs
- `GET /api/repairs` - Get repair logs
- `POST /api/repairs` - Create repair log
- `PUT /api/repairs/:id` - Update repair log (Admin/Manager)

### Upgrades
- `GET /api/upgrades` - Get upgrade logs
- `POST /api/upgrades` - Create upgrade log (Admin/Manager)

### Parts
- `GET /api/parts` - Get parts inventory
- `POST /api/parts` - Create part (Admin/Manager)
- `PUT /api/parts/:id` - Update part (Admin/Manager)
- `POST /api/parts/:id/use` - Record part usage (Admin/Manager)
- `GET /api/parts/:id/usage` - Get part usage history

### CCTV
- `GET /api/cctv` - Get CCTV cameras
- `POST /api/cctv` - Create camera (Admin/Manager)
- `PUT /api/cctv/:id` - Update camera (Admin/Manager)
- `GET /api/cctv/:id/maintenance` - Get maintenance logs
- `POST /api/cctv/:id/maintenance` - Create maintenance log (Admin/Manager)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

## User Roles

### Admin
- Full system access
- Manage users
- Delete devices
- All CRUD operations

### Manager
- Create and manage devices
- Assign devices to users
- Manage repairs and upgrades
- Manage parts inventory
- Manage CCTV cameras

### User
- View devices
- View own assignments
- Create repair tickets
- View parts inventory

## Database Schema

### Main Tables
- **users** - User accounts and authentication
- **device_categories** - Device categories
- **devices** - IT device inventory
- **device_assignments** - Device assignment tracking
- **repair_logs** - Repair and maintenance logs
- **upgrade_logs** - Device upgrade history
- **parts** - Parts inventory
- **part_usage_logs** - Parts usage tracking
- **cctv_cameras** - CCTV camera inventory
- **cctv_maintenance** - CCTV maintenance logs

## Project Structure

```
IT_Inventory/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Error handling
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management
│   │   ├── devices.js           # Device management
│   │   ├── assignments.js       # Assignment management
│   │   ├── repairs.js           # Repair logs
│   │   ├── upgrades.js          # Upgrade logs
│   │   ├── parts.js             # Parts inventory
│   │   ├── cctv.js              # CCTV management
│   │   └── dashboard.js         # Dashboard stats
│   └── server.js                # Express server
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/            # Login component
│   │   │   ├── Dashboard/       # Dashboard
│   │   │   ├── Devices/         # Device components
│   │   │   ├── Assignments/     # Assignment components
│   │   │   ├── Repairs/         # Repair components
│   │   │   ├── Parts/           # Parts components
│   │   │   ├── CCTV/            # CCTV components
│   │   │   └── Layout/          # Layout components
│   │   ├── services/
│   │   │   └── api.js           # API service
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── database/
│   └── inventory.db             # SQLite database (auto-created)
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Features in Detail

### Device Status Workflow
1. **Available** - Device is ready to be assigned
2. **Assigned** - Device is currently assigned to a user
3. **Under Repair** - Device is being repaired
4. **Retired** - Device is no longer in service

### Repair Workflow
1. User or admin creates repair ticket
2. Device status automatically changes to "Under Repair"
3. Admin/Manager updates repair status and adds repair details
4. When completed, device status returns to "Available"

### Parts Management
- Track inventory levels
- Automatic low stock alerts
- Link parts to specific repairs
- Complete usage history

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- Role-based authorization
- Protected API endpoints
- Session management

## Development

### Adding New Features
1. Create database table in `backend/config/database.js`
2. Create route handler in `backend/routes/`
3. Add route to `backend/server.js`
4. Create API service in `frontend/src/services/api.js`
5. Create React components in `frontend/src/components/`

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Using PM2 (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Build frontend
cd frontend
npm run build
cd ..

# Start with PM2
pm2 start backend/server.js --name "it-inventory"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Using Docker
```bash
# Build Docker image
docker build -t it-inventory .

# Run container
docker run -p 5000:5000 -v $(pwd)/database:/app/database it-inventory
```

## Troubleshooting

### Database Issues
```bash
# Remove and recreate database
rm database/inventory.db
# Restart server - database will be recreated
npm start
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Frontend Cannot Connect to Backend
- Ensure backend is running on port 5000
- Check proxy setting in `frontend/package.json`
- Verify CORS configuration

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License

## Support
For issues and questions, please open an issue on GitHub.

## Roadmap
- [ ] Email notifications for low stock
- [ ] Advanced reporting and analytics
- [ ] Export data to Excel/PDF
- [ ] Mobile app
- [ ] Barcode/QR code scanning
- [ ] Integration with asset management systems
- [ ] Automated warranty expiry reminders
- [ ] File attachments for devices and repairs
- [ ] Audit trail and activity logs
- [ ] Multi-tenant support

---

Built with ❤️ for IT Infrastructure Management
