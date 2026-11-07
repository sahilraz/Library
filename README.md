# 📚 Libr — Production-Ready Multi-Library & Study Center SaaS

A comprehensive, production-ready, full-stack **Multi-Library & Study Center Management SaaS** platform. Built with a responsive, modern UI powered by CSS `clamp()`, React 18, Vite, Node.js, Express, and MongoDB. Seamlessly adapts across mobile devices (320px–430px), tablets, laptops, and ultra-wide desktop monitors, while remaining PWA and native wrapper (Capacitor/Cordova) ready.

---

## 🌟 Key Features & Architecture

### 1. Super Admin (Platform Owner)
- **Interactive Statistics Cards**:
  - All dashboard statistics cards are interactive and clickable, linking directly to dedicated listing pages:
    - **Libraries (Admins)** &rarr; `/superadmin/admins`
    - **Branches** &rarr; `/superadmin/branches`
    - **Managers** &rarr; `/superadmin/managers`
    - **Students / Patrons** &rarr; `/superadmin/users`
    - **Platform Revenue & Payments** &rarr; `/superadmin/payments`
  - Each listing page includes real-time search, status filters, branch filters, pagination, and empty/loading states.
- **Comprehensive Profile & Operational History**:
  - **Admin Details (`/superadmin/admins/:adminId`)**: Personal contact info, assigned branches, SaaS quotas, student metrics, complete login/logout session history (with IP, user agent, and last active timestamps), and human-friendly operational activity timeline.
  - **Manager Details (`/superadmin/managers/:managerId`)**: Profile info, supervising library admin, assigned branch, active managed students, login session history, and branch operational actions.
  - **Student Details (`/superadmin/users/:userId`)**: Profile photo, contact and guardian info, batch timings, assigned seat, subscription and payment records, renewal logs, and printable digital ID card generator.
- **WhatsApp Message Templates Engine (`/superadmin/templates`)**:
  - Database-backed template management system seeded with 17 predefined templates across 7 categories (*Expiry, Billing, Subscription, Allocation, Enrollment, Announcement, General*).
  - Dynamic placeholders supporting `{{student_name}}`, `{{student_phone}}`, `{{branch_name}}`, `{{batch_name}}`, `{{seat_number}}`, `{{expiry_date}}`, `{{remaining_days}}`, `{{payment_amount}}`, etc.
  - Super Admin CRUD interface with dynamic placeholder insertion chips, category filters, and live preview with mock data.
- **Human-Friendly Platform Activity (`/superadmin/activity`)**:
  - Replaces raw developer codes with natural language event summaries (e.g. *"Rahul Sharma's student information was updated by Admin"*, *"The assigned seat for Rahul Sharma was changed from Desk 12 to Desk 15"*).
  - Actor badges, relative timestamps, affected resource tags, and before/after value diffs.
  - Collapsible technical metadata drawer preserving raw JSON payloads for auditing and security compliance.
- **SaaS Plans & Financials**:
  - Custom SaaS plan creator (`/superadmin/plans`) with Days/Months/Years validity switch and granular resource quotas (branches, managers, students, seats, WhatsApp alerts).
  - Review library subscription purchases (`/superadmin/payments`) with 12-digit UTR and payment screenshot verification.
  - Platform Payment Gateway configuration for Super Admin UPI ID and QR code.

---

### 2. Library Admin (Study Hall / Library Owner)
- **Expiring Students Section (Admin Dashboard)**:
  - Dedicated real-time section highlighting students expiring within the next 5 days, expiring today, or already expired.
  - Sorted by nearest expiry with color-coded status badges (amber for expiring soon, pulsing red for today, rose for expired).
  - **One-Click Quick Actions**:
    1. **Extend Expiry**: Add custom days or set new expiry date with instant database update.
    2. **Update Details**: Edit personal info, guardian contact, address, and student photo.
    3. **Change Batch**: Reassign student to another batch timing session with conflict verification.
    4. **Change Seat**: Reassign student to any available seat in the branch.
    5. **View Profile**: Direct link to the student's full detail page (`/admin/users/:userId`).
    6. **WhatsApp Alert**: Opens the WhatsApp modal with pre-filled dynamic template messages.
    7. **Cancel Subscription**: Safely cancels subscription and frees seat assignment with confirmation and audit tracking.
- **Student Enrollment with Photo Upload**:
  - Drag-and-drop or device camera/file browser selection.
  - Instant client-side preview with replace and remove capabilities.
  - Client-side validation (max 5MB, JPEG/PNG/WebP/GIF).
  - Secure server-side image upload (`POST /api/upload/image`) integrated with ImgBB, keeping API keys protected on the server.
- **Enhanced Seat Management (`/admin/seats`)**:
  - Delete seat action on every desk card with confirmation modal.
  - **Active Student Safety Check**: Automatically detects active student assignments across all batches; blocks deletion and displays student names if currently assigned.
  - Live occupancy and available seat counters update immediately.
