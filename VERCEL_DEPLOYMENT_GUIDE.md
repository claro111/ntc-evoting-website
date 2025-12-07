# Vercel Deployment Guide for NTC E-Voting System

## Prerequisites

1. **GitHub Account** - You'll need a GitHub account to connect with Vercel
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier is sufficient)
3. **Git Installed** - Make sure Git is installed on your computer
4. **Firebase Project** - Your Firebase project should be set up and configured

## Step 1: Prepare Your Project for Git

### 1.1 Initialize Git Repository (if not already done)

Open your terminal in the project root directory and run:

```bash
cd ntc-evoting
git init
```

### 1.2 Create a GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right → "New repository"
3. Name it: `ntc-evoting-system` (or any name you prefer)
4. **Important**: Do NOT initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### 1.3 Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Add all files to git
git add .

# Commit the files
git commit -m "Initial commit - NTC E-Voting System"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ntc-evoting-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 2: Deploy to Vercel

### 2.1 Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub" (recommended)
4. Authorize Vercel to access your GitHub account

### 2.2 Import Your Project

1. On the Vercel dashboard, click "Add New..." → "Project"
2. Find your `ntc-evoting-system` repository in the list
3. Click "Import"

### 2.3 Configure Project Settings

Vercel will auto-detect that it's a Vite project. Configure as follows:

**Framework Preset**: Vite (should be auto-detected)

**Root Directory**: `ntc-evoting` (if your project is in a subfolder)

**Build Command**: `npm run build` (should be auto-filled)

**Output Directory**: `dist` (should be auto-filled)

**Install Command**: `npm install` (should be auto-filled)

### 2.4 Add Environment Variables

**CRITICAL**: You must add your environment variables in Vercel!

1. In the project configuration page, scroll down to "Environment Variables"
2. Add each of the following variables:

```
VITE_FIREBASE_API_KEY=AIzaSyDxP8OKeam4rWvDwehGvo8vjSl15s0onfA
VITE_FIREBASE_AUTH_DOMAIN=ntc-evoting-website.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ntc-evoting-website
VITE_FIREBASE_STORAGE_BUCKET=ntc-evoting-website.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1045454245972
VITE_FIREBASE_APP_ID=1:1045454245972:web:f5043498e0a965004f1dc1
VITE_EMAILJS_SERVICE_ID=service_d20m5t8
VITE_EMAILJS_TEMPLATE_APPROVAL=template_d2j48s2
VITE_EMAILJS_TEMPLATE_REJECTION=template_7ksubr
VITE_EMAILJS_PUBLIC_KEY=B8iNbZREemIGhkWmV
```

**How to add each variable:**
- Click "Add" or "Add Another"
- Enter the variable name (e.g., `VITE_FIREBASE_API_KEY`)
- Enter the value
- Select environment: Choose "Production", "Preview", and "Development" (all three)
- Click "Add"

Repeat for all 10 environment variables.

### 2.5 Deploy

1. After adding all environment variables, click "Deploy"
2. Vercel will build and deploy your application
3. This usually takes 2-5 minutes

## Step 3: Configure Firebase for Your Vercel Domain

### 3.1 Get Your Vercel URL

After deployment completes, Vercel will show you your live URL. It will look like:
```
https://ntc-evoting-system.vercel.app
```

Or you can use a custom domain if you have one.

### 3.2 Update Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `ntc-evoting-website`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click "Add domain"
5. Add your Vercel domain (e.g., `ntc-evoting-system.vercel.app`)
6. Click "Add"

### 3.3 Update Firebase Hosting Configuration (Optional)

If you want email verification links to use your Vercel domain:

1. In Firebase Console, go to **Authentication** → **Templates**
2. Click on "Email address verification"
3. Update the action URL to use your Vercel domain
4. Save changes

## Step 4: Test Your Deployment

### 4.1 Visit Your Site

Open your Vercel URL in a browser:
```
https://your-project-name.vercel.app
```

### 4.2 Test Key Features

- [ ] Voter registration page loads
- [ ] Admin login works
- [ ] Firebase authentication works
- [ ] Email verification links work
- [ ] Real-time updates work
- [ ] Voting functionality works

## Step 5: Set Up Custom Domain (Optional)

### 5.1 Add Custom Domain in Vercel

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Click "Add"
3. Enter your domain (e.g., `voting.ntc.edu.ph`)
4. Follow Vercel's instructions to configure DNS

### 5.2 Update DNS Records

Add these DNS records at your domain provider:

**For root domain (ntc.edu.ph):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (voting.ntc.edu.ph):**
```
Type: CNAME
Name: voting
Value: cname.vercel-dns.com
```

### 5.3 Update Firebase Authorized Domains

Add your custom domain to Firebase authorized domains (same as Step 3.2).

## Step 6: Continuous Deployment

Vercel automatically deploys when you push to GitHub!

### 6.1 Make Changes Locally

```bash
# Make your code changes
# Then commit and push
git add .
git commit -m "Your commit message"
git push
```

### 6.2 Automatic Deployment

- Vercel will automatically detect the push
- It will build and deploy the new version
- You'll get a notification when deployment completes

## Troubleshooting

### Build Fails

**Check build logs in Vercel:**
1. Go to your project in Vercel
2. Click on the failed deployment
3. Check the build logs for errors

**Common issues:**
- Missing environment variables
- Node version mismatch
- Build command errors

### Environment Variables Not Working

1. Make sure all variables start with `VITE_`
2. Redeploy after adding variables
3. Check that variables are added to all environments (Production, Preview, Development)

### Firebase Connection Issues

1. Verify Firebase config in Vercel environment variables
2. Check Firebase authorized domains
3. Ensure Firebase project is active

### Email Verification Links Not Working

1. Update EmailJS templates with your Vercel domain
2. Check that EmailJS credentials are correct in environment variables
3. Verify email templates in EmailJS dashboard

## Important Security Notes

1. **Never commit `.env` file to Git** - It's already in `.gitignore`
2. **Use Vercel environment variables** for all secrets
3. **Keep Firebase API keys secure** - They're already restricted in Firebase Console
4. **Monitor Firebase usage** - Set up billing alerts
5. **Review Firestore security rules** - Ensure they're properly configured

## Monitoring and Maintenance

### Vercel Analytics (Optional)

Enable Vercel Analytics to monitor:
- Page views
- Performance metrics
- User behavior

### Firebase Monitoring

Monitor in Firebase Console:
- Authentication usage
- Firestore reads/writes
- Storage usage
- Function invocations

## Support

If you encounter issues:

1. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
3. **Vite Documentation**: [vitejs.dev](https://vitejs.dev)

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Push changes to GitHub (triggers Vercel deployment)
git add .
git commit -m "Your message"
git push
```

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and connected to GitHub
- [ ] All environment variables added in Vercel
- [ ] First deployment successful
- [ ] Vercel domain added to Firebase authorized domains
- [ ] Site tested and working
- [ ] Custom domain configured (if applicable)
- [ ] Email verification tested
- [ ] Real-time features tested
- [ ] Admin panel tested
- [ ] Voter registration tested

## Your Deployment URLs

After deployment, note your URLs here:

**Vercel URL**: `https://_____________________.vercel.app`

**Custom Domain** (if applicable): `https://_____________________`

**Firebase Console**: `https://console.firebase.google.com/project/ntc-evoting-website`

---

**Congratulations!** Your NTC E-Voting System is now live on Vercel! 🎉
