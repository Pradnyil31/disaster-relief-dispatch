# Emergency Resource & Disaster Relief Dispatch Coordinator
## Comprehensive Codebase Inventory & System Architecture Report

**Generated On:** September 2026  
**Repository Location:** `docs/CODEBASE_REPORT.md`  
**Tech Stack:** React 18 (Vite 5), Bootstrap 5.3 + Vanilla CSS, Axios, React Router v6, React Hook Form + Zod, React Hot Toast  

---

## 1. Executive Summary

This document presents a complete audit of every file currently existing in the repository. The project is an **Emergency Resource & Disaster Relief Dispatch Coordinator** web application designed to handle multi-role workflows: **Citizens** (reporting SOS emergencies), **Volunteers** (accepting/delivering dispatch tasks), **Donors** (contributing monetary/supplies aid), and **Administrators** (managing inventory, dispatch assignments, and platform monitoring).

The application currently features:
- A fully established React 18 SPA structure built with Vite 5.
- A customized **Emergency Design System** built using vanilla CSS variables, Bootstrap 5 classes, dark/glassmorphic aesthetics, and modern micro-animations.
- A role-based routing architecture (`AppRoutes.jsx`, `ProtectedRoute.jsx`, `PublicRoute.jsx`).
- Mock/localStorage authentication context supporting 4 distinct user roles (`CITIZEN`, `VOLUNTEER`, `DONOR`, `ADMINISTRATOR`).
- Modularized Axios API clients, Zod validators, custom hooks (Geolocation, Auth, API wrapper), and helper utilities.

---

## 2. Directory & File Structure

```
Emergency_Resource_And_Disaster_Relief_Dispatch_Coordinator/
├── .gitignore
├── kilo.jsonc
├── CHANGES_AND_PROBLEMS.md
├── .kilo/
│   └── plans/
│       └── frontend-plan-corrected.md
├── docs/
│   ├── Project_SRS.pdf
│   ├── SRS.md
│   └── CODEBASE_REPORT.md
└── frontend/
    ├── .env.development
    ├── .env.production
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── vite.config.js
    ├── eslint.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        │   ├── authApi.js
        │   ├── axiosClient.js
        │   ├── dispatchApi.js
        │   ├── donationApi.js
        │   ├── inventoryApi.js
        │   └── sosApi.js
        ├── assets/
        ├── components/
        │   └── common/
        ├── context/
        │   ├── AuthContext.jsx
        │   └── NotificationContext.jsx
        ├── hooks/
        │   ├── useApi.js
        │   ├── useAuth.js
        │   └── useGeolocation.js
        ├── pages/
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── DispatchManagementPage.jsx
        │   │   ├── DonationManagementPage.jsx
        │   │   ├── InventoryManagementPage.jsx
        │   │   ├── SOSManagementPage.jsx
        │   │   └── VolunteerManagementPage.jsx
        │   ├── citizen/
        │   │   ├── CitizenDashboard.jsx
        │   │   ├── MySOSHistoryPage.jsx
        │   │   └── SubmitSOSPage.jsx
        │   ├── donor/
        │   │   ├── DonorDashboard.jsx
        │   │   └── MyDonationsPage.jsx
        │   ├── public/
        │   │   ├── DonatePublicPage.jsx
        │   │   ├── LandingPage.jsx
        │   │   ├── LoginPage.jsx
        │   │   └── RegisterPage.jsx
        │   └── volunteer/
        │       ├── MyTasksPage.jsx
        │       ├── TaskDetailPage.jsx
        │       └── VolunteerDashboard.jsx
        ├── routes/
        │   ├── AppRoutes.jsx
        │   ├── ProtectedRoute.jsx
        │   └── PublicRoute.jsx
        ├── styles/
        │   ├── components.css
        │   ├── global.css
        │   └── variables.css
        └── utils/
            ├── constants.js
            ├── helpers.js
            └── validators.js
```

---

## 3. Detailed File Breakdown by Layer

### A. Specifications & Documentation (`docs/`, `.kilo/plans/`)
- **`docs/SRS.md` & `docs/Project_SRS.pdf`**: Official System Requirements Specification defining workflows, entity schemas, REST paths, role privileges, and emergency response SLAs.
- **`.kilo/plans/frontend-plan-corrected.md`**: Master execution roadmap with 8 implementation phases.
- **`CHANGES_AND_PROBLEMS.md`**: Log documenting setup choices, dependency resolution, and initial build configurations.
- **`docs/CODEBASE_REPORT.md`**: (This file) Complete codebase audit and component directory.

---

### B. Project Setup & Build Config (`frontend/`)
- **`package.json`**: Manages dependencies including `react@18.3.1`, `bootstrap@5.3.3`, `react-bootstrap@2.10.4`, `react-router-dom@6.26.1`, `axios@1.7.5`, `react-hook-form@7.52.2`, `zod@3.23.8`, `react-hot-toast@2.4.1`, `date-fns@3.6.0`.
- **`vite.config.js`**: Vite dev server and React plugin configuration.
- **`.env.development` & `.env.production`**: Base API endpoint definitions (`http://localhost:8080/api/v1`).
- **`index.html`**: HTML template with Inter typography and Bootstrap Icons CDN inclusions.

---

