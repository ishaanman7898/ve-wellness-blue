# Thrive Checkout Backend (Railway)

This folder is for deploying the Puppeteer backend to Railway. It automates the checkout process for VE cart links.

---

## 🚀 Deployment on Railway (Node/NPM only)
1. Push this folder (and your repo) to GitHub.
2. On Railway.com, create a New Project → "Deploy from GitHub repo"
3. Make sure to set the service root to `backend/` (not repo root!)
4. **Keep the backend pure Node.js/NPM: Use only `package.json` and no Bun or pnpm.**
   - Delete any `bun.lockb` or non-npm lockfiles
   - Run `npm install` locally if you test
5. Railway will automatically detect your Dockerfile and build everything with the right dependencies and Chromium support!

**Backend will run on https://your-backend.up.railway.app**

### Endpoints
- POST `/checkout` — process items (see server.js for logic)
- GET `/checkout/status/:sessionId` — status
- GET `/health` — healthcheck

---

## ⚡ For Full Usage Docs
See the main repo README for how to wire your Netlify (frontend) to this Railway backend. Your Netlify frontend should call the `/checkout` endpoint at the Railway-provided URL (and never call localhost in production).
