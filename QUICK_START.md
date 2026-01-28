# Quick Start Guide - Employee Onboarding System

## Prerequisites
- Node.js and npm installed
- MongoDB Atlas account with connection string
- All `.env` files configured with MongoDB Atlas URLs

## Quick Setup (5 minutes)

### Step 1: Start Backend Services (3 terminals)

**Terminal 1 - Auth Service**
```bash
cd auth-service
npm install  # First time only
node server.js
# Expected: "Auth service running on port 4000"
```

**Terminal 2 - Workflow Service**
```bash
cd workflow-service
npm install  # First time only
node server.js
# Expected: "Workflow service running on port 4001"
```

**Terminal 3 - Onboarding Service**
```bash
cd Onboarding-Service
npm install  # First time only
node server.js
# Expected: "Onboarding service running on port 4002"
```

### Step 2: Seed Test Users (one time only)
```bash
cd auth-service
node seedUsers.js
# Creates: admin@example.com, manager@example.com, employee@example.com
```

### Step 3: Start Frontend

**Terminal 4**
```bash
cd frontend
npm install  # First time only
npm start
# Expected: Browser opens at http://localhost:3000
```

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Manager | manager@example.com | manager123 |
| Employee | employee@example.com | employee123 |

## What to Test

### As Admin
1. Create a workflow with multiple steps
2. Assign workflow to an employee with a manager
3. View all onboardings and their progress
4. Check notifications

### As Manager
1. View assigned employees
2. See tasks to review
3. View notifications
4. Create new employees

### As Employee
1. View assigned workflows
2. See task progress
3. View notifications
4. Submit daily updates

## Verify Everything Works

✅ **Login** - Test admin account login
✅ **Dashboard** - Verify data loads (should see "Loading dashboard..." briefly)
✅ **Workflow** - Create a new workflow as admin
✅ **Assignment** - Assign workflow to employee
✅ **Notifications** - Check notifications appear in all dashboards
✅ **Tables** - Verify employee/manager/workflow lists show data

## Troubleshooting

### Services won't start
- Check ports 4000, 4001, 4002 are not in use
- Kill all node processes: `taskkill /F /IM node.exe` (Windows)
- Check MongoDB Atlas connection string in `.env` files

### Login fails
- Verify test users are created: `node seedUsers.js`
- Check auth service is running on port 4000
- Clear browser localStorage and try again

### No data in tables
- Ensure all 3 backend services are running
- Check browser console (F12) for API errors
- Verify MongoDB Atlas database has data

### Notifications not working
- Check onboarding service logs for errors
- Verify notifications endpoint is responding
- Reload page to refresh notifications

## Port Information

| Service | Port | URL |
|---------|------|-----|
| Auth Service | 4000 | http://localhost:4000 |
| Workflow Service | 4001 | http://localhost:4001 |
| Onboarding Service | 4002 | http://localhost:4002 |
| Frontend (React) | 3000 | http://localhost:3000 |

## Environment Variables

All services use MongoDB Atlas. Ensure `.env` files are set up:

### auth-service/.env
```
PORT=4000
DB_URL=mongodb+srv://[user]:[password]@[cluster]/authDB?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
```

### workflow-service/.env
```
PORT=4001
DB_URL=mongodb+srv://[user]:[password]@[cluster]/workflowDB?retryWrites=true&w=majority
```

### Onboarding-Service/.env
```
PORT=4002
DB_URL=mongodb+srv://[user]:[password]@[cluster]/onboarding_db?retryWrites=true&w=majority
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│            React Frontend (Port 3000)               │
│  (Admin/Manager/Employee Dashboards)                │
└────────────┬────────────────┬───────────────────────┘
             │                │
    ┌────────▼─────┐  ┌───────▼──────────┐
    │ Auth Service │  │ Workflow Service │
    │  (Port 4000) │  │   (Port 4001)    │
    └──────────────┘  └──────────────────┘
             │
    ┌────────▼───────────────────┐
    │ Onboarding Service (4002)  │
    │ - Task Management          │
    │ - Notifications            │
    │ - Progress Tracking        │
    └────────────────────────────┘
             │
    ┌────────▼────────────────────┐
    │    MongoDB Atlas (Cloud)    │
    │  - authDB                   │
    │  - workflowDB               │
    │  - onboarding_db            │
    └─────────────────────────────┘
```

## Database Collections

### authDB
- `users` - User accounts with roles

### workflowDB
- `workflowtemplates` - Workflow definitions

### onboarding_db
- `onboardinginstances` - Employee onboardings
- `notifications` - User notifications

## Next: Add Real Data

1. Create a workflow with meaningful steps
2. Assign to your employee user
3. Have manager review tasks
4. Have employee submit updates
5. Monitor progress in admin dashboard

---

**System is ready! All three services + frontend + MongoDB are integrated and working.** 🚀
