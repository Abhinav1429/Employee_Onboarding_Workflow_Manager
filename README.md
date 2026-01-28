# Employee-Onboarding-Workflow-Manager
## Problem Statement:
Build an application to define and track onboarding tasks for new employees. Key Requirements: - Workflow Templates: admin defines steps and responsible roles. - Task Assignment: assign tasks to new hires and managers. - Progress Tracking: view status of each step in a workflow. - Notifications: send in-app reminders for pending tasks. Tools and Resources: - React.js - Node.js, Express.js - MongoDB, Mongoose Deliverables: - GitHub repo. - Running app showing workflow creation and tracking. - Example onboarding template and user task list.

This system is designed following **microservice architecture principles**, making it scalable and modular.  
Each service (Auth, Workflow, Onboarding) is independently deployable, ensuring flexibility and maintainability.
---

## Key Features

### 1. Workflow Templates
- Admins can define onboarding workflows.
- Steps are assigned to specific roles: **Admin, Manager, Employee**.

### 2. Task Assignment
- Tasks are assigned when a new employee is onboarded.
- Assignment is based on workflow definitions.

### 3. Progress Tracking
- Track task status: **STARTED, PENDING, IN_PROGRESS, COMPLETED**.
- View onboarding progress.

### 4. Notifications
- In-app notifications for **assigned tasks**.
---

##  Why Microservices?
- **Scalability**: Each service can scale independently.
- **Flexibility**: Easy to extend workflows and notification mechanisms.

---

## Example Use Case
- Admin defines a workflow:  
  1. Admin → Create Workflow and Can also check the completion of the task
  2. Manager → Checks the completion of the task    
  3. Employee → Complete orientation tasks  

- When a new hire joins, tasks are automatically assigned to the respective roles.  
- Progress is tracked in real-time, and overdue tasks trigger notifications.

---

## Project Structure

## Architecture Overview
- **Backend**: Node.js, Express.js  
- **Frontend**: React.js  
- **Database**: MongoDB (Mongoose models)  
- **Architecture**: Microservices (Auth, Workflow, Onboarding)

---

## Architecture Diagram : 
------------------------------------------------------------------------------------
  Employee-Onboarding-Workflow-Manager/<br>
  │<br>
  ├─ services/                      # All backend microservices<br>
  │  │<br>
  │  ├─ auth-service/               # Authentication & Users<br>
  │  │  ├─ controllers/<br>
  │  │  │  └─ auth.controller.js<br>
  │  │  ├─ models/<br>
  │  │  │  └─ User.js<br>
  │  │  ├─ routes/<br>
  │  │  │  └─ auth.routes.js<br>
  │  │  ├─ middleware/<br>
  │  │  │  └─ auth.middleware.js<br>
  │  │  ├─ config/<br>
  │  │  │  └─ db.js<br>
  │  │  ├─ server.js<br>
  │  │  ├─ package.json<br>
  │  │  └─ .env<br>
  │  │<br>
  │  ├─ workflow-service/           # Workflow templates<br>
  │  │  ├─ controllers/<br>
  │  │  │  └─ workflow.controller.js<br>
  │  │  ├─ models/<br>
  │  │  │  └─ WorkflowTemplate.js<br>
  │  │  ├─ routes/<br>
  │  │  │  └─ workflow.routes.js<br>
  │  │  ├─ config/<br>
  │  │  │  └─ db.js<br>
  │  │  ├─ server.js<br>
  │  │  ├─ package.json<br>
  │  │  └─ .env<br>
  │  │<br>
  │  ├─ onboarding-service/         # Employee onboarding process<br>
  │  │  ├─ controllers/<br>
  │  │  │  ├─ onboarding.controller.js<br>
  │  │  │  └─ notification.controller.js<br>
  │  │  ├─ models/<br>
  │  │  │  ├─ OnboardingInstance.js<br>
  │  │  │  └─ Notification.js<br>
  │  │  ├─ routes/<br>
  │  │  │  └─ onboarding.routes.js<br>
  │  │  ├─ config/<br>
---
##Installation Setup 
**Backend Setup : **
- Make Sure Node.js and npm are installed : Check the installation with **node -v (for Node.js), npm -v (for Node package manager)**
- Then We need to check for MongoDB <br>
 We can Choose one:<br>
Local MongoDB (MongoDB Compass)<br>
MongoDB Atlas (Cloud)<br>
But for this project we have chosen  MongoDB Atlas and integrated that as db.<br>
We have also used postman to use post and get which are integrated through servers.<br>

- **AUTH SERVICE**
- Step 1: Go to auth-service :
- cd Employee-Onboarding-Workflow-Manager/auth-service
- Step 2: Install dependencies :
- npm install
- Step 3 : Start the server :
- nodeserver.js (We will get Auth Service running on 4000, MongoDB connected to authdb)

