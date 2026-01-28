# Onboarding Service

Onboarding instance and task management service for the Employee Onboarding System.

## Architecture

```
Onboarding-Service/
├── config/
│   └── db.js                         # MongoDB connection configuration
├── controllers/
│   └── onboarding.controller.js      # Business logic for onboarding operations
├── models/
│   ├── OnboardingInstance.js        # Onboarding instance schema
│   └── Notification.js              # Notification schema
├── routes/
│   └── onboarding.routes.js         # API endpoint definitions
├── server.js                        # Express app and server startup
├── uploads/                         # Directory for uploaded documents
├── package.json
└── .env                             # Environment variables
```

## Environment Variables

```
PORT=4002
DB_URL=mongodb+srv://[user]:[password]@[cluster]/onboarding_db?retryWrites=true&w=majority
```

## API Endpoints

### Onboarding Management
- `POST /api/onboarding/assign` - Assign workflow to employee
- `GET /api/onboarding/employee/:employeeId` - Get employee's onboardings
- `GET /api/onboarding/manager/employees` - Get employees under a manager
- `GET /api/onboarding/manager-tasks` - Get tasks for manager review
- `GET /api/onboarding/admin/all` - Get all onboardings (admin only)

### Notifications
- `GET /api/onboarding/notifications/:userId` - Get user notifications
- `PUT /api/onboarding/notifications/:id/read` - Mark notification as read

## Running the Service

```bash
# Install dependencies
npm install

# Run the service
npm start

# Development mode with auto-reload
npm run dev
```

## Database

MongoDB Atlas collections:
- `onboardinginstances` - Onboarding workflow assignments
- `notifications` - User notifications

OnboardingInstance schema includes:
- employeeId
- workflowTemplateId
- tasks[] (array of task objects with status)
- progress (0-100)
- status (active, completed, rejected)
- projectStatus (started, pending, ongoing, completed)
- deadline
- updates[] (employee daily updates)
- documents[] (uploaded files)

Notification schema includes:
- userId
- message
- isRead
- createdAt
