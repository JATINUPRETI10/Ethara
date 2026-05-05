# Team Task Manager

Team Task Manager is a full-stack, production-ready web application built for seamless project and task tracking. It includes a robust role-based access control system (Admin/Member) and a beautiful, modern UI.

## Features

- **Authentication & Authorization**: Secure JWT-based login and registration with Bcrypt password hashing.
- **Role-Based Access Control**:
  - **Admin**: Can create/edit/delete projects, manage team members, and oversee all tasks.
  - **Member**: Can view assigned projects/tasks and update task statuses.
- **Project Management**: Create projects, view team members, and track overall progress.
- **Task Management**: Create tasks, set priorities (Low, Medium, High), assign them to team members, and track their status (To Do, In Progress, Completed).
- **Dashboard Analytics**: Real-time overview of total tasks, completed tasks, overdue tasks, and a timeline of recent activity.
- **Responsive UI**: Polished, modern interface built with TailwindCSS, utilizing glassmorphism and fully responsive layouts.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand, React Router, Axios.
- **Backend**: Node.js, Express, TypeScript, Zod for validation.
- **Database**: PostgreSQL with Prisma ORM.
- **Deployment**: Configured for Railway deployment.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally
- npm or yarn

### 1. Database Setup
1. Create a local PostgreSQL database named `team_task_manager`.
2. Open `backend/.env` (copy from `backend/.env.example`) and configure your `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/team_task_manager?schema=public"
   JWT_SECRET="your_super_secret_jwt_key_here"
   FRONTEND_URL="http://localhost:5173"
   ```
3. Navigate to the `backend` directory and run Prisma migrations:
   ```bash
   cd backend
   npm install
   npx prisma db push
   ```

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend will start on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file in the `frontend` directory:
   ```
   VITE_API_URL="http://localhost:5000/api"
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

## Test Credentials

After starting the app, you can register a new user from the UI. When registering, you can select the role (Admin or Member). 
- Create an **Admin** account first to create projects and assign tasks.
- Create a **Member** account to test the restricted access flows.

## Deployment Steps (Railway)

1. **Push to GitHub**: Commit both the `frontend` and `backend` folders to a single GitHub repository (Monorepo).
2. **Connect Railway**:
   - Go to [Railway.app](https://railway.app/) and create a new project from your GitHub repository.
3. **Database Provisioning**:
   - Add a PostgreSQL database to your Railway project.
4. **Backend Service**:
   - Create a new service from your repo. Set the Root Directory to `backend/`.
   - Add Environment Variables: `DATABASE_URL` (from the Railway Postgres), `JWT_SECRET`, and `PORT` (e.g., 5000).
   - Set the Start Command to `npm start` (ensure `npm run build` runs first as per package.json).
5. **Frontend Service**:
   - Create another service from the same repo. Set the Root Directory to `frontend/`.
   - Add Environment Variable: `VITE_API_URL` pointing to your deployed backend URL.
   - Railway will automatically detect Vite and build the static site.

## Demo Video Script Outline (2-5 Minutes)

**1. Introduction (0:00 - 0:30)**
- "Hi, this is my Team Task Manager full-stack application built with React, Node.js, and PostgreSQL."
- Show the login screen. Mention the tech stack and the JWT/Bcrypt security.
- Log in as an **Admin**.

**2. Dashboard & Analytics (0:30 - 1:00)**
- Walk through the Dashboard. Show the stats cards (Total Projects, Tasks, Overdue, etc.).
- Highlight the "Overall Progress" circular or bar indicator and the "Recent Tasks" feed.

**3. Project Management (Admin Flow) (1:00 - 1:45)**
- Navigate to the "Projects" page. Create a new project.
- Explain how projects are tied to team members. (Optionally show how an admin can add members if the UI permits, or mention the backend capability).

**4. Task Management (1:45 - 2:45)**
- Navigate to the "Tasks" page. 
- Create a new task under the newly created project. Assign priority, due date, and assign it to a team member.
- Show the task appearing in the list with its priority badge.

**5. Member Flow & Role-Based Access (2:45 - 3:30)**
- Log out and log back in as a **Member**.
- Show that the Member's dashboard only reflects their assigned tasks.
- Navigate to the Tasks page. Show that the member cannot create tasks or delete them, but they *can* change the status (e.g., from TO DO to COMPLETED).

**6. Conclusion (3:30 - 4:00)**
- Summarize the completion. Mention that it is fully responsive (shrink the browser window to show mobile sidebar/layout).
- Mention it is deployed live on Railway. Thank you for watching!
