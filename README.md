<div align="center">
  <h1>💰 FinTrack — Personal Finance Manager</h1>
  <p>A professional, full-stack SaaS application for tracking expenses, managing budgets, and analyzing financial health.</p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
</div>

<br />

## 📋 Project Overview
FinTrack is a robust personal finance management application designed to give users complete control over their financial data. Built with modern web technologies, it features a highly responsive UI, secure JWT-based authentication, interactive data visualization, and comprehensive budgeting tools.

## ✨ Features
* **Secure Authentication:** JWT-based access and refresh token rotation.
* **Dashboard Analytics:** High-level summary of income, expenses, and savings rates with interactive charts.
* **Smart Budgeting:** Set category-level budgets and receive intelligent warning notifications when approaching limits.
* **Transaction Management:** Full CRUD operations with advanced filtering, sorting, and pagination.
* **Dynamic Reports:** Export transaction data directly to CSV or Excel (`.xlsx`).
* **Custom Categories:** Seeded default categories with full support for user-defined custom categories.
* **Internationalization (i18n):** Native support for English and Arabic (RTL).
* **Theme Customization:** Light, Dark, and System theme synchronization.
* **Multi-Currency Support:** Format balances dynamically (USD, EUR, GBP, LYD).

## 📸 Screenshots
*(Add high-quality screenshots of your deployed application here)*
* **Dashboard:** `![Dashboard Screenshot](path/to/dashboard.png)`
* **Transactions View:** `![Transactions Screenshot](path/to/transactions.png)`
* **Mobile View:** `![Mobile Screenshot](path/to/mobile.png)`

---

## 🛠️ Tech Stack

### Frontend Architecture
* **Framework:** React 19 + TypeScript (Vite)
* **Styling:** Tailwind CSS v4
* **State Management:** Zustand (Global State) + TanStack Query (Server State)
* **Forms & Validation:** React Hook Form + Zod
* **Charts:** Chart.js + react-chartjs-2
* **Icons:** Lucide React

### Backend Architecture
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Database:** SQLite (Development) / PostgreSQL (Production)
* **ORM:** Prisma
* **Security:** Helmet, CORS, Express Rate Limit, bcryptjs
* **Validation:** Zod schemas

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) 18.0 or higher
* [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fintrack.git
cd fintrack
```

### 2. Environment Configuration
Create `.env` files in both the `client` and `server` directories.

**Server (`server/.env`):**
```env
# Database Configuration
DATABASE_URL="file:./dev.db" # Use PostgreSQL URL for production

# Authentication Secrets (Change these in production!)
JWT_ACCESS_SECRET="your_super_secret_access_key"
JWT_REFRESH_SECRET="your_super_secret_refresh_key"

# Server Configuration
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

**Client (`client/.env`):**
```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Install Dependencies & Setup Database
```bash
# Setup Backend
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed      # Seeds default categories

# Setup Frontend
cd ../client
npm install
```

### 4. Run Development Servers
Start both servers concurrently:
```bash
# In the server directory:
npm run dev

# In the client directory:
npm run dev
```
Navigate to `http://localhost:5173` to view the application.

---

## 🏗️ Project Structure & Architecture Notes
FinTrack enforces a strict separation of concerns between the client and server.

```text
├── client/                      # React Frontend Environment
│   ├── src/
│   │   ├── components/          # Reusable, stateless UI components
│   │   ├── hooks/               # Custom React hooks (e.g., useCountUp)
│   │   ├── i18n/                # Translation dictionaries and Context
│   │   ├── layouts/             # Page layouts (AuthLayout, DashboardLayout)
│   │   ├── pages/               # Stateful route pages
│   │   ├── services/            # Axios API wrappers (Separation of API layer)
│   │   ├── store/               # Zustand state stores (Auth, Theme, Settings)
│   │   ├── types/               # Shared TypeScript interfaces
│   │   └── utils/               # Pure utility functions (Currency formatting, Charts)
│   └── package.json
│
└── server/                      # Express Backend Environment
    ├── prisma/                  # ORM Schema and Migration definitions
    ├── src/
    │   ├── controllers/         # Request handling and business logic
    │   ├── middleware/          # JWT Auth, Validation, Error Handling
    │   ├── routes/              # Express route definitions
    │   ├── utils/               # JWT signers, Password hashing
    │   └── validators/          # Zod input validation schemas
    └── package.json
```

---

## 📖 API Documentation
The REST API is strictly validated using Zod. All authenticated routes require a valid `Bearer <Token>` header.

### Authentication (`/api/auth`)
* `POST /register`: Create a new user account.
* `POST /login`: Authenticate and receive JWT tokens.
* `POST /refresh`: Generate a new access token using a valid refresh token.
* `POST /logout`: Invalidate the current session.

### Analytics (`/api/analytics`)
* `GET /dashboard`: Fetches high-level summary metrics (Income, Expenses, Balance) and chart datasets.
* `GET /monthly`: Fetches specific monthly reports with daily tracking arrays.
* `GET /insights`: Generates smart insights (e.g., budget warnings, unusual spending) based on the user's recent activity.

*(Full API schema is enforced via Prisma in `schema.prisma`)*

---

## 🔒 Production Deployment

### Security Checklist
Before deploying, ensure the following steps are taken:
1. **Strong Secrets:** Generate highly secure, random strings for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
2. **CORS Configuration:** Explicitly set the `CLIENT_URL` to your exact production frontend domain.
3. **Database Migration:** Use a production-grade relational database (e.g., PostgreSQL) instead of SQLite. Change the `DATABASE_URL` and run `npx prisma migrate deploy`.

### Deploying the Backend (e.g., Render / Heroku)
1. Set the root directory to `server`.
2. Build command: `npm install && npm run prisma:generate && npm run build`
3. Start command: `npm start`
4. Inject all required Environment Variables.

### Deploying the Frontend (e.g., Vercel / Netlify)
1. Set the root directory to `client`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` to your deployed backend URL.

---

## 🔮 Future Improvements
* **Automated Testing:** Integration of Jest and React Testing Library for end-to-end component testing.
* **OAuth Integration:** Allow users to register/login via Google or GitHub.
* **PWA Support:** Add service workers to allow offline tracking capabilities and mobile installation.
* **Receipt Scanning:** Integration with OCR APIs to extract data directly from uploaded receipt images.

---
*Developed with modern software engineering best practices.*
