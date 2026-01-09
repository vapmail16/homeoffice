# Home Office - Task Management & Performance Tracking

A task management and performance tracking application designed to help couples manage home office tasks with comprehensive performance metrics.

## 🌟 Features

### Core Functionality
- **JWT-based Authentication** - Simple login/register system with role support (Husband/Wife)
- **Task Management** - Create, assign, complete, and track tasks
- **Task Assignment** - Both users can assign tasks to each other
- **Backlog Support** - Tasks that don't need immediate attention
- **Performance Dashboard** - Comprehensive metrics and analytics

### Task Features
- ✅ Task completion tracking (mark complete without deleting)
- 📅 Flexible date setting (days to complete OR specific date picker)
- 📋 Backlog tasks (no deadline required)
- 💬 Comment functionality
- ⏰ Delay counter for overdue tasks
- 🎯 Task filtering (All, Pending, Completed, Backlog)

### Performance Metrics
- Completion rate tracking
- On-time completion rate
- Average delay calculation
- Weekly task statistics
- Visual progress indicators
- **Backlog tasks excluded** from performance metrics

### Role-Based System
- **Husband/Wife roles** - Assign appropriate role during registration
- **Bidirectional task assignment** - Either user can assign tasks to the other
- **Task visibility** - Users see tasks assigned to them (regardless of creator)
- **User management** - Easy user selection for task assignment

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vapmail16/homeoffice.git
   cd homeoffice
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your database URL and JWT_SECRET
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 📖 Usage

### First Time Setup

1. **Register Accounts**
   - Register as "Husband" or "Wife"
   - Create separate accounts for each user

2. **Create Tasks**
   - Click "+ Add Task"
   - Fill in task details
   - Choose who to assign the task to
   - Set deadline (days or specific date) OR mark as backlog

3. **Manage Tasks**
   - Check checkbox to mark task complete
   - Add comments to provide updates
   - View delay counter for overdue tasks
   - Filter tasks by status

4. **Track Performance**
   - Navigate to "Performance" tab
   - View completion rates and metrics
   - Monitor weekly progress

## 🏗️ Project Structure

```
homeoffice/
├── backend/
│   ├── prisma/           # Database schema and migrations
│   ├── routes/           # API routes (auth, tasks, metrics, users)
│   ├── middleware/       # Authentication and error handling
│   ├── Dockerfile        # Production Docker image
│   └── server.js         # Express server
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # Auth context
│   │   └── config/       # API configuration
│   ├── Dockerfile        # Production Docker image
│   └── nginx.conf        # Nginx configuration
└── docs/                 # Deployment documentation
```

## 🔧 Configuration

### Backend Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/homeoffice_tasks?schema=public"
JWT_SECRET="your-secret-key-minimum-32-characters"
PORT=3001
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000"
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:3001
```

## 📊 Database Schema

### Users
- `id` - UUID
- `username` - Unique username
- `password` - Hashed password
- `role` - "husband" or "wife"
- `createdAt`, `updatedAt` - Timestamps

### Tasks
- `id` - UUID
- `title` - Task title
- `description` - Optional description
- `createdDate` - When task was created
- `expectedDate` - Expected completion date (nullable for backlog)
- `completedDate` - When task was completed (nullable)
- `isCompleted` - Boolean completion status
- `isBacklog` - Boolean backlog flag
- `comments` - Optional comments
- `userId` - Who created the task
- `assignedToId` - Who the task is assigned to

## 🚀 Deployment

### DCDeploy Deployment

See [Deployment Guide](docs/DEPLOYMENT.md) for complete instructions.

**Quick Steps:**
1. Migrate database: `cd backend && ./migrate-production.sh`
2. Deploy backend to DCDeploy
3. Deploy frontend to DCDeploy
4. Update CORS settings

For detailed deployment instructions, see:
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Deployment Summary](DEPLOYMENT_SUMMARY.md)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks` - Get all tasks assigned to user
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task (comments, completion status)
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get all users (for task assignment)

### Metrics
- `GET /api/metrics` - Get performance metrics (excludes backlog tasks)

## 🔒 Security

- Passwords hashed with bcrypt
- JWT authentication
- Role-based access control
- Parameterized database queries
- CORS protection
- Input validation

## 🛠️ Tech Stack

### Backend
- Node.js & Express
- PostgreSQL with Prisma ORM
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React
- React Router
- Axios for API calls
- CSS3 for styling

### Deployment
- Docker
- Nginx (frontend)
- DCDeploy platform

## 📄 License

This project is private and proprietary.

## 👥 Authors

- Built for home office task management

## 🙏 Acknowledgments

- Built following deployment best practices from mahimapareek project

---

**Repository**: https://github.com/vapmail16/homeoffice
