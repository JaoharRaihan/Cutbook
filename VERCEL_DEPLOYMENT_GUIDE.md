# CutBook - Vercel Deployment Guide

This guide will help you deploy the CutBook web app to Vercel for testing purposes.

## Step 1: Push to GitHub

```bash
git add .
git commit -m "setup vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```
You'll be prompted to create a new project. Answer the questions:
- **Project name**: `cutbook`
- **Framework**: Select `Create React App` or leave as `Other`
- **Root directory**: Leave as `./`

### Option B: Using GitHub Integration

1. Go to [https://vercel.com/import](https://vercel.com/import)
2. Select your GitHub repository (`Cutbook`)
3. Vercel will auto-detect the `vercel.json` configuration
4. Add the required environment variables (see Step 3 below)
5. Click "Deploy"

## Step 3: Configure Environment Variables

After creating your Vercel project, you need to set environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables for **Production**:

```
REACT_APP_FIREBASE_API_KEY = AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN = cutbook-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = cutbook-app
REACT_APP_FIREBASE_STORAGE_BUCKET = cutbook-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 123456789
REACT_APP_FIREBASE_APP_ID = 1:123456789:web:...
REACT_APP_SENTRY_DSN = https://...@sentry.io/...
```

**Get these values from:**
- **Firebase**: Go to your Firebase Console → Project Settings → Web App config
- **Sentry**: Go to https://sentry.io/ → Project Settings → Client Keys (DSN)

## Step 4: Update Webpack Config (If Needed)

The `webpack.config.js` is already configured to use environment variables via `process.env`. Vercel will automatically inject these during the build process.

## Step 5: First Deployment

After setting up environment variables:

1. Go to your Vercel project dashboard
2. Click the "Deployments" tab
3. Click the "Redeploy" button on the latest deployment to trigger a new build with the environment variables
4. Wait for the build to complete (usually 2-5 minutes)

## Step 6: Access Your App

Once deployed, your app will be available at:
- **Preview URL**: https://cutbook.vercel.app (or your custom domain)

Share this URL to test from anywhere!

## Monitoring & Logs

1. **View Logs**: Go to Vercel Dashboard → Deployments → Click a deployment → View Logs
2. **Monitor Performance**: Use Vercel Analytics (if enabled)
3. **Error Tracking**: Check Sentry dashboard for app errors

## Troubleshooting

### Build Fails
- Check the logs in Vercel dashboard
- Ensure all environment variables are set correctly
- Run `npm run build:web` locally to verify the build works

### App Not Loading
- Check browser console for errors
- Verify Firebase rules allow public read access (if needed)
- Check network tab to see which requests are failing

### Environment Variables Not Loaded
- Make sure variables are set to "Production" environment
- Redeploy the project after changing environment variables
- Check that variable names match exactly (case-sensitive)

## Updating Your Deployment

Any push to `main` branch will automatically trigger a new deployment:

```bash
# Make changes
git add .
git commit -m "your changes"
git push origin main
```

Vercel will automatically build and deploy the new version!

## Custom Domain (Optional)

To use a custom domain:
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain
3. Follow the DNS configuration instructions

## Next Steps

Once tested on web:
1. Test functionality thoroughly
2. Gather feedback
3. Fix any issues found
4. Prepare for Play Store publication
5. Prepare for App Store publication

Happy testing! 🚀
