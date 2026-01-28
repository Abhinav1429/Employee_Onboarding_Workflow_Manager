# Frontend Integration Guide

## Overview
The frontend has been refactored to properly integrate with all backend services with smooth data flow and notifications.

## API Configuration

All API calls are configured in [frontend/src/services/api.js](frontend/src/services/api.js) with:
- Centralized endpoint management
- Error handling interceptors
- Helper functions for authentication checks

### Base URLs
- **Auth Service**: http://localhost:4000/api/auth
- **Workflow Service**: http://localhost:4001/api/workflows
- **Onboarding Service**: http://localhost:4002/api/onboarding

## Key Improvements Made

### 1. **API Integration** (`api.js`)
✅ Proper axios instance configuration for each service
✅ Error interceptors with logging
✅ Helper functions: `apiHelpers.isAdmin()`, `apiHelpers.isManager()`, etc.
✅ Consistent error handling across all services

### 2. **Admin Dashboard**
✅ Proper data fetching with async/await
✅ Loading states for better UX
✅ Parallel data loading (Promise.all)
✅ Auto-refresh every 30 seconds
✅ Proper error handling for all API calls
✅ Tables display:
   - Created workflows
   - All onboarding instances
   - Employees and managers
   - Notifications with read status

### 3. **Manager Dashboard**
✅ Loading state management
✅ Task list with proper formatting
✅ Employee management under manager
✅ Notifications count display
✅ Proper tab navigation
✅ Error handling with fallbacks

### 4. **Employee Dashboard**
✅ Workflow tracking with visual status
✅ Task list display
✅ Daily update submissions
✅ Document upload support
✅ Notifications with real-time updates
✅ Project status tracking

### 5. **Notifications System**
✅ Real-time notification display
✅ Mark as read functionality
✅ Visual indicators for unread notifications
✅ Timestamp display
✅ Auto-refresh capability
✅ Proper error handling

### 6. **Components**
✅ **WorkflowForm**: Proper error handling, loading states, disabled buttons during submission
✅ **UserManagement**: Loading states, proper error messages
✅ **NotificationList**: Enhanced UI with read/unread indicators
✅ **TaskList**: Proper status coloring and formatting

## Data Flow

### User Login
```
Frontend (Login.jsx)
    ↓ POST /api/auth/login
Backend (Auth Service)
    ↓ Returns token, role, userId
Frontend
    ↓ Stores in localStorage
Dashboard Redirect
    ↓ Based on role (admin/manager/employee)
```

### Admin Creates Workflow
```
Admin Dashboard
    ↓ WorkflowForm.jsx
    ↓ POST /api/workflows
Workflow Service
    ↓ Creates template in MongoDB
    ↓ Returns workflow data
Dashboard
    ↓ Updates workflows list
```

### Admin Assigns Workflow
```
Admin Dashboard
    ↓ Select employee & manager
    ↓ POST /api/onboarding/assign
Onboarding Service
    ↓ Creates OnboardingInstance
    ↓ Creates notifications
    ↓ Returns assignment
Dashboard
    ↓ Refreshes onboardings & notifications
```

### Employee Views Dashboard
```
Employee Dashboard
    ↓ GET /api/onboarding/employee/:employeeId
Onboarding Service
    ↓ Fetches assigned workflows
    ↓ Calculates days remaining
Dashboard
    ↓ Displays workflows with progress
```

### Notifications
```
Service creates notification
    ↓ POST to Notification collection
Dashboard
    ↓ GET /api/onboarding/notifications/:userId
    ↓ Displays unread count
User clicks notification
    ↓ PUT /api/onboarding/notifications/:id/read
    ↓ Marks as read
Dashboard
    ↓ Updates UI
```

## Running the System

### 1. Start all backend services (in separate terminals)
```bash
# Terminal 1 - Auth Service
cd auth-service
node server.js

# Terminal 2 - Workflow Service
cd workflow-service
node server.js

# Terminal 3 - Onboarding Service
cd Onboarding-Service
node server.js
```

### 2. Start frontend (in another terminal)
```bash
cd frontend
npm start
```

### 3. Access the application
- Open http://localhost:3000
- Login with test credentials:
  - **Admin**: admin@example.com / admin123
  - **Manager**: manager@example.com / manager123
  - **Employee**: employee@example.com / employee123

## Testing Checklist

### ✅ Authentication
- [ ] Login with admin account
- [ ] Redirect to admin dashboard
- [ ] Logout clears localStorage
- [ ] Unauthorized access redirects to login

### ✅ Admin Dashboard
- [ ] Workflows tab shows all workflows
- [ ] Create workflow form works
- [ ] Assign workflow to employee works
- [ ] Onboarding instances tab displays data
- [ ] Employees list loads correctly
- [ ] Managers list loads correctly
- [ ] Notifications appear

### ✅ Manager Dashboard
- [ ] My Employees tab shows assigned employees
- [ ] Tasks to review displays manager tasks
- [ ] Notifications count updates
- [ ] Tab navigation works smoothly

### ✅ Employee Dashboard
- [ ] My Workflows displays assigned workflows
- [ ] Progress indicators work
- [ ] Days remaining calculated correctly
- [ ] Notifications display updates

### ✅ Notifications
- [ ] Unread count displays correctly
- [ ] Click to mark as read works
- [ ] Marked notifications update UI
- [ ] New notifications appear in real-time

## Troubleshooting

### "Cannot GET /api/..." errors
- Ensure all three backend services are running
- Check that services are on correct ports (4000, 4001, 4002)
- Check service logs for connection errors

### Data not loading in tables
- Open browser DevTools > Network tab
- Check if API requests are failing
- Look for error responses from backend
- Check MongoDB Atlas connection status

### Notifications not working
- Verify onboarding service is running
- Check notifications endpoint: GET /api/onboarding/notifications/:userId
- Ensure userId is correctly stored in localStorage

### Login fails
- Verify auth service is running on port 4000
- Check if test users are seeded: `node seedUsers.js`
- Verify JWT_SECRET is set in .env

## Performance Optimizations

- Parallel data loading reduces dashboard load time
- Auto-refresh every 30 seconds keeps data current
- Error interceptors prevent silent failures
- Loading states provide user feedback
- Caching of user data in localStorage

## Security Notes

- JWT tokens stored in localStorage (consider HttpOnly cookies for production)
- User role validation on each dashboard
- Protected routes with navigation guards
- Password hashing with bcryptjs
- Environment variables for sensitive data
