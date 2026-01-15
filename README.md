# 🚀 Work Management System

A modern full-stack project management system built with NestJS, featuring real-time notifications via WebSocket and file upload capabilities.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Getting Started](#getting-started)

---

## 🏗️ Architecture Overview

This project uses a **hybrid architecture** to leverage the best of serverless and always-on infrastructure:

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                  (React + TypeScript)                            │
│              https://jira-frontend-roan.vercel.app              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   REST APIs  │    │   File Upload    │    │   WebSocket  │
│   (Vercel)   │    │  (Cloudinary)    │    │   (Render)   │
└──────────────┘    └──────────────────┘    └──────────────┘
        │                                            │
        └─────────────────┬──────────────────────────┘
                          ▼
                  ┌──────────────┐
                  │  PostgreSQL  │
                  │    (Neon)    │
                  └──────────────┘
```

### Why Hybrid Architecture?

1. **REST APIs on Vercel (Serverless)**:
   - Auto-scaling based on traffic
   - Zero cost when idle
   - Global edge network (fast response)
   - Perfect for CRUD operations

2. **WebSocket on Render (Always-On)**:
   - Persistent connections required for real-time notifications
   - Serverless platforms don't support WebSocket well
   - Dedicated instance ensures stable connections

3. **Benefits**:
   - Cost-effective: Only WebSocket runs 24/7, REST APIs scale to zero
   - Reliable: WebSocket connections never drop due to cold starts
   - Fast: Edge deployment for REST, dedicated server for WebSocket

---

## 🛠️ Tech Stack

### Backend (REST APIs)

| Technology | Purpose | Version |
|------------|---------|---------|
| **NestJS** | Progressive Node.js framework | 11.0.1 |
| **Drizzle ORM** | TypeScript-first ORM | 0.44.6 |
| **PostgreSQL (Neon)** | Serverless database | - |
| **JWT** | Authentication | 11.0.2 |
| **Passport** | Auth strategies (Local, Google OAuth) | 0.7.0 |
| **Bcrypt** | Password hashing | 6.0.0 |
| **Nodemailer** | Email sending (verification, reset password) | 7.0.11 |
| **Cloudinary** | File/image upload & storage | 2.8.0 |
| **Multer** | File upload handling | 2.0.2 |
| **Class Validator** | DTO validation | 0.14.2 |

### WebSocket Server

| Technology | Purpose | Version |
|------------|---------|---------|
| **NestJS** | Framework | 11.0.1 |
| **Socket.IO** | WebSocket library | 4.8.3 |
| **JWT** | Token verification | 11.0.2 |

### Database Schema

- **Users**: Authentication, profiles, roles
- **Projects**: Project management with members
- **Sprints**: Sprint planning and tracking
- **Tasks**: Task management with assignments, comments, attachments
- **Notifications**: Real-time notification system
- **Activity Logs**: Audit trail for all actions

---

## 📁 Project Structure

```
Work-Management/
├── my-nestjs-backend/              # REST API Backend (Deploy to Vercel)
│   ├── src/
│   │   ├── auth/                   # Authentication (Login, Register, JWT, OAuth)
│   │   ├── users/                  # User management
│   │   ├── projects/               # Project CRUD
│   │   ├── sprints/                # Sprint management
│   │   ├── tasks/                  # Task management
│   │   ├── notifications/          # Notification service + WebSocket trigger
│   │   ├── files/                  # File upload (Cloudinary)
│   │   ├── email/                  # Email service (Nodemailer)
│   │   ├── activity-logs/          # Activity logging
│   │   └── db/                     # Database schema (Drizzle)
│   ├── drizzle/                    # Database migrations
│   └── package.json
│
├── websocket-server/               # WebSocket Server (Deploy to Render)
│   ├── src/
│   │   ├── notifications/          # WebSocket gateway for real-time notifications
│   │   └── main.ts                 # Server entry point
│   └── package.json
│
├── API_DOCUMENTATION.md            # Complete API reference (100+ endpoints)
├── FRONTEND_INTEGRATION_GUIDE.md   # Frontend integration guide with code examples
├── VERCEL_ENV_VARS.md             # Vercel environment variables setup
├── RENDER_ENV_VARS.md             # Render environment variables setup
├── WEBSOCKET_DEBUG_GUIDE.md       # WebSocket troubleshooting guide
└── README.md                       # This file
```

---

## ✨ Features

### Authentication & Authorization
- ✅ User registration with email verification
- ✅ Login with email/username + password
- ✅ Google OAuth integration
- ✅ JWT-based authentication
- ✅ Password reset via email
- ✅ Role-based access control (Admin, Project Manager, Member)

### Project Management
- ✅ Create, update, delete projects
- ✅ Add/remove project members
- ✅ Assign roles to members
- ✅ Project activity tracking

### Sprint Management
- ✅ Create sprints with start/end dates
- ✅ Sprint status tracking (Planned, Active, Completed, Cancelled)
- ✅ Move tasks between sprints

### Task Management
- ✅ Create tasks with rich details (title, description, priority, status)
- ✅ Assign tasks to users
- ✅ Task comments with mentions
- ✅ File attachments (images, documents)
- ✅ Task status workflow (Todo, In Progress, Done, Not Completed)
- ✅ Priority levels (Low, Medium, High, Critical)

### Real-time Notifications
- ✅ WebSocket-based real-time notifications
- ✅ Project member added
- ✅ Task assigned
- ✅ Task status changed
- ✅ Sprint created/updated
- ✅ New comments on tasks
- ✅ Mark notifications as read
- ✅ Unread notification count

### File Management
- ✅ Upload files to Cloudinary
- ✅ Attach files to tasks
- ✅ Support images and documents
- ✅ Automatic thumbnail generation

### Email System
- ✅ Welcome email on registration
- ✅ Email verification link
- ✅ Password reset link
- ✅ Email template system with Handlebars

### Activity Logging
- ✅ Complete audit trail for all actions
- ✅ Track user actions on projects, tasks, sprints
- ✅ Timestamp and user attribution

---

## 🚀 Deployment

This project is deployed across multiple platforms for optimal performance and cost:

### Production URLs

| Service | Platform | URL | Purpose |
|---------|----------|-----|---------|
| **REST API** | Vercel | `https://work-management-chi.vercel.app` | Main backend APIs |
| **WebSocket** | Render | `https://work-management-4c6a.onrender.com` | Real-time notifications |
| **Database** | Neon | (Private connection string) | PostgreSQL database |
| **File Storage** | Cloudinary | (CDN URLs) | Image & file hosting |
| **Frontend** | Vercel | `https://jira-frontend-roan.vercel.app` | React application |

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│  VERCEL (REST APIs - Serverless Edge Functions)         │
│  • Auto-scaling based on traffic                        │
│  • Global CDN for fast response                         │
│  • Zero cost when idle                                  │
│  • Perfect for CRUD operations                          │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST trigger
                          ▼
┌─────────────────────────────────────────────────────────┐
│  RENDER (WebSocket - Always-On Instance)                │
│  • Persistent WebSocket connections                     │
│  • Broadcasts notifications to connected clients        │
│  • No cold starts, stable connections                   │
└─────────────────────────────────────────────────────────┘
```

### How It Works

1. **Event occurs** (e.g., user assigns a task)
   - REST API on Vercel receives request
   - Saves notification to Neon database

2. **Trigger WebSocket**
   - Vercel makes HTTP POST to Render WebSocket server
   - Payload: `{ userId, notification }`

3. **Broadcast to Frontend**
   - Render WebSocket broadcasts to connected clients
   - Frontend receives real-time notification
   - User sees notification bell update instantly

### Environment Variables Setup

#### Vercel (REST API Backend)
See: [`VERCEL_ENV_VARS.md`](./VERCEL_ENV_VARS.md)

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key
- `JWT_EMAIL_SECRET` - Email token signing key
- `FRONTEND_URL` - Frontend URL for CORS
- `WEBSOCKET_SERVER_URL` - Render WebSocket URL (for triggering notifications)

Optional:
- `CLOUDINARY_*` - For file uploads
- `SMTP_*` - For email sending
- `GOOGLE_*` - For OAuth

#### Render (WebSocket Server)
See: [`RENDER_ENV_VARS.md`](./RENDER_ENV_VARS.md)

Required:
- `JWT_EMAIL_SECRET` - Must match Vercel's JWT_EMAIL_SECRET

---

## 📚 Documentation

### For Developers

| Document | Description |
|----------|-------------|
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference with 100+ endpoints, request/response examples |
| [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md) | Step-by-step frontend integration with TypeScript code examples |
| [WEBSOCKET_DEBUG_GUIDE.md](./WEBSOCKET_DEBUG_GUIDE.md) | WebSocket troubleshooting and debugging guide |

### For Deployment

| Document | Description |
|----------|-------------|
| [VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md) | Environment variables for Vercel deployment |
| [RENDER_ENV_VARS.md](./RENDER_ENV_VARS.md) | Environment variables for Render WebSocket server |

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon account)
- Git

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Work-Management
```

#### 2. Setup REST API Backend

```bash
cd my-nestjs-backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your DATABASE_URL, JWT_SECRET, etc.

# Run database migrations
npm run drizzle:push

# Start development server
npm run start:dev
```

API will be available at `http://localhost:3000`

#### 3. Setup WebSocket Server

```bash
cd websocket-server
npm install

# Create .env file
cp .env.example .env
# Add JWT_EMAIL_SECRET (must match backend)

# Start development server
npm run start:dev
```

WebSocket will be available at `http://localhost:3001/notifications`

#### 4. Test the System

**Test REST API:**
```bash
curl http://localhost:3000/users/profile
```

**Test WebSocket Connection:**
Use the frontend or a WebSocket client to connect to `ws://localhost:3001/notifications`

---

## 🔧 Development Scripts

### Backend (my-nestjs-backend)

```bash
npm run start:dev      # Start with hot-reload
npm run build          # Build for production
npm run start:prod     # Start production server
npm run drizzle:push   # Push schema changes to database
npm run drizzle:generate  # Generate migration files
npm run lint           # Lint code
npm run test           # Run tests
```

### WebSocket Server (websocket-server)

```bash
npm run start:dev      # Start with hot-reload
npm run build          # Build for production
npm run start:prod     # Start production server
```

---

## 📦 Database Migrations

This project uses Drizzle ORM for type-safe database operations.

### Generate Migration

```bash
cd my-nestjs-backend
npm run drizzle:generate
```

### Apply Migration

```bash
npm run drizzle:push
```

### View Current Schema

```bash
npm run drizzle:studio
```

---

## 🔐 Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with expiration
- ✅ Email verification required
- ✅ CORS configured for production domains
- ✅ Input validation with class-validator
- ✅ SQL injection prevention via Drizzle ORM
- ✅ Environment variables for sensitive data

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is [MIT](LICENSE) licensed.

---

## 👥 Team

- **Backend Developer**: NestJS, Drizzle ORM, WebSocket
- **Frontend Developer**: React, TypeScript, Socket.IO Client
- **DevOps**: Vercel, Render, Neon Database

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Amazing Node.js framework
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe TypeScript ORM
- [Socket.IO](https://socket.io/) - Real-time WebSocket library
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Vercel](https://vercel.com/) - Serverless deployment platform
- [Render](https://render.com/) - WebSocket hosting
- [Cloudinary](https://cloudinary.com/) - Media management platform

---

## 📞 Support

If you encounter any issues:

1. Check the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details
2. See [WEBSOCKET_DEBUG_GUIDE.md](./WEBSOCKET_DEBUG_GUIDE.md) for WebSocket issues
3. Review [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md) for integration help
4. Open an issue on GitHub

---

**Made with ❤️ using NestJS, Drizzle ORM, Socket.IO, and TypeScript**
