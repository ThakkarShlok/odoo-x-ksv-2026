<div align="center">

# 🌉 VendorBridge

### Procurement & Vendor Management ERP

**A full-stack, role-based ERP system that digitizes end-to-end procurement workflows — from vendor onboarding and RFQ creation to quotation comparison, multi-level approvals, purchase order generation, and GST-compliant invoice dispatch.**

<br>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)

**Built for Odoo × KSV Hackathon 2026 by Team Odoo Zenith**

</div>

---

## 📖 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [System Architecture](#-system-architecture)
- [Procurement Workflow](#-procurement-workflow)
- [Role-Based Access](#-role-based-access)
- [Getting Started](#-getting-started)
- [Demo Credentials](#-demo-credentials)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)

---

## 🎯 Problem Statement

Organizations across India struggle with **manual, fragmented procurement workflows**. Vendor records are scattered in spreadsheets, RFQs go out over email with no audit trail, quotations are compared by hand, approvals get stuck in inboxes, and invoices are generated in Word with no link back to the original procurement decision. The result: slow decisions, lost paperwork, no accountability, and no visibility into spending patterns.

**VendorBridge solves this** with a unified, role-aware ERP platform that turns the entire procurement lifecycle into a structured, auditable, real-time workflow — built on a clean, scalable architecture that any organization can adopt.

---

## ✨ Our Solution

VendorBridge is a **production-grade Procurement & Vendor Management ERP** that handles the complete procurement lifecycle:

🏢 **Vendor Management** — Centralized vendor records with GST compliance, category classification, ratings, and search
📝 **RFQ Workflow** — Create RFQs with multi-item line specifications, invite specific vendors, set deadlines
💬 **Vendor Quotations** — Vendors log in to a dedicated portal, view invitations, submit competitive quotes with live total calculation
⚖️ **Side-by-Side Comparison** — Visual comparison of all received quotations with lowest-price highlighting and delivery-time analysis
✅ **Multi-Role Approvals** — Structured approval workflow with manager review, remarks, and audit trail
📦 **Auto-Generated Purchase Orders** — One-click PO generation from approved quotations
🧾 **GST-Compliant Invoices** — Auto-calculated 18% GST, downloadable as PDF, sendable via email
📊 **Activity Audit Log** — Every action timestamped and traceable for compliance
👥 **Four Distinct Roles** — Procurement Officer, Vendor, Manager, Admin — each with tailored UI and permissions

---

## 🚀 Key Features

### For Procurement Officers
- Create and manage vendor records with GST validation
- Multi-item RFQ creation with vendor invitations
- Side-by-side quotation comparison with intelligent highlighting
- Send selected quotations for manager approval
- Generate POs and invoices in one click
- Real-time dashboard with active RFQs, pending approvals, and recent activity

### For Vendors
- Dedicated vendor portal with role-scoped data
- Receive RFQ invitations with full item details
- Submit quotations with **live grand-total calculation** as prices are entered
- Track quotation status (submitted → under review → approved/rejected)
- View purchase orders and invoices addressed to them

### For Managers
- Pending approvals queue with all required context
- Approve or reject with mandatory remarks
- Audit trail of every decision

### For Admins
- Full system access including vendor lifecycle management
- Soft-delete protection for data integrity
- Activity log oversight

### Cross-Cutting
- 🔒 **JWT authentication** with bcrypt-hashed passwords (salt rounds 10)
- 🎨 **Role-aware sidebar navigation** — users see only what they should access
- 📱 **Responsive UI** with custom design system in teal + slate + amber
- 🔄 **Real-time UI updates** — toast notifications, live form totals, optimistic refetching
- 📑 **GST-compliant PDF invoices** — generated server-side with PDFKit
- 📧 **Email dispatch** with Ethereal preview for demo-safe testing
- 📊 **Recharts-powered analytics** ready for extension

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 19 + Vite 8 | Latest React with concurrent features; Vite for instant HMR |
| **UI Styling** | Tailwind CSS v4 | Utility-first styling with our custom teal/slate design system |
| **Routing** | React Router 7 | Modern nested routing with `<Outlet />` for role-based layouts |
| **Forms** | react-hook-form | Performant, uncontrolled forms with native validation |
| **HTTP Client** | Axios with interceptors | Auto-attach JWT, auto-logout on 401 |
| **Notifications** | react-hot-toast | Lightweight, JSX-friendly toasts |
| **Icons** | lucide-react | Consistent, tree-shakeable icon set |
| **Charts** | Recharts | For dashboard analytics |
| **Backend Runtime** | Node.js 18+ | Stable LTS, native async/await |
| **Backend Framework** | Express 5 | Battle-tested, async-error-aware |
| **ORM** | Prisma 6 | Type-safe queries, declarative schema, auto-generated client |
| **Database** | PostgreSQL (Neon-hosted) | Relational integrity for complex procurement entities |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | Stateless, scalable, industry-standard |
| **PDF Generation** | PDFKit | Server-side, professional invoice rendering |
| **Email** | Nodemailer (Ethereal transport) | Demo-safe email previews |
| **Validation** | express-validator | Server-side request validation |

---

## 🗄 Database Schema

We designed **11 interconnected models** with proper relations, indexes, foreign-key constraints, and 6 enums to capture the full procurement domain.

### Entity Relationship Diagram

![VendorBridge ERD](server/prisma/ERD.svg)

### Core Models

| Model | Purpose |
|-------|---------|
| **User** | All authenticated users with role-based access (PROCUREMENT_OFFICER, VENDOR, MANAGER, ADMIN) |
| **Vendor** | Vendor business records with GST, category, rating, linked to a User if vendor logs in |
| **RFQ** | Request for Quotation with title, deadline, status, and creator |
| **RFQItem** | Line items within an RFQ (product, quantity, unit) |
| **RFQVendor** | Many-to-many junction: which vendors are invited to which RFQ |
| **Quotation** | Vendor's response with prices, delivery days, status |
| **QuotationItem** | Line items within a quotation with unit price and computed total |
| **Approval** | Manager's approval decision with remarks and timestamp |
| **PurchaseOrder** | Generated from approved quotation, with auto-numbered PO# |
| **Invoice** | Generated from PO with 18% GST, downloadable as PDF |
| **ActivityLog** | Append-only audit trail of every system action |

### Enums

`Role` · `RFQStatus` · `QuotationStatus` · `ApprovalStatus` · `POStatus` · `InvoiceStatus`

### Why This Design Matters

- **Referential integrity** via foreign keys with `ON DELETE CASCADE` for child entities and `ON DELETE RESTRICT` for critical references
- **Performance** via indexes on every status field, foreign key, and timestamp used in queries
- **Uniqueness** enforced at the database level — one quotation per vendor per RFQ, one PO per quotation, one invoice per PO
- **Audit-readiness** via `ActivityLog` with JSONB metadata for flexible event capture
- **GST compliance** with `Decimal(12,2)` precision for monetary values and dedicated tax-rate fields

---

## 🏗 System Architecture

VendorBridge follows a clean three-tier architecture:

### Client Layer (Browser)
- **React 19 + Vite 8 + Tailwind v4**
- `AuthContext` manages JWT and user state via `localStorage`
- `AppLayout` provides a role-aware sidebar
- 14 route pages organized by feature (Dashboard, Vendors, RFQs, Quotations, etc.)
- `axiosInstance` automatically attaches Bearer tokens and handles 401 auto-logout

Communication: **HTTPS / REST + JWT**

### Server Layer (Node.js + Express 5)

**Middleware Stack:** CORS · JSON parser · `authMiddleware` · `roleMiddleware` · `errorHandler`

**Route → Controller Mapping:**

| Endpoint | Controller |
|----------|-----------|
| `/api/auth` | `authController` |
| `/api/vendors` | `vendorController` |
| `/api/rfqs` | `rfqController` |
| `/api/quotations` | `quotationController` |
| `/api/approvals` | `approvalController` |
| `/api/pos` | `purchaseOrderController` |
| `/api/invoices` | `invoiceController` (PDF + email) |
| `/api/activity` | `activityLogController` |
| `/api/dashboard` | `dashboardController` |

**Utilities:** `prismaClient` · `activityLogger` · `numberGenerator` · `pdfGenerator` (PDFKit) · `emailDispatcher` (Nodemailer)

Communication: **Prisma ORM**

### Database Layer (PostgreSQL on Neon)
- **11 tables** with proper relations and constraints
- **6 enums** for type-safe status management
- Indexes on all foreign keys, status fields, and timestamp queries
- Foreign keys with appropriate `ON DELETE` behaviors

### Architectural Principles

1. **Separation of Concerns** — Routes do mounting, controllers do logic, utils do infrastructure
2. **Stateless Auth** — JWTs with 7-day expiry, no server-side session storage
3. **Role Gating at Multiple Layers** — Middleware checks JWT validity, then `requireRole` checks permission, then queries scope to user's data
4. **Single Source of Truth** — Prisma schema generates types, migrations, and client; no schema duplication
5. **Audit by Default** — Every state-changing controller calls `logActivity()` — non-blocking, never throws

---

## 🔄 Procurement Workflow

```mermaid
graph LR
    A[Officer Creates RFQ] -->|invites vendors| B[Vendors Submit Quotations]
    B -->|all received| C[Officer Compares Side-by-Side]
    C -->|selects best| D[Sends for Approval]
    D --> E{Manager Reviews}
    E -->|Approves| F[Officer Generates PO]
    E -->|Rejects| G[Returns to Officer]
    F --> H[Officer Generates Invoice]
    H --> I[Downloads PDF / Sends Email]
    I --> J[Activity Log Records Everything]
```

Every transition is captured in the database with timestamps, the acting user, and structured metadata — enabling full audit trails for compliance.

---

## 👥 Role-Based Access

| Capability | Procurement Officer | Vendor | Manager | Admin |
|------------|:------------------:|:------:|:-------:|:-----:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Create / Edit Vendors | ✅ | ❌ | ❌ | ✅ |
| Soft-delete Vendors | ❌ | ❌ | ❌ | ✅ |
| Create / Publish RFQ | ✅ | ❌ | ❌ | ✅ |
| View RFQs (all) | ✅ | invited only | ✅ | ✅ |
| Submit Quotation | ❌ | ✅ | ❌ | ❌ |
| Compare Quotations | ✅ | ❌ | ✅ | ✅ |
| Send for Approval | ✅ | ❌ | ❌ | ✅ |
| Approve / Reject | ❌ | ❌ | ✅ | ❌ |
| Generate PO | ✅ | ❌ | ❌ | ✅ |
| Generate Invoice | ✅ | ❌ | ❌ | ✅ |
| Download Invoice PDF | ✅ | own only | ✅ | ✅ |
| Send Invoice Email | ✅ | ❌ | ✅ | ✅ |
| View Activity Log | ✅ | own only | ✅ | ✅ |

Access is enforced at **three layers**: JWT middleware → role middleware → query-level scoping. A vendor cannot access another vendor's data even with a forged URL.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Neon PostgreSQL database (or any PostgreSQL instance — connection string only)
- Git

### Installation

**Step 1 — Clone the repository**
```
git clone https://github.com/ThakkarShlok/odoo-x-ksv-2026.git
cd odoo-x-ksv-2026
```

**Step 2 — Set up the backend**
```
cd server
npm install
```

**Step 3 — Create your `.env` file in `server/`** (copy from `.env.example`)
```
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/dbname?sslmode=require"
JWT_SECRET="your-secret-here"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

**Step 4 — Initialize the database**
```
npx prisma migrate dev --name vendorbridge_init
npm run seed
```

**Step 5 — Start the backend**
```
npm run dev
```
Server runs on port 5000.

**Step 6 — Set up the frontend (in a new terminal)**
```
cd client
npm install
```

**Step 7 — Create `client/.env`**
```
VITE_API_URL=http://localhost:5000
```

**Step 8 — Start the frontend**
```
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔐 Demo Credentials

All accounts use the password: `password123`

| Role | Email | Linked To |
|------|-------|-----------|
| **Procurement Officer** | `officer@vb.com` | Priya Sharma |
| **Manager** | `manager@vb.com` | Rahul Mehta |
| **Admin** | `admin@vb.com` | Sanya Kapoor |
| **Vendor** | `acme@vendor.com` | Acme Hardware Pvt. Ltd. |
| **Vendor** | `techsupplies@vendor.com` | TechSupplies India |
| **Vendor** | `officemart@vendor.com` | OfficeMart Solutions |

The database is pre-seeded with sample vendors, an active RFQ, and a quotation already under review — so the full workflow can be demonstrated immediately after login.

---

## 📡 API Reference

The full API documentation is available in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login, returns `{ token, user }`
- `GET /api/auth/me` — Get current user

### Vendors
- `GET /api/vendors` — List vendors (with search and filter)
- `POST /api/vendors` — Create vendor (officer/admin)
- `PUT /api/vendors/:id` — Update vendor
- `DELETE /api/vendors/:id` — Soft-delete (admin only)

### RFQs
- `GET /api/rfqs` — List RFQs (role-scoped)
- `POST /api/rfqs` — Create RFQ (officer)
- `PUT /api/rfqs/:id/publish` — Publish RFQ
- `PUT /api/rfqs/:id/close` — Close RFQ

### Quotations
- `GET /api/rfqs/:id/quotations` — Get quotations for comparison
- `POST /api/quotations` — Submit quotation (vendor)
- `PUT /api/quotations/:id` — Update quotation

### Approvals
- `GET /api/approvals/pending` — Manager queue
- `POST /api/approvals` — Submit for approval
- `POST /api/approvals/:id/decide` — Approve or reject

### Purchase Orders
- `GET /api/pos` — List purchase orders
- `POST /api/pos/from-quotation/:id` — Generate PO from approved quotation

### Invoices
- `GET /api/invoices` — List invoices
- `POST /api/invoices/from-po/:id` — Generate invoice with 18% GST
- `GET /api/invoices/:id/pdf` — Download PDF (auth-protected blob)
- `POST /api/invoices/:id/email` — Send email with PDF attachment

### Dashboard and Activity
- `GET /api/dashboard/summary` — Role-aware counts
- `GET /api/activity` — Audit log

All authenticated endpoints require `Authorization: Bearer <token>` header.

---

## 📂 Project Structure

The project is organized as a monorepo with `client/` (React frontend) and `server/` (Node.js backend) at the root.

### Client (`client/`)
- **`src/components/`** — 10 reusable UI primitives: Button, Card, Input, Modal, DataTable, Badge, Spinner, EmptyState, Navbar, Sidebar
- **`src/layouts/AppLayout.jsx`** — Sidebar layout with role-aware navigation
- **`src/pages/`** — 14 route pages including Dashboard, Vendors, RFQ flow (List/Create/Detail), Quotation Compare, Approvals, Purchase Orders, Invoices, Activity Log, and vendor-specific pages
- **`src/context/AuthContext.jsx`** — JWT and user state management
- **`src/hooks/`** — `useAuth.js` and `useFetch.js`
- **`src/routes/ProtectedRoute.jsx`** — Authentication-gated route wrapper
- **`src/utils/`** — `axiosInstance.js` (Bearer token interceptor), formatters, validators
- **`vercel.json`** — SPA routing configuration for deployment

### Server (`server/`)
- **`controllers/`** — 9 controller modules: auth, vendor, rfq, quotation, approval, purchaseOrder, invoice (with PDF + email), dashboard, activityLog
- **`middleware/`** — `authMiddleware.js` (JWT verification), `roleMiddleware.js` (`requireRole`), `errorHandler.js` (global error handler)
- **`routes/`** — One route file per resource
- **`utils/`** — `prismaClient.js`, `activityLogger.js` (non-blocking audit), `numberGenerator.js` (RFQ/QUO/PO/INV numbering), `pdfGenerator.js` (PDFKit), `emailDispatcher.js` (Nodemailer)
- **`prisma/`** — `schema.prisma` (11 models + 6 enums), migration history, `seed.js` with realistic demo data, auto-generated `ERD.svg`
- **`server.js`** — Entry point with startup environment-variable guards

### Root
- **`API_DOCUMENTATION.md`** — Complete API endpoint reference
- **`README.md`** — Project documentation (this file)
- **`.gitignore`** — Excludes `.env`, `node_modules/`, build outputs

---

## 🎬 Demo Walkthrough

A 5-minute demo video accompanies this submission, walking through:

1. Officer creates a new vendor with GST compliance
2. Officer creates an RFQ with multiple line items, invites vendors
3. Two vendors log in separately and submit competing quotations
4. Officer compares side-by-side with lowest-price visual highlight
5. Officer sends the best quotation for manager approval
6. Manager reviews and approves with remarks
7. Officer generates a purchase order from the approved quotation
8. Officer generates a GST-compliant invoice from the PO
9. **PDF invoice is downloaded** — professional, brandable, accountant-ready
10. **Invoice is emailed** to the vendor with PDF attachment (Ethereal preview shown)
11. Activity log displays every action with timestamps and user attribution

---

<div align="center">

### Built with ❤️ in 8 hours for Odoo × KSV Hackathon 2026

**Thoughtful engineering · Scalable architecture · Real-world workflows**

</div>
