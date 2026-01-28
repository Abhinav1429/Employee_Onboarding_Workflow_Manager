# Auth Service

Authentication and user management service for the Employee Onboarding System.

## Architecture

```
auth-service/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/
│   └── auth.controller.js    # Business logic for auth operations
├── middleware/
│   └── auth.middleware.js    # JWT verification and authorization
├── models/
│   └── User.js              # User schema and methods
├── routes/
│   └── auth.routes.js       # API endpoint definitions
├── server.js                # Express app and server startup
├── package.json
└── .env                     # Environment variables
```

## Environment Variables

```
PORT=4000
DB_URL=mongodb+srv://[user]:[password]@[cluster]/authDB?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

## API Endpoints

### User Management
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/users` - Get all users (admin/manager only)
- `GET /api/auth/users/role/:role` - Get users by role
- `PUT /api/auth/users/:userId` - Update user information

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

MongoDB Atlas collection: `users`

User schema includes:
- name
- email (unique)
- password (hashed with bcryptjs)
- role (ADMIN, MANAGER, EMPLOYEE)
- managerId (for employees)
