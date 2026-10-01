# ShareRoom — Enterprise Temporary Chat Room & Shared Digital Kas Wallet Platform

**Version 1.0 (V1)** | Developed by **Noxei Resource Development**

---

## Executive Summary

**ShareRoom V1** is an enterprise-grade web application engineered for secure, temporary collaboration spaces integrated with a shared digital wallet ecosystem. Built upon **Laravel 11**, **Inertia.js v3**, **React 19**, **TypeScript**, and **Tailwind CSS**, the platform enables users to create time-bound public or private rooms, conduct live communication, share files, manage communal digital kas wallets integrated with the **Midtrans Payment Gateway**, upgrade to Premium status, and extend room operational durations.

The platform enforces strict governance through a dual-interface architecture: a modern user workspace and a comprehensive administrative management portal equipped with multi-chart financial analytics (including candlestick market pattern visualization), wallet control mechanisms, automated promo engines, and global announcement broadcasting systems.

---

## Technology Stack & Architecture

| Architecture Layer | Core Technology | Implementation Description |
| :--- | :--- | :--- |
| **Backend Engine** | Laravel 11.x | PHP enterprise framework handling ORM, routing, middleware, authentication, and database migrations. |
| **Monolith Bridge** | Inertia.js v3 | Client-side routing layer eliminating separate REST/GraphQL API boilerplates. |
| **Frontend UI** | React 19 & TypeScript 5 | Reactive UI library with strict static type checking across all client modules. |
| **Styling & Layout** | Tailwind CSS v3 | Utility-first design system with custom CSS variables, dark/light themes, and glassmorphism UI. |
| **Payment Gateway** | Midtrans Snap API | Production-ready payment processing supporting sandbox transaction simulations. |
| **Alert Subsystem** | SweetAlert2 | Modal dialog system for user feedback, transaction confirmations, and security warnings. |

---

## Core System Capabilities

### 1. Room Lifecycle & Communication
- **Instant Room Provisioning**: Create public or approval-gated private rooms with customizable expiration periods.
- **Role-Based Access Control (RBAC)**: Defined permissions for Room Owners, designated Treasurers (Bendahara), and Members.
- **Message Pinning Subsystem**: Room Owners can pin up to two high-priority messages to a floating header banner for instant team visibility.
- **File Sharing & Validation**: Support for sharing documents, images, and compressed archives capped at 20 files per room (expandable via Pro Pass).
- **Unread Message Navigation**: Automatic scroll positioning to unread messages with visual unread indicators.

### 2. Digital Kas Wallet & Monetization
- **Communal Room Wallet**: Dedicated digital ledger for every active room initialized at zero balance.
- **Midtrans Top-Up Pipeline**: Wallet funding via Snap Gateway supporting preset nominal selection and promo code redemption.
- **Pro Pass Subscription**: Wallet-funded room upgrades providing unlimited file attachments and premium badge status for all participants.
- **Room Duration Extension**: Configurable time extension packages managed dynamically by administrators.
- **Strict Spending Authorization**: Wallet balance deduction restricted strictly to Room Owners, Treasurers, and System Administrators.

### 3. Administrative Governance & Analytics
- **Multi-Chart Analytics Dashboard**: Visual metrics tracking user growth, public/private room distribution, and a financial candlestick pattern chart for cash flow monitoring.
- **Financial Accounting**: Automated tracking of active room balances, expired/abandoned room funds, and total platform liquidity.
- **Security & Wallet Controls**: Administrative wallet freezing with mandatory reason audit logging displayed transparently to room participants.
- **Global Broadcast Engine**: Multi-category announcement publisher featuring pinned status and pre-configured quick templates.

---

## Visual Application Overview

### User Portal & Onboarding Experience
![Welcome Landing Page](public/assets/images-md/WelcomePage.png)
*Public Landing Page featuring dynamic room discovery, instant room creation, and system architecture overview.*

![Platform Overview & Feature Showcase](public/assets/images-md/WelcomPage2.png)
*Ecosystem overview detailing temporary chat capabilities, digital kas wallets, and security controls.*

### Authentication & Access Security
![User Login Interface](public/assets/images-md/LoginPage.png)
*User authentication portal with credentials validation and account recovery options.*

![User Registration Interface](public/assets/images-md/RegisterPage.png)
*User onboarding registration form with real-time validation.*

### User Workspace & Control Panel
![User Dashboard](public/assets/images-md/DashboardUser.png)
*Centralized user dashboard displaying active rooms, pending private room join requests, and kicked notices.*

