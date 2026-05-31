# FinTrack — Personal Finance Manager

A modern, full-stack expense tracker SaaS application built with React 19, TypeScript, Express.js, and PostgreSQL.

![FinTrack](https://img.shields.io/badge/FinTrack-v1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **User Authentication** — Register, login, JWT access/refresh tokens
- **Transaction Management** — Full CRUD for income and expenses
- **Category System** — Custom categories with defaults seeded on registration
- **Analytics Dashboard** — Charts (bar, line, pie), spending breakdown
- **Search & Filters** — Search by name, filter by category/type/date, sort
- **Data Export** — CSV and Excel export of filtered transactions
- **Dark Mode** — Light, dark, and system theme modes
- **Currency Support** — USD, EUR, GBP, LYD
- **Responsive Design** — Mobile-first, works on all devices
- **Security** — Helmet, CORS, rate limiting, bcrypt, SQL injection protection

## Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router, React Hook Form, Zod
- TanStack Query
- Chart.js + react-chartjs-2
- Lucide React icons
- Sonner (toast notifications)

### Backend
- Node.js + TypeScript + Express.js
- Prisma ORM + PostgreSQL
- JWT Authentication (access + refresh tokens)
- Zod validation
- Helmet, CORS, express-rate-limit

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

**Server** (`server/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker?schema=public"
JWT_ACCESS_SECRET="your-secure-access-secret"
JWT_REFRESH_SECRET="your-secure-refresh-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Setup Database

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Route pages
│   │   ├── routes/          # Router configuration
│   │   ├── services/        # API service modules
│   │   ├── store/           # Context providers
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Utility functions
│   └── ...
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Category seeder
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, validation, errors
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # JWT, password, Prisma
│   │   └── validators/      # Zod schemas
│   └── ...
└── README.md
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh tokens |
| POST | /api/auth/logout | Logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/me | Get profile |
| PUT | /api/users/me | Update profile |
| PUT | /api/users/password | Change password |
| PUT | /api/users/avatar | Upload avatar |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List categories |
| POST | /api/categories | Create category |
| PUT | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | List (paginated, searchable) |
| GET | /api/transactions/export | Export data |
| POST | /api/transactions | Create transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/dashboard | Dashboard data |
| GET | /api/analytics/monthly | Monthly report |

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import repo in Vercel
3. Set root directory to `client`
4. Set `VITE_API_URL` environment variable
5. Deploy

### Backend (Render)
1. Push to GitHub
2. Create Web Service on Render
3. Set root directory to `server`
4. Build command: `npm install && npx prisma generate && npm run build`
5. Start command: `npm start`
6. Set environment variables

## License

MIT
