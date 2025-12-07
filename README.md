# Thrive Wellness Web App — Monorepo

A premium wellness e-commerce experience built with React, Vite, Tailwind, and shadcn/ui. This monorepo contains both the main frontend (client) and a Puppeteer-based backend (cart microservice) to automate checkout on the official VE cart portal.

---

## Table of Contents
- [Stack Overview](#stack-overview)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Deployment](#deployment)
  - [Netlify](#netlify)
  - [Cart Service (Railway or VPS)](#cart-service-railway-or-vps)
- [Cart Server Architecture](#cart-server-architecture)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Stack Overview
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend/microservice:** Node.js (Express), Puppeteer (cart automation), CORS
- **Dev tools:** ESLint, Prettier, Railway (suggested for cart server hosting)
- **Deployment:** Netlify ([frontend only](#netlify)), Railway or VPS (cart backend)

---

## Repository Structure

```txt
.
├── src/                 # Main frontend source code (pages, components, etc)
├── public/              # Static frontend assets, product images, video etc.
├── cart/                # Puppeteer automation server (Express API)
│   ├── server.js        # Cart service runner
│   ├── README.md        # Backend setup
│   └── ...
└── ...                  # Standard monorepo Vite/React setup
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-url>
cd ve-wellness-blue
npm install
```

### 2. Run both servers locally (default, for dev only)

```bash
npm run dev
# This runs BOTH:
# - Vite frontend at http://localhost:5173
# - Cart backend at http://localhost:3001
```

Or, run individually:

```bash
npm run dev:frontend    # Just the React/Vite frontend
npm run dev:cart        # Just the backend cart service
```

---

## Local Development Notes
The main UI is on [localhost:5173](http://localhost:5173) by default. All cart-related checkouts are proxied to the Puppeteer backend on :3001. For full functionality (and VE checkout automation), both must be running!

## Deployment

### Netlify (Frontend)
- **What deploys:** ONLY the frontend `/src`. The cart backend does NOT run on Netlify.
- **Limitation:** Netlify can't run Puppeteer/Node backend. You must host the cart server (cart/ directory) somewhere else (see below).
- **Frontend API URL:** Ensure your production UI calls the correct remote cart backend (e.g. Railway, Render, VPS, etc).

### Cart Service (Railway or VPS)
- Deploy `/cart` to Railway (or a VPS). It runs as a Node process, with puppeteer (headless browser) enabled.
  - Railway setup guide: see `/cart/README.md`.
- Set the correct CORS settings and allow frontend domain.
- Update the frontend to call your deployed cart backend in production (not localhost!).

---

## Cart Server Architecture
- **Endpoints**
  - `POST /checkout` — Accepts `{ items: [...] }` and opens browser tabs for each (Puppeteer)
  - `GET /checkout/status/:sessionId` — Progress polling
- **Development:** The backend launches a real (not headless) browser locally to process the cart with VE's portal.
- **Production:** Recommend Railway, Render, or a Linux VPS — NOT deployable on pure frontend hosts like Netlify/Vercel.

---

## Environment Variables
- `PORT` for cart (default 3001)
- (Frontend uses standard Vite env — see docs if needed)

---

## License
MIT (see LICENSE)

---

## Contributors
Built with care by the Thrive development team.
