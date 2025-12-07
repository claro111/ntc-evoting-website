# 🚀 Start Deployment Now!

## Step 1: Push to GitHub

Open your terminal and run these commands:

```bash
cd ntc-evoting

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"
```

Now go to [GitHub](https://github.com/new) and create a new repository called `ntc-evoting-system`.

Then run:

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/ntc-evoting-system.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or login (use GitHub login)
3. Click "Add New..." → "Project"
4. Select your `ntc-evoting-system` repository
5. Click "Import"

## Step 3: Add Environment Variables

In the Vercel project setup, add these 10 variables:

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

**Important**: Select "Production", "Preview", AND "Development" for each variable!

## Step 4: Deploy

Click "Deploy" and wait 2-5 minutes.

## Step 5: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/project/ntc-evoting-website)
2. Go to Authentication → Settings → Authorized domains
3. Add your Vercel URL (e.g., `ntc-evoting-system.vercel.app`)
4. Click "Add"

## Done! 🎉

Your site is now live! Test it at your Vercel URL.

---

**Need more details?** Read `VERCEL_DEPLOYMENT_GUIDE.md`
