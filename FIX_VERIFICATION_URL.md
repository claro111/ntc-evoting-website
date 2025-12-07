# Fix Verification Email URL

## Problem
Email verification links were using `localhost` instead of the production URL, making them unusable on other devices.

## Solution Applied
Updated `voterService.js` to use an environment variable `VITE_APP_URL` for the verification link base URL.

## What You Need to Do in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `ntc-evoting-website`
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `VITE_APP_URL`
   - **Value**: `https://ntc-evoting-website-git-main-jelos-projects-1eb2e668.vercel.app`
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **...** menu on the latest deployment
8. Click **Redeploy** to apply the new environment variable

## How It Works
- When an admin approves a voter, the system generates a verification link
- Instead of using `window.location.origin` (which would be localhost when testing locally), it now uses `VITE_APP_URL` from environment variables
- This ensures all verification emails contain the production URL, regardless of where the admin is working from

## Testing
After redeploying:
1. Register a new voter account from any device
2. Admin approves the voter
3. Check the verification email - the link should now point to your Vercel URL
4. Click the link - it should work from any device

## Note
The code has been pushed to GitHub and will deploy automatically. You just need to add the environment variable in Vercel and redeploy once.
