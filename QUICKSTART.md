# Quick Start Guide

## Get Started in 5 Minutes

### 1. Clone and Install
```bash
git clone https://github.com/pandaboi201/IT_Inventory.git
cd IT_Inventory

# Install all dependencies
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env (optional - defaults work fine for development)
# Change JWT_SECRET for production use
```

### 3. Start the Application
```bash
# Terminal 1 - Start backend (will auto-create database)
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. Login
**Default Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the default password immediately after first login!

## Quick Feature Tour

### Dashboard
View real-time statistics about:
- Total devices and their status
- Pending repairs
- Low stock parts
- Active assignments
- CCTV camera status

### Device Management
1. Click "Devices" in sidebar
2. Click "Add Device" to create new device
3. Fill in device details (name, serial number, category, etc.)
4. Device is now tracked in the system

### Assign Device to User
1. Go to "Assignments"
2. Create new assignment
3. Select device and user
4. Device status automatically updates to "Assigned"

### Create Repair Ticket
1. Go to "Repairs"
2. Click "Create Repair"
3. Select device and describe issue
4. Device status automatically changes to "Under Repair"

### Manage Parts
1. Go to "Parts" inventory
2. Add new parts with quantities
3. Set minimum stock levels
4. Get low stock alerts automatically

### CCTV Management
1. Go to "CCTV"
2. Add cameras with location and IP
3. Track maintenance schedules
4. Monitor camera status

## User Roles

### Admin
- Full system access
- User management
- Delete devices
- All operations

### Manager
- Create/update devices
- Assign devices
- Manage repairs
- Manage parts
- Cannot delete devices or manage users

### User
- View devices
- View own assignments
- Create repair tickets
- View inventory

## Common Tasks

### Add a New User (Admin only)
1. Go to "Users"
2. Click "Add User"
3. Fill in user details and select role
4. User can now login

### Track Device Lifecycle
1. **Purchase**: Add device as "Available"
2. **Assignment**: Assign to user → status becomes "Assigned"
3. **Repair**: Create repair ticket → status becomes "Under Repair"
4. **Return**: Return device → status becomes "Available"
5. **Upgrade**: Record upgrades in upgrade logs
6. **Retire**: Change status to "Retired"

### Monitor Low Stock
1. Go to Dashboard → see "Low Stock" count
2. Or go to Parts → filter by "Low Stock"
3. Parts shown in red when quantity ≤ minimum

### Generate Reports
- Dashboard shows overall statistics
- Each module (Devices, Repairs, etc.) has list views
- Filter by status, date, user, etc.
- Export functionality (coming soon)

## Troubleshooting

### Backend won't start
- Ensure port 5000 is not in use
- Check database directory has write permissions
- Verify Node.js version >= 14

### Frontend won't start
- Ensure port 3000 is not in use
- Run `npm install` in frontend directory
- Clear browser cache

### Can't login
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure .env file has JWT_SECRET set

### Database issues
- Delete `database/inventory.db` file
- Restart backend - database will recreate with defaults

## Production Deployment

### Build for Production
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Start production server
NODE_ENV=production npm start
```

Application serves frontend from backend on port 5000.

### Using PM2
```bash
npm install -g pm2
cd frontend && npm run build && cd ..
pm2 start backend/server.js --name it-inventory
pm2 save
```

## Next Steps

- Change default admin password
- Create user accounts for your team
- Add your device categories if needed
- Import your device inventory
- Set up parts inventory
- Configure CCTV cameras

## Support

- Check README.md for detailed documentation
- Review API endpoints in README
- Check GitHub issues for common problems

## Key Files

- `backend/server.js` - Main server file
- `backend/config/database.js` - Database setup
- `backend/routes/*` - API endpoints
- `frontend/src/App.js` - React app entry
- `frontend/src/services/api.js` - API client
- `.env` - Environment configuration

---

Happy Inventory Management! 🚀
