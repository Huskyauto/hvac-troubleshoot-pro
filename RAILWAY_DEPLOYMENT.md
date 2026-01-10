# Railway Deployment Guide for HVAC Troubleshoot Pro

## Prerequisites
1. GitHub account (you already have: https://github.com/Huskyauto/hvac-troubleshoot-pro)
2. Railway account (sign up at https://railway.app with GitHub)

## Step-by-Step Deployment Instructions

### 1. Sign Up / Login to Railway
1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway to access your GitHub account

### 2. Create New Project from GitHub
1. Click "New Project" on Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your repository: `Huskyauto/hvac-troubleshoot-pro`
4. Railway will automatically detect it's a Node.js project

### 3. Add MySQL Database
1. In your Railway project, click "New"
2. Select "Database" → "Add MySQL"
3. Railway will provision a MySQL database automatically
4. Copy the `DATABASE_URL` connection string (it will be in the format: `mysql://user:password@host:port/database`)

### 4. Configure Environment Variables
Click on your service → "Variables" tab and add these:

**Required Variables:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=<copy from Railway MySQL service>
```

**OAuth Variables (from your Manus project):**
```
JWT_SECRET=<generate a random 32-character string>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=<your Manus app ID>
OWNER_OPEN_ID=<your owner open ID>
OWNER_NAME=Robert Washburn
```

**App Branding:**
```
VITE_APP_TITLE=HVAC Troubleshoot Pro
VITE_APP_LOGO=<your logo URL>
```

**Built-in API (if using Manus services):**
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=<your API key>
VITE_FRONTEND_FORGE_API_KEY=<your frontend API key>
```

**Analytics (optional):**
```
VITE_ANALYTICS_ENDPOINT=<your analytics endpoint>
VITE_ANALYTICS_WEBSITE_ID=<your website ID>
```

### 5. Update OAuth Callback URL
After deployment, Railway will give you a URL like: `https://your-app.railway.app`

You need to register this URL in your Manus OAuth settings:
- Callback URL: `https://your-app.railway.app/api/oauth/callback`

### 6. Deploy
1. Railway will automatically deploy when you push to GitHub
2. Or click "Deploy" button in Railway dashboard
3. Wait 3-5 minutes for build and deployment
4. Your app will be live at: `https://your-app.railway.app`

### 7. Run Database Migrations
After first deployment:
1. Go to your service in Railway
2. Click "Settings" → "Deploy Logs"
3. You may need to run migrations manually using Railway CLI or by adding a deploy script

## Troubleshooting

### If deployment fails:
1. Check "Deploy Logs" in Railway dashboard
2. Verify all environment variables are set correctly
3. Ensure DATABASE_URL is correctly formatted

### If OAuth doesn't work:
1. Verify the callback URL is registered in Manus OAuth settings
2. Check that OAUTH_SERVER_URL and VITE_OAUTH_PORTAL_URL are correct
3. Ensure JWT_SECRET is set

### If database connection fails:
1. Verify DATABASE_URL format: `mysql://user:password@host:port/database`
2. Check that MySQL service is running in Railway
3. Ensure database migrations have run

## Cost
- Railway free tier: $5/month credit
- Typical usage for this app: $3-5/month
- If you exceed free tier, Railway will charge your credit card

## Alternative: Keep Using Manus
Once Manus support fixes the deployment issue, you can switch back. The code works on both platforms.

---
**Generated:** January 8, 2026
