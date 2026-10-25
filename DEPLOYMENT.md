# Field Staff Management System - Deployment Guide

This system consists of three main parts:
1. **Node.js/Express Backend** with MongoDB
2. **React Admin Dashboard** (Frontend)
3. **Flutter Mobile App** (Field Staff)

---

## ☁️ 1. Backend Deployment (Render or Heroku)

### Prerequisites:
- A MongoDB Atlas account (for cloud database)
- A Render.com account

### Steps:
1. Set up a MongoDB cluster on MongoDB Atlas.
2. Get your standard connection string (e.g. `mongodb+srv://<user>:<password>@cluster0...`).
3. Push your backend code to GitHub.
4. Go to **Render Dashboard** → **New Web Service**.
5. Connect your GitHub repository and select the `backend` folder as the Root Directory.
6. Set the Build Command: `npm install`
7. Set the Start Command: `npm start`
8. Add the following **Environment Variables** in Render:
   - `PORT` = `5000`
   - `JWT_SECRET` = `<A strong random secret string>`
9. Add MongoDB using either of these options:
   - Option A: `MONGO_URI` = `<Your MongoDB Atlas Connection String>`
   - Option B:
     `MONGO_USERNAME`, `MONGO_PASSWORD`, `MONGO_CLUSTER`, `MONGO_DATABASE`, `MONGO_APP_NAME`
10. Click **Deploy**.

---

## 🌐 2. Frontend Deployment (Vercel or Netlify)

### Vercel Deployment Steps:
1. Deploy the **repository root**, not the `frontend` folder by itself. The root `vercel.json` is configured to build `frontend` and serve `frontend/dist`.
2. Push your code to GitHub.
3. Go to Vercel and **Add New Project**.
4. Import this repository.
5. In **Environment Variables**, add `VITE_API_URL` and set it to your deployed backend base URL (example: `https://my-backend.onrender.com`).
6. Click **Deploy**. Vercel will run the root `vercel.json`, build the Vite app in `frontend`, and serve it with SPA rewrites for React Router.
7. If login shows `405 Method Not Allowed`, your frontend is still posting to the Vercel site instead of the backend. Recheck `VITE_API_URL` and redeploy.

---

## 📱 3. Mobile App Deployment (Android / Play Store)

### Preparing for Release:
1. Open `mobile/lib/services/api_service.dart`.
2. Change the `baseUrl` from `http://10.0.2.2:5000/api/v1` to your **Deployed Backend URL**.
3. In the terminal, navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
4. Build the Android App Bundle (AAB):
   ```bash
   flutter build appbundle
   ```
5. You can find the generated `.aab` file at:
   `build/app/outputs/bundle/release/app-release.aab`
6. Upload this file to the Google Play Console, fill out the store listing details, and publish the app.

---

## 🚀 Local Testing Commands
If you want to run everything locally:
- **Backend**: `cd backend && npm run dev`
- **Frontend**: `cd frontend && npm run dev`
- **Mobile**: `cd mobile && flutter run` (Requires Android Emulator or connected device)
- **Seed Data**: `cd backend && node seed.js` (Creates initial Admin/Staff accounts)

The backend uses `mongodb://127.0.0.1:27017/field_staff_system` by default in development. Install and start MongoDB Community Server before starting the backend, and set `JWT_SECRET` in `backend/.env`. The backend health check is `http://localhost:5000/`.

For the interview demo after seeding:
- **Admin**: `9876543210` / `123456`
- **Staff**: `9988776655` / `123456`

These are demo-only credentials. Running `seed.js` clears existing users and application data before creating the sample data; use only with an empty, disposable demo database.
