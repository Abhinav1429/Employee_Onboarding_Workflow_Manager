# Workflow Service

Workflow template management service for the Employee Onboarding System.

## Architecture

```
workflow-service/
├── config/
│   └── db.js                      # MongoDB connection configuration
├── controllers/
│   └── workflow.controller.js     # Business logic for workflow operations
├── models/
│   └── WorkflowTemplate.js        # Workflow schema
├── routes/
│   └── workflow.routes.js         # API endpoint definitions
├── server.js                      # Express app and server startup
├── package.json
└── .env                           # Environment variables
```

## Environment Variables

```
PORT=4001
DB_URL=mongodb+srv://[user]:[password]@[cluster]/workflowDB?retryWrites=true&w=majority
```

## API Endpoints

### Workflow Management
- `POST /api/workflows` - Create a new workflow template
- `GET /api/workflows` - List all workflow templates
- `GET /api/workflows/:id` - Get a specific workflow template

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

MongoDB Atlas collection: `workflowtemplates`

WorkflowTemplate schema includes:
- name
- description
- steps[] (array of step objects)
  - stepOrder
  - title
  - assignedRole (admin, manager, employee)
  - stepDurationDays
- allottedTimeDays (total time in days)
- createdBy (admin ID)
- createdAt
