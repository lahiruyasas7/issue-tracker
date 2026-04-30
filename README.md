# Issue Tracker

A full-stack issue tracking application with complete CRUD operations, JWT authentication, real-time filtering, and export capabilities.

## Live Demo

## url:

## Tech Stack

### Frontend

| Technology                    | Purpose                                          |
| ----------------------------- | ------------------------------------------------ |
| React 18 + Vite               | UI framework and build tool                      |
| TypeScript                    | Type safety across the entire frontend           |
| Tailwind CSS                  | Utility-first styling                            |
| shadcn/ui                     | Accessible UI component library                  |
| React Query (@tanstack/query) | Server state management, caching, mutations      |
| React Hook Form + Zod         | Form state and client-side validation            |
| React Router v6               | Client-side routing with URL-driven filter state |
| Axios                         | HTTP client with cookie-based auth interceptor   |
| date-fns                      | Date formatting                                  |

### Backend

| Technology         | Purpose                                  |
| ------------------ | ---------------------------------------- |
| Node.js + Express  | HTTP server and REST API                 |
| TypeScript         | Type safety across the entire backend    |
| Prisma ORM         | Database access and migrations           |
| MySQL              | Relational database                      |
| JWT (jsonwebtoken) | Stateless authentication                 |
| bcryptjs           | Secure password hashing                  |
| Zod                | Request validation (body + query params) |
| fast-csv           | Streaming CSV export                     |
| cookie-parser      | httpOnly cookie handling                 |

---

## Prerequisites

Before running this project, ensure the following are installed:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **MySQL** 8.0 or higher — running locally or via Docker
- **Git**

Verify your environment:

```bash
node --version    # v18+
npm --version
mysql --version
git --version
```

---

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/lahiruyasas7/issue-tracker.git
cd issue-tracker
```

### 2. Configure server environment variables

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your values:

```env
# Database
DATABASE_URL=mysql://root:yourpassword@localhost:3306/issue_tracker

# JWT — use strong random secrets in production
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Create the MySQL database

```bash
mysql -u root -p -e "CREATE DATABASE issue_tracker;"
```

### 4. Install server dependencies and run migrations

```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma generate
```

You should see:

```
✔ Generated Prisma Client
```

### 5. Start the backend server

```bash
npm run dev
```

The server runs on **http://localhost:5000**

### 6. Install client dependencies

Open a new terminal:

```bash
cd client
npm install
```

### 7. Configure client environment variables

```bash
cd client
cp .env.example .env
```

Open `client/.env` and fill in your values:

```env
VITE_API_URL=http://localhost:5000/api
```

### 8. Start the frontend

```bash
npm run dev
```

The app runs on **http://localhost:5173**

---

## Database Schema

```
users
  id            INT PK AUTO_INCREMENT
  name          VARCHAR
  email         VARCHAR UNIQUE
  passwordHash  VARCHAR
  createdAt     DATETIME

issues
  id            INT PK AUTO_INCREMENT
  title         VARCHAR
  description   TEXT
  status        ENUM(OPEN, IN_PROGRESS, RESOLVED, CLOSED)
  priority      ENUM(LOW, MEDIUM, HIGH, CRITICAL)
  severity      ENUM(MINOR, MAJOR, CRITICAL) nullable
  createdById   INT FK → users.id
  assignedToId  INT FK → users.id nullable
  createdAt     DATETIME
  updatedAt     DATETIME

comments
  id            INT PK AUTO_INCREMENT
  body          TEXT
  issueId       INT FK → issues.id (CASCADE DELETE)
  userId        INT FK → users.id
  createdAt     DATETIME
```

---

## API Reference

### Authentication

| Method | Endpoint             | Auth | Description                             |
| ------ | -------------------- | ---- | --------------------------------------- |
| POST   | `/api/auth/register` | No   | Register with name, email, password     |
| POST   | `/api/auth/login`    | No   | Login, sets httpOnly cookies            |
| POST   | `/api/auth/refresh`  | No   | Refresh access token via refresh cookie |
| POST   | `/api/auth/logout`   | No   | Clears auth cookies                     |
| GET    | `/api/auth/me`       | Yes  | Get current authenticated user          |

### Issues

| Method | Endpoint                 | Auth        | Description                                  |
| ------ | ------------------------ | ----------- | -------------------------------------------- |
| GET    | `/api/issues`            | Yes         | List issues with filters, search, pagination |
| GET    | `/api/issues/export`     | Yes         | Export issues to CSV or JSON                 |
| GET    | `/api/issues/:id`        | Yes         | Get single issue with comments               |
| POST   | `/api/issues`            | Yes         | Create new issue                             |
| PATCH  | `/api/issues/:id`        | Yes (owner) | Update issue details                         |
| PATCH  | `/api/issues/:id/status` | Yes (owner) | Update issue status                          |
| DELETE | `/api/issues/:id`        | Yes (owner) | Delete issue and its comments                |

#### GET /api/issues — Query parameters

| Parameter      | Type    | Description                                     |
| -------------- | ------- | ----------------------------------------------- |
| `page`         | number  | Page number (default: 1)                        |
| `limit`        | number  | Items per page (default: 10, max: 100)          |
| `status`       | enum    | Filter by: OPEN, IN_PROGRESS, RESOLVED, CLOSED  |
| `priority`     | enum    | Filter by: LOW, MEDIUM, HIGH, CRITICAL          |
| `severity`     | enum    | Filter by: MINOR, MAJOR, CRITICAL               |
| `search`       | string  | Search issue titles (case-insensitive)          |
| `sortBy`       | enum    | Sort by: createdAt, updatedAt, priority, status |
| `sortOrder`    | enum    | asc or desc (default: desc)                     |
| `assignedToMe` | boolean | Show only issues assigned to current user       |