- **Interactive WhatsApp Messaging**:
  - Dynamic template selector reading active templates from the database.
  - Automatic placeholder replacement with live editable preview.
  - URL-encoded `wa.me` link generation and optional AIPlexy API dispatch.
- **Branch & Staff Manager Delegation**:
  - Manage multiple physical study centers within plan quotas.
  - Assign staff managers strictly to one branch with granular boolean permissions (`users_view`, `users_create`, `seats_assign`, `expenses_manage`, `reminders_send`, etc.).
- **Waiting Queue Management (`/admin/queue`)**:
  - Priority queue for walk-in students with one-tap promotion to an active seat upon vacancy.
- **Expense & Utility Tracker (`/admin/expenses`)**:
  - Track electricity, rent, maintenance, and internet expenses per branch.

---

### 3. Staff Manager (Branch Operator)
- Strictly scoped to their single assigned branch (`branchId`).
- Feature access governed by admin-configured permissions.
- Operational capabilities: walk-in student enrollment, desk assignment, queue processing, and daily branch expense logging.

---

### 4. Student / Patron (User Portal)
- Public self-registration with branch selection.
- **Personal Digital Study Pass**: Plan name, assigned desk number, branch timings, and remaining days countdown.
- **Digital ID Card Generator**: Printable identity card with student photo, barcode/QR, branch name, and emergency contact.
- Fee payment submission with UPI QR and UTR upload.
- In-app notification center for fee approvals and renewal reminders.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion |
| **UI Components** | ReactBits (`SpotlightCard`, `AnimatedCounter`, `ShimmerButton`, `PulseBadge`, `IOSToggle`, `BottomSheet`, `SkeletonLoader`) |
| **Responsive Engine** | CSS `clamp()`, `min()`, `max()`, responsive flex/grid layouts, mobile bottom nav + desktop top navigation |
| **Backend** | Node.js, Express, TypeScript, tsx |
| **Database** | MongoDB with Mongoose ODM, compound indexes, and reference integrity |
| **Security & Auth** | JWT Authentication, Bcrypt password hashing, Helmet, CORS, Rate Limiting, Zod schema validation |
| **File Uploads** | Multer memory storage, server-side ImgBB API proxy (`POST /api/upload/image`) |
| **Messaging** | Dynamic WhatsApp URL generator (`wa.me`) + optional AIPlexy official API integration |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher (local instance or MongoDB Atlas cluster)

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5000

# REQUIRED: MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/libr_saas?retryWrites=true&w=majority

# JWT Security
JWT_SECRET=your_super_secret_jwt_key_libr_saas_2026

# Initial Super Admin Seed Credentials
SUPERADMIN_EMAIL=owner@example.com
SUPERADMIN_PASSWORD=ChangeThisImmediately
SUPERADMIN_NAME=Platform Owner

# Optional: ImgBB API Key for Student Photo Hosting
IMGBB_API_KEY=your_imgbb_api_key_here

# Optional: AIPlexy Official WhatsApp API
AIPLEXY_API_KEY=
AIPLEXY_API_URL=https://api.aiplexy.com/v1/messages
AIPLEXY_INSTANCE_ID=
AIPLEXY_SENDER_NUMBER=
```

### 3. Installation
```bash
npm install
```

### 4. Running the Development Server
Both the backend API and Vite frontend run simultaneously on **port 5000** with hot module replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🧪 Testing & Building

### Run Automated Sanity Tests
Validates subscription expiry calculations, WhatsApp URL formatter, dynamic template substitution engine, financial date range filters, student creation schemas, OTP verification, and batch timing validation:

```bash
npm test
```

### Production Build
Compiles both the React client (via Vite) and server TypeScript (via `tsc`):

```bash
npm run build
```

### Start Production Server
Serves the compiled production client and API from a single Node.js process:

```bash
npm start
```

---

## 📋 Pre-Seeded Default Accounts

On first database connection, the system automatically initializes:

| Role | Email | Password | Details |
|---|---|---|---|
| **Super Admin** | `owner@example.com` | `ChangeThisImmediately` | Full platform control (prompted to change password on first login) |

*Default SaaS Plans (Starter, Growth Pro, Enterprise), platform payment configuration, and 17 WhatsApp templates are also automatically seeded on first launch.*

---

## 📱 Mobile & PWA Ready

- Fully responsive across mobile (320px–430px), tablet, and desktop viewports.
- Web App Manifest included in `client/public/manifest.json`.
- Safe-area inset support for notch and home indicator bars (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`).
- Can be packaged into native Android/iOS apps using **Capacitor** or **Cordova**.

---

## 📄 License
ISC License. Built for production scale and reliability.
