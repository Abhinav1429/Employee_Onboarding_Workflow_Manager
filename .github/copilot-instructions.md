# Copilot Instructions - Employee Onboarding Workflow System

## Architecture Overview

This is a **microservices-based role-gated onboarding system** with three independent Node.js services coordinating through a React frontend:

- **Auth Service** (Port 4000): User registration, login, JWT tokens, user management
- **Workflow Service** (Port 4001): Template CRUD operations for multi-step workflows
- **Onboarding Service** (Port 4002): Instances, task tracking, manager reviews, notifications
- **Frontend** (Port 3000): React SPA with role-based dashboards (ADMIN/MANAGER/EMPLOYEE)

Each service has its own MongoDB database (`authdb`, `workflowdb`, `onboarding_db`). Frontend communicates via axios instances to each service's `/api/` endpoints independently.

## Critical Patterns & Conventions

### 1. Role-Based Architecture
Three user roles with strict responsibilities:
- **ADMIN**: Creates workflows, assigns to employees, views all onboardings
- **MANAGER**: Reviews employee task submissions, approves/rejects with comments
- **EMPLOYEE**: Completes workflow steps, submits daily updates, tracks progress

User schema: Role stored as uppercase enum (`"ADMIN"`, `"MANAGER"`, `"EMPLOYEE"`), employees have optional `managerId` reference to their manager.

### 2. Workflow & Task Tracking Model
Workflows have **two-level tracking**:
- **Workflow Templates** (Workflow Service): Reusable blueprints with ordered steps, `allottedTimeDays`, and per-step role assignments
- **Onboarding Instances** (Onboarding Service): Individual assignments with `tasks[]`, `updates[]`, `deadline` calculations, and `projectStatus` (employee-facing status)

Tasks/updates have status enum: `["pending", "approved", "rejected"]` with optional `managerComment` and `reviewedBy` references.

### 3. Data References Across Services
Onboarding Instance references both `workflowTemplateId` (from Workflow Service) and `employeeId`/`managerId` (from Auth Service). The frontend must load templates and user details from separate services—**no automatic population**, so queries often need sequential API calls.

### 4. Time & Deadline Calculation
- Deadline = `startedAt` + `allottedTimeDays` (from template)
- `progress` field is percentage-based on approved tasks
- Frontend displays remaining days (yellow/red warning when < 3 days)

### 5. File Uploads & Static Serving
Onboarding Service serves uploaded documents via `app.use("/uploads", express.static("uploads"))`. Employee documents stored in `onboarding_instance.documents[]` with file paths.

## Common Developer Workflows

### Starting All Services
```bash
# Terminal 1: Auth Service
cd auth-service && npm install && npm start  # Port 4000

# Terminal 2: Workflow Service
cd workflow-service && npm install && npm start  # Port 4001

# Terminal 3: Onboarding Service
cd Onboarding-Service && npm install && npm start  # Port 4002

# Terminal 4: Frontend
cd frontend && npm install && npm start  # Port 3000 (opens browser)
```

### Testing Services
- Auth Service test: `curl http://localhost:4000/__test__`
- Onboarding Service root: `GET http://localhost:4002/` returns "Onboarding Service is running"
- Frontend: `npm test` runs React testing suite

### Key Development Notes
- Services are **loosely coupled**—changes to one don't require redeployment of others
- CORS is enabled on all backend services
- MongoDB connection strings are hardcoded to `mongodb://127.0.0.1:27017/` (dev only)
- Code comments use `@abhinav` tags marking critical logic or edge cases

## Service-Specific Routes Reference

**Auth Service** (`/api/auth`):
- `POST /register`, `POST /login`, `GET /users`, `GET /users/role/:role`, `PUT /users/:userId`

**Workflow Service** (`/api/workflows`):
- `POST /` (create template), `GET /` (list templates)

**Onboarding Service** (`/api/onboarding`):
- `POST /assign` (assign workflow to employee), `GET /employee/:employeeId`, `GET /manager-tasks?managerId=xxx`
- `POST /manager-review`, `POST /update`, `POST /review-update`
- `GET /admin/all`, `GET /notifications/:userId`, `PUT /notifications/:notificationId/read`

## Frontend Structure & Component Patterns

React components follow this pattern:
- **Pages** (role-based): `Login.jsx`, `AdminDashboard.jsx`, `ManagerDashboard.jsx`, `EmployeeDashboard.jsx`
- **Components** (shared): `TaskList.jsx`, `UserManagement.jsx`, `WorkflowForm.jsx`, `NotificationList.jsx`
- **API Layer**: `services/api.js` exports three axios instances (`authAPI`, `workflowAPI`, `onboardingAPI`)

Routing: App.jsx uses React Router with role-based paths (`/admin`, `/manager`, `/employee`). **No persistent token storage visible**—authentication flow unclear on refresh, may need investigation.

## Important Caveats

1. **No authentication middleware** implemented in service routes—all endpoints are publicly accessible (for MVP)
2. **Notification system exists** but implementation incomplete—`NotificationList.jsx` exists but unclear how notifications are created/persisted
3. **Email/password handling**: No bcrypt import visible in User schema despite password field; may be unencrypted (security issue for production)
4. **Cross-service queries**: Frontend must load related data from multiple services sequentially; no backend aggregation layer
5. **Test files exist** but coverage unknown—`testadmin`, `test` directories present but not documented

## When Adding Features

- **New user role**: Update enum in User schema and auth routes role checks
- **Workflow steps**: Add to `WorkflowTemplate.steps[]` array; update step order numbers
- **Employee tracking**: New data goes into `OnboardingInstance.updates[]` or `.documents[]` 
- **Manager reviews**: Modify status enums and add to `TaskSchema`/update objects
- **Cross-service call**: Use appropriate axios instance from `frontend/src/services/api.js`