- **Onboarding-Service**
- Step 1: Go to Onboarding-service :
- cd Employee-Onboarding-Workflow-Manager/Onboarding-service
- Step 2: Install dependencies :
- npm install
- Step 3 : Start the server :
- nodeserver.js (We will get Onboarding Service running on port 4002, MongoDB connected)

- **Workflow Service**
- Step 1: Go to workflow-service :
- cd Employee-Onboarding-Workflow-Manager/workflow-service
- Step 2: Install dependencies :
- npm install
- Step 3 : Start the server :
- nodeserver.js (We will get workflow Service running on port 4001, WorkflowDB connected)

- **Frontend**
- Step 1: Go to Frontend :
- cd Employee-Onboarding-Workflow-Manager/Frontend
- Step 2: Install dependencies :
- npm install
- Step 3 : Start the server :
- npm start (The frontend using react will run on server 4000 showing the Login Page)

---

## API Highlights

### Auth Service
- `POST /api/auth/login` → Authenticate user and return JWT token

### Workflow Service
- `POST /api/workflows/create` → Create a new workflow template
- `GET /api/workflows/admin` → Retrieve all workflows defined by admin

### Onboarding Service
- `POST /api/onboarding/assign` → Assign workflow to employee
- `GET /api/onboarding/employee/:employeeId` → Get employee onboardings
- `GET /api/onboarding/manager-tasks?managerId=xxx` → Get manager tasks
- `POST /api/onboarding/manager-review` → Manager review task
- `POST /api/onboarding/update` → Employee daily update
- `POST /api/onboarding/review-update` → Manager review update
- `GET /api/onboarding/admin/all` → Get all onboardings (admin)
- `GET /api/onboarding/notifications/:userId` → Get notifications
- `PUT /api/onboarding/notifications/:notificationId/read` → Mark notification as read
---

## Features Implemented

### 1. User Roles
- **ADMIN** → Full system access  
- **MANAGER** → Employee oversight and task review  
- **EMPLOYEE** → Workflow execution and updates  

### 2. Admin Functionality
- Create/manage workflow templates with multiple steps  
- Assign workflows to employees with manager linking  
- Define time limits (days) for workflows  
- View all workflows and employees assigned  
- Track workflow progress  
- Review daily updates and manager decisions  
- Tabbed interface for navigation  
- Notification system  

### 3. Employee Functionality
- View assigned workflow and steps  
- See remaining time to complete workflow  
- Submit daily progress updates  
- Track submission status: Pending / Approved / Rejected  
- Visual progress tracking  
- Notification system  

### 4. Manager Functionality
- View workflows assigned to employees under them  
- See workflow details and remaining time  
- Review employee updates   
- Approve/reject tasks with visibility to both Admin & Employee  

### 5. Workflow & Time Management
- Workflow start date begins when assigned by Admin    
- Workflow status: Active / Completed / Rejected  
- Progress tracking (percentage based on approved tasks)  
- Deadline warnings (color-coded: green / yellow / red)  

---

## Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String,
  role: "ADMIN" | "MANAGER" | "EMPLOYEE",
  managerId: ObjectId
} 
```
### WorkflowTemplate Model
```javascript
{
  name: String,                       // Workflow name
  description: String,                // Description of the workflow
  steps: [{
    stepOrder: Number,                // Order of the step
    title: String,                    // Step title
    assignedRole: "admin" | "manager" | "employee", // Role responsible
    stepDurationDays: Number          // Duration for this step
  }],
  allottedTimeDays: Number,           // Total time for workflow
  createdBy: ObjectId,                // Admin who created the workflow
  createdAt: Date                     // Timestamp
}
```
## OnboardingInstance Model

```javascript
{
  employeeId: ObjectId,               // Employee assigned to the workflow
  workflowTemplateId: ObjectId,       // Linked workflow template
  tasks: [{
    stepOrder: Number,                // Order of the step
    title: String,                    // Task title
    assignedToRole: String,           // Role assigned (HR, Manager, IT, Employee)
    status: "pending" | "approved" | "rejected", // Task status
    managerComment: String,           // Remarks from manager
    reviewedAt: Date                  // Review timestamp
  }],
  progress: Number,                   // Progress percentage (0-100)
  status: "active" | "completed" | "rejected", // Workflow status
  startedAt: Date,                    // Workflow start date
  completedAt: Date,                  // Workflow completion date
  assigned
```
## Notification Model

```javascript
{
  userId: ObjectId,        // The user receiving the notification
  message: String,         // Notification message content
  isRead: Boolean,         // Read/unread status
  createdAt: Date          // Timestamp when notification was created
}
```
## Future scopes : 
- More user roles like HR, Team Lead, and IT Support can be added to manage responsibilities more effectively.

- A drag-and-drop workflow builder can be introduced to make workflow creation easy and user-friendly.

- Microservices can be built using spring boot and deployed on application server.
---
