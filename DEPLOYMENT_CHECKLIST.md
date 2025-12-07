# Quick Deployment Checklist

Use this checklist to deploy your NTC E-Voting System to Vercel.

## Pre-Deployment

- [ ] All code is working locally (`npm run dev`)
- [ ] All tests pass (`npm run test`)
- [ ] Firebase is configured and working
- [ ] EmailJS is configured and working
- [ ] `.env` file has all required variables

## GitHub Setup

- [ ] Create GitHub account (if you don't have one)
- [ ] Create new repository on GitHub
- [ ] Initialize Git in your project: `git init`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Add remote: `git remote add origin YOUR_GITHUB_URL`
- [ ] Push: `git push -u origin main`

## Vercel Setup

- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Connect Vercel to your GitHub account
- [ ] Import your GitHub repository
- [ ] Configure project settings:
  - Framework: Vite
  - Root Directory: `ntc-evoting`
  - Build Command: `npm run build`
  - Output Directory: `dist`

## Environment Variables in Vercel

Add these 10 environment variables in Vercel:

- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_EMAILJS_SERVICE_ID`
- [ ] `VITE_EMAILJS_TEMPLATE_APPROVAL`
- [ ] `VITE_EMAILJS_TEMPLATE_REJECTION`
- [ ] `VITE_EMAILJS_PUBLIC_KEY`

**Important**: Select all three environments (Production, Preview, Development) for each variable!

## Deploy

- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Note your Vercel URL (e.g., `https://your-project.vercel.app`)

## Firebase Configuration

- [ ] Go to Firebase Console
- [ ] Navigate to Authentication → Settings → Authorized domains
- [ ] Add your Vercel domain (e.g., `your-project.vercel.app`)
- [ ] Save changes

## Testing

Test these features on your live site:

- [ ] Homepage loads correctly
- [ ] Voter registration page works
- [ ] Admin login works
- [ ] Firebase authentication works
- [ ] Email verification works
- [ ] Real-time updates work
- [ ] Voting functionality works
- [ ] All pages load without errors

## Post-Deployment

- [ ] Share the URL with stakeholders
- [ ] Set up custom domain (optional)
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up Firebase monitoring
- [ ] Document the deployment date and URL

## Continuous Deployment

Every time you push to GitHub, Vercel will automatically deploy:

```bash
git add .
git commit -m "Your changes"
git push
```

## Need Help?

Refer to `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.

---

**Deployment Date**: _______________

**Vercel URL**: _______________

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Completed