### C. Styling & Emergency Design System (`src/styles/`)
- **`variables.css`**: Design tokens defining HSL colors (emergency red `--primary-color: hsl(354, 85%, 54%)`, success green, info blue, warning orange), dark background hues, glassmorphic blur variables, and elevation shadows.
- **`global.css`**: Global resets, custom scrollbars, typography, and CSS keyframe animations (`fadeIn`, `pulse`).
- **`components.css`**: Component-specific styles including glassmorphic containers, animated badges, hero graphics, custom button hovers, and data cards.
- **`index.css`**: Central import linking Bootstrap CSS with custom theme variables.

---

### D. Application Entry, Context & Routing (`src/context/`, `src/routes/`)
- **`main.jsx` & `App.jsx`**: App entry point wrapped with `NotificationProvider` and `AuthProvider`.
- **`context/AuthContext.jsx`**: Manages authentication state, role storage in `localStorage`, login/register/logout methods, and role verification.
- **`context/NotificationContext.jsx`**: Toast notifications provider wrapping `react-hot-toast`.
- **`routes/AppRoutes.jsx`**: Master routing matrix containing nested public and protected route groups.
- **`routes/ProtectedRoute.jsx` & `PublicRoute.jsx`**: Route guards enforcing role permissions (`ADMINISTRATOR`, `VOLUNTEER`, `CITIZEN`, `DONOR`).

---

### E. API Services, Hooks & Utilities (`src/api/`, `src/hooks/`, `src/utils/`)
- **`api/axiosClient.js`**: Central Axios instance with Bearer token injection and HTTP 401/403 interceptors.
- **`api/authApi.js`, `sosApi.js`, `inventoryApi.js`, `dispatchApi.js`, `donationApi.js`**: Dedicated endpoint handlers for each domain entity.
- **`utils/constants.js`**: Domain constants (`ROLES`, emergency urgency levels, SOS statuses, dispatch states).
- **`utils/helpers.js`**: Date formatters, badge class mappers, and unit label generators.
- **`utils/validators.js`**: Zod schemas for login, register, SOS requests, inventory items, and donations.
- **`hooks/useAuth.js`, `useApi.js`, `useGeolocation.js`**: React hooks for authentication, asynchronous requests, and HTML5 GPS location retrieval.

---

### F. Page Components (`src/pages/`)

#### 1. Public Pages (`src/pages/public/`)
- **`LandingPage.jsx`**: Landing page featuring hero banner, quick emergency dispatch triggers, platform stats, live tickers, and disaster safety guides.
- **`LoginPage.jsx`**: Dark glassmorphic card interface with login form, validation feedback, and role badges.
- **`RegisterPage.jsx`**: Registration form with role selector cards (**Citizen**, **Volunteer**, **Donor**).
- **`DonatePublicPage.jsx`**: Public donation contribution page.

#### 2. Citizen Pages (`src/pages/citizen/`)
- **`CitizenDashboard.jsx`**: Citizen portal with quick SOS triggers, active emergency tracking cards, and emergency hotline contacts.
- **`SubmitSOSPage.jsx`**: Citizen emergency request submission page.
- **`MySOSHistoryPage.jsx`**: History log of previous SOS requests.

#### 3. Volunteer Pages (`src/pages/volunteer/`)
- **`VolunteerDashboard.jsx`**: Volunteer interface with Active/Standby status toggle, active task summaries, and route cards.
- **`MyTasksPage.jsx`**: List of assigned rescue and supply tasks.
- **`TaskDetailPage.jsx`**: Task detail page with status controls (`ASSIGNED` → `EN_ROUTE` → `DELIVERED`).

#### 4. Admin Pages (`src/pages/admin/`)
- **`AdminDashboard.jsx`**: Command dashboard with KPI stat cards (Active SOS, Pending Dispatches, Low Inventory Alerts, Active Responders) and incident logs.
- **`SOSManagementPage.jsx`**: Emergency triage management.
- **`InventoryManagementPage.jsx`**: Stockpile and resource monitoring.
- **`VolunteerManagementPage.jsx`**: Responder management.
- **`DispatchManagementPage.jsx`**: Dispatch coordination.
- **`DonationManagementPage.jsx`**: Financial and supply donation management.

#### 5. Donor Pages (`src/pages/donor/`)
- **`DonorDashboard.jsx`**: Donor dashboard tracking contribution impact metrics (Total Donated, Lives Impacted, Relief Kits Funded) and cause campaigns.
- **`MyDonationsPage.jsx`**: Transaction log of donor contributions.

---

## 4. Current Phase Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1: Setup & Scaffolding** | Vite, React 18, Bootstrap 5, folder structure | ✅ Complete |
| **Phase 2: Auth Foundation** | AuthContext, interceptors, login/register views | ✅ Complete |
| **Phase 3: Layout & Navigation** | Dark glassmorphic theme, responsive headers, dashboards | ✅ Complete |
| **Phase 4: Citizen SOS Flow** | SOS request form with GPS, urgency selector, supply checklist | ⏳ Next Up |
| **Phase 5: Volunteer Dispatch Flow**| Task acceptance and status workflow | 📅 Pending |
| **Phase 6: Admin Management** | Resource inventory CRUD, SOS triage, dispatch assignment | 📅 Pending |
| **Phase 7: Donor Contribution** | Razorpay payment simulation & donation ledger | 📅 Pending |
| **Phase 8: Polish & Optimization** | Performance tuning & deployment prep | 📅 Pending |