### Room Workspace & Live Communication
![Room Chat Interface](public/assets/images-md/RoomChatUser.png)
*Live room chat workspace featuring pinned messages header, role badges, file attachment drawer, and member controls.*

### Digital Kas Wallet & Midtrans Payment Pipeline
![Wallet Top-Up Modal](public/assets/images-md/TopupSaldoUser.png)
*Top-up modal with nominal presets, promo code input, and payment breakdown summary.*

![Midtrans Sandbox Gateway Interface](public/assets/images-md/TopupByMidtransPage.png)
*Midtrans payment gateway integration for payment settlement simulation.*

![Payment Settlement Confirmation](public/assets/images-md/TopUpByMidtransSuccess.png)
*Payment settlement callback confirmation screen.*

![Wallet Balance Updated](public/assets/images-md/SaldoJadi20Ribu.png)
*Wallet balance update notification and announcement broadcast.*

### Premium Pass & Global Announcements
![Premium Pass Upgrade Modal](public/assets/images-md/PremiumAccessPageUser.png)
*Pro Pass purchase modal displaying benefits, pricing formula, and kas wallet balance checks.*

![Public Announcements Board](public/assets/images-md/UserPengumumanPage.png)
*System-wide announcements board featuring category badges and pinned notices.*

---

### Administrative Governance Portal

![Admin Analytics Dashboard](public/assets/images-md/AdminDashboardPage.png)
*Executive dashboard presenting user growth curve, room type distribution donut chart, and financial candlestick market pattern analytics.*

![Admin User Management](public/assets/images-md/AdminManajemenPenggunaPage.png)
*User administration panel for account monitoring, role assignments, and account deletion.*

![Admin Room Governance](public/assets/images-md/AdminManajemenRoomPage.png)
*Room management interface supporting manual fund injections, wallet freezing with reason logging, and termination.*

![Admin Room Extension Packages](public/assets/images-md/AdminPerpanjangDurasiPage.png)
*Management panel for room extension duration options, pricing, and package activation.*

![Admin Promo Code Engine](public/assets/images-md/AdminManajemenKodePromoTopupPage.png)
*Voucher discount administration supporting percentage and fixed discount configurations.*

![Admin Announcement Publisher](public/assets/images-md/AdminManajemenPengumumanPage.png)
*Global announcement broadcasting tool equipped with quick template chips and pin options.*

---

## Installation & Deployment Guide

### Prerequisites
- **PHP**: >= 8.2 (PDO, OpenSSL, Mbstring, Tokenizer enabled)
- **Composer**: >= 2.x
- **Node.js**: >= 18.x & **npm**
- **Database**: MySQL 8.0+ or MariaDB 10.5+

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/NewX-Team/share-room-web.git
   cd share_room
   ```

2. **Install Backend Dependencies**
   ```bash
   composer install
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure Database Connection**
   Update `.env` with your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=shared-room
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. **Execute Database Migrations & Seeders**
   ```bash
   php artisan migrate --seed
   ```

7. **Launch Development Application**
   ```bash
   # Terminal 1: Vite Asset Compiler
   npm run dev

   # Terminal 2: Laravel Application Server
   php artisan serve
   ```

   Access the application at `http://127.0.0.1:8000`.

---

## Directory Structure

```text
share_room/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/              # Governance Controllers (Rooms, Users, Extension Packages, Promos, Announcements)
│   │   │   ├── AnnouncementController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── TopUpController.php
│   │   │   └── UserRoomController.php
│   │   └── Middleware/             # Security & Appearance Middlewares
│   └── Models/                     # Eloquent Domain Models
├── database/
│   ├── migrations/                 # Database Schema Migrations
│   └── seeders/                    # Database Initial Seeders
├── public/
│   └── assets/
│       └── images-md/              # Documentation Screenshots
├── resources/
│   ├── js/
│   │   ├── components/             # Reusable UI Components & Navigation
│   │   ├── layouts/                # Base Application & Governance Layouts
│   │   ├── pages/                  # Inertia React View Pages
│   │   └── types/                  # TypeScript Type Definitions
│   └── css/                        # Tailwind CSS Entry Points
└── routes/
    └── web.php                     # Route Definitions & Protection Groups
```

---

## Verification & Build Commands

```bash
# TypeScript Static Type Checking
npx tsc --noEmit

# Production Bundle Build
npm run build
```

---

## Development Credits & License

**ShareRoom V1** is developed and maintained by **Noxei Resource Development**. Distributed under the [MIT License](LICENSE).
