# Deploying to Netlify Guide

This application is fully configured and ready for deployment on Netlify.

---

## Option 1: Deploy via GitHub (Recommended)

1. **Push code to GitHub** (or export/sync repository).
2. Go to [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** > **Import an existing project**.
3. Choose **GitHub** and select your repository.
4. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy Site**.

---

## Option 2: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Build the production assets:
   ```bash
   npm run build
   ```
3. Deploy to Netlify:
   ```bash
   netlify deploy --prod --dir=dist
   ```

---

## Important: Google OAuth Callback URL Configuration

Because this application uses Google Authentication / Google Sheets Integration:

1. Copy your deployed Netlify URL (e.g. `https://your-site-name.netlify.app`).
2. Go to [Firebase Console](https://console.firebase.google.com/).
3. Select your project -> **Authentication** -> **Settings** -> **Authorized Domains**.
4. Click **Add domain** and enter your Netlify domain (`your-site-name.netlify.app`).
5. (Optional) In [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials), add `https://your-site-name.netlify.app` to **Authorized JavaScript origins** and **Authorized redirect URIs**.

---

## Environment Variables (Optional)

If you want to override Firebase configurations dynamically on Netlify:
- In Netlify, go to **Site settings** > **Environment variables**.
- Add variables like `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc.