#### GET /api/issues/export — Query parameters

Accepts all the same filter parameters as `GET /api/issues` (except pagination), plus:

| Parameter | Type | Description                |
| --------- | ---- | -------------------------- |
| `format`  | enum | csv or json (default: csv) |

### Comments

| Method | Endpoint                        | Auth         | Description               |
| ------ | ------------------------------- | ------------ | ------------------------- |
| POST   | `/api/issues/:issueId/comments` | Yes          | Add a comment to an issue |
| DELETE | `/api/comments/:commentId`      | Yes (author) | Delete own comment        |

### Users

| Method | Endpoint     | Auth | Description                            |
| ------ | ------------ | ---- | -------------------------------------- |
| GET    | `/api/users` | Yes  | List all users (for assignee dropdown) |

---

## Features

### Core

- **Issue management** — create, view, edit, and delete issues with title, description, priority, severity, and assignee
- **Status workflow** — enforced status transitions: `OPEN → IN_PROGRESS → RESOLVED → CLOSED`. Resolving and closing require confirmation
- **Comments** — any authenticated user can comment on any issue. Comment authors can delete their own comments
- **Search and filter** — filter by status, priority, severity, assignee. Debounced title search (400ms) to minimise API requests
- **Pagination** — page-based navigation with total count and page metadata
- **Status count dashboard** — live counts of issues by status at the top of the list page. Clickable to filter
- **Export** — export the full filtered issue list to CSV or JSON directly from the issues page

### Authentication and security

- JWT authentication with separate **access token** (15 min) and **refresh token** (7 days)
- Both tokens stored in **httpOnly cookies** — never accessible to JavaScript, protected against XSS
- Refresh token scoped to `/api/auth/refresh` path only — not sent on every request
- Automatic token refresh on 401 responses via Axios interceptor
- Passwords hashed with bcrypt (salt rounds: 12)
- Ownership guards — only issue creators can edit, update status, or delete their issues
- Zod validation on all endpoints — 422 responses with field-level errors

### Frontend

- **URL-driven filter state** — all filters live in the URL query string. Filters survive page refresh, browser back/forward navigation works, links are shareable
- **Debounced search** — local input state debounced at 400ms before triggering API requests
- **Optimistic UI** — React Query `placeholderData` keeps previous page visible while new page loads. No blank flash between pages
- **Skeleton loading** — content-shaped skeletons instead of spinners
- **Unsaved changes guard** — warns users before navigating away from a form with unsaved changes (both browser close and in-app navigation)
- **Reusable form** — `IssueForm` component handles both create and edit via a single `issueId` prop
- **Searchable assignee combobox** — searchable by name and email using shadcn Command component

---

## Status Transition Rules

```
OPEN        →  IN_PROGRESS
IN_PROGRESS →  OPEN (reopen)
IN_PROGRESS →  RESOLVED        (requires confirmation)
RESOLVED    →  IN_PROGRESS     (reopen)
RESOLVED    →  CLOSED          (requires confirmation)
CLOSED      →  (terminal — no further transitions)
```

---

## Design Decisions

**httpOnly cookies over localStorage**
JWTs stored in localStorage are vulnerable to XSS attacks. httpOnly cookies are inaccessible to JavaScript entirely. The access token (15 min) and refresh token (7 days) are both stored this way.

**Separate status update endpoint**
`PATCH /api/issues/:id/status` is a dedicated endpoint rather than bundling status into the general update. This enforces transition validation, handles the confirmation requirement cleanly, and maps clearly to the frontend confirmation dialog UX.

**Backend export endpoint over frontend export**
Exporting on the frontend would only export the current page. The backend export endpoint accepts the same filter params as the list endpoint but returns all matching records — so what you filter is exactly what you export.

**URL-driven filter state**
Filters are stored in URL search params rather than React state. This means the page is bookmarkable, filters survive refresh, and the browser back button works correctly. This is a meaningful UX difference over the more common `useState` approach.

**Zod on both frontend and backend**
The same field rules (min length, max length, enum values) are enforced client-side via React Hook Form + Zod and server-side via the validate middleware. Client-side validation gives instant feedback; server-side validation is the authoritative source of truth.

**Controller → Service pattern**
Controllers handle HTTP concerns only (parsing req, sending res). All business logic lives in services. This makes the logic independently testable and keeps each layer focused.

---

## Available Scripts

### Server

```bash
npm run dev      # start with nodemon (hot reload)
npm run build    # compile TypeScript to dist/
npm run start    # run compiled output
```

### Client

```bash
npm run dev      # start Vite dev server
npm run build    # production build to dist/
npm run preview  # preview production build locally
```

---

## Notes

- The `.env` file is **gitignored** — never committed. Use `.env.example` as the template
- Prisma migrations are committed in `server/prisma/migrations/` — run `npx prisma migrate deploy` in production
- The `GET /api/issues/export` route is registered **before** `GET /api/issues/:id` in Express to prevent the string `"export"` being matched as an `:id` param
- CSV exports include a UTF-8 BOM (`writeBOM: true`) for correct character rendering in Microsoft Excel
