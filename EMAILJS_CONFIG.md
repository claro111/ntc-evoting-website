# EmailJS Configuration - Quick Setup

## ✅ Your Template IDs

You've successfully created your email templates! Here are your Template IDs:

- **Approval Template ID:** `template_d2j48s2`
- **Rejection Template ID:** `template_7ksubrz`

---

## 📝 Next Steps

### Step 1: Get Your Service ID and Public Key

You still need two more values from EmailJS:

#### A. Get Service ID:
1. Go to https://dashboard.emailjs.com/
2. Click "Email Services" in the left sidebar
3. You should see your Gmail service (the one you connected)
4. Copy the **Service ID** (looks like: `service_xxxxxxx`)

#### B. Get Public Key:
1. In EmailJS Dashboard, click your email/profile (top right)
2. Click "Account"
3. Scroll to "API Keys" section
4. Copy your **Public Key** (looks like: `xxxxxxxxxxxxxxxx`)

---

### Step 2: Update Your .env File

Open `ntc-evoting/.env` and add these values:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_APPROVAL=template_d2j48s2
VITE_EMAILJS_TEMPLATE_REJECTION=template_7ksubrz
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

**Replace:**
- `service_xxxxxxx` with your actual Service ID
- `xxxxxxxxxxxxxxxx` with your actual Public Key
- Template IDs are already filled in! ✅

---

### Step 3: Restart Your Dev Server

After updating `.env`:

```bash
# Stop your current dev server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

**Important:** You MUST restart the dev server after changing `.env` file!

---

## 🧪 Step 4: Test the Email System

1. Start your dev server: `npm run dev`
2. Open http://localhost:5173
3. Login as admin
4. Go to "Manage Voters"
5. Click "Review" on a pending voter
6. Set an expiration date
7. Click "Approve"
8. Check the voter's email inbox!

---

## 📋 Configuration Checklist

- [x] Created Approval Template (`template_d2j48s2`)
- [x] Created Rejection Template (`template_7ksubrz`)
- [ ] Got Service ID from EmailJS
- [ ] Got Public Key from EmailJS
- [ ] Updated `.env` file
- [ ] Restarted dev server
- [ ] Tested approval email
- [ ] Tested rejection email

---

## 🔍 Where to Find Your IDs

### Service ID Location:
```
EmailJS Dashboard
└── Email Services (left sidebar)
    └── Your Gmail Service
        └── Service ID: service_xxxxxxx (copy this!)
```

### Public Key Location:
```
EmailJS Dashboard
└── Click your email (top right)
    └── Account
        └── API Keys section
            └── Public Key: xxxxxxxxxxxxxxxx (copy this!)
```

---

## ⚠️ Troubleshooting

### Emails Not Sending?

1. **Check Browser Console (F12)**
   - Look for EmailJS errors
   - Common error: "Invalid public key" means you need to update `.env`

2. **Check EmailJS Dashboard**
   - Go to https://dashboard.emailjs.com/
   - Click "History" tab
   - See if emails were sent or if there are errors

3. **Verify .env File**
   - Make sure all 4 values are filled in
   - No quotes around values
   - No spaces before or after values
   - File is named exactly `.env` (not `.env.txt`)

4. **Did You Restart Dev Server?**
   - Changes to `.env` only take effect after restart
   - Stop server (Ctrl+C) and run `npm run dev` again

### Emails Going to Spam?

- Check spam/junk folder
- Mark as "Not Spam"
- Add sender to contacts

---

## 📧 Your Email Template Preview

### Approval Email Features:
- ✅ NTC branding (blue and yellow)
- ✅ Green checkmark icon
- ✅ Big "Verify Email Address" button
- ✅ Important info highlighted in yellow box
- ✅ Expiration date shown
- ✅ Professional footer

### Rejection Email Features:
- ✅ NTC branding (blue and yellow)
- ✅ Info icon
- ✅ Rejection reason in red box
- ✅ Next steps in blue box
- ✅ Professional and respectful tone
- ✅ Professional footer

---

## 🎉 Once Everything is Set Up

Your email system will:
- ✅ Send professional HTML emails
- ✅ Work immediately (no deployment needed)
- ✅ Be completely free (200 emails/month)
- ✅ Include clickable verification links
- ✅ Match your NTC branding

---

## 📞 Need Help?

If you're stuck on getting the Service ID or Public Key, just ask and I'll guide you through it step by step!

Good luck! 🚀
