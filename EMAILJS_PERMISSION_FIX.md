# Fix: Gmail API Insufficient Authentication Scopes

## ❌ Error You're Seeing:
```
412 Gmail_API: Request had insufficient authentication scopes.
```

This means your Gmail connection to EmailJS doesn't have permission to send emails.

---

## ✅ Solution: Reconnect Your Gmail Account

### Step 1: Remove Current Gmail Connection

1. Go to https://dashboard.emailjs.com/
2. Click **"Email Services"** (left sidebar)
3. Find your Gmail service
4. Click the **trash/delete icon** or **"Remove"** button
5. Confirm deletion

### Step 2: Add Gmail Service Again (With Correct Permissions)

1. Still in **"Email Services"**, click **"Add New Service"**
2. Select **"Gmail"**
3. Click **"Connect Account"**
4. **IMPORTANT:** Sign in with your Gmail (422004488@ntc.edu.ph)
5. **CRITICAL STEP:** When Google asks for permissions, you'll see a screen like:

```
EmailJS wants to:
☐ Read, compose, send, and permanently delete all your email from Gmail
☐ See your primary Google Account email address
```

6. **CHECK ALL BOXES** - EmailJS needs full Gmail permissions to send emails
7. Click **"Allow"** or **"Continue"**
8. Give it a name: "NTC E-Voting Gmail"
9. Click **"Create Service"**
10. **Copy the new Service ID** (it will be different from before!)

### Step 3: Update Your .env File

Your Service ID has changed! Update your `.env` file:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx  ← NEW Service ID here!
VITE_EMAILJS_TEMPLATE_APPROVAL=template_d2j48s2
VITE_EMAILJS_TEMPLATE_REJECTION=template_7ksubrz
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Step 4: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 5: Test Again

1. Login as admin
2. Go to "Manage Voters"
3. Approve a voter
4. Email should send successfully! ✅

---

## 🔍 Why This Happened

When you first connected Gmail to EmailJS, you might have:
- Denied some permissions
- Only granted "read" access instead of "send" access
- The connection expired or was revoked

By reconnecting and granting **all permissions**, EmailJS can now send emails on your behalf.

---

## ⚠️ Alternative: Use a Different Email Service

If Gmail keeps giving you trouble, you can use a different email service:

### Option 1: Use Personal Gmail (Recommended)

Instead of your school email (422004488@ntc.edu.ph), try:
1. Use your personal Gmail account
2. Connect it to EmailJS
3. Emails will come from your personal Gmail
4. Still works perfectly!

### Option 2: Use Outlook/Hotmail

1. In EmailJS, click "Add New Service"
2. Select "Outlook" instead of Gmail
3. Connect your Outlook/Hotmail account
4. Follow the same steps

---

## 🧪 How to Test If It's Fixed

After reconnecting:

1. Go to EmailJS Dashboard → **"Email Templates"**
2. Click on your **Approval template**
3. Click **"Test It"** button
4. Fill in test values:
   - `to_name`: Test User
   - `to_email`: your-email@gmail.com
   - `verification_link`: http://test.com
   - `expiration_date`: Dec 31, 2025
5. Click **"Send Test"**
6. Check your email inbox

If the test email arrives, your connection is fixed! ✅

---

## 📋 Checklist

- [ ] Deleted old Gmail service from EmailJS
- [ ] Added Gmail service again
- [ ] Granted ALL permissions when Google asked
- [ ] Copied new Service ID
- [ ] Updated `.env` file with new Service ID
- [ ] Restarted dev server
- [ ] Tested sending email from EmailJS dashboard
- [ ] Tested approving voter in your app

---

## 🆘 Still Not Working?

### Check Google Account Permissions

1. Go to https://myaccount.google.com/permissions
2. Look for "EmailJS"
3. Make sure it has these permissions:
   - ✅ Read, compose, send, and permanently delete all your email from Gmail
   - ✅ See your primary Google Account email address

If EmailJS is not listed or has limited permissions:
- Remove it from Google permissions
- Go back to EmailJS and reconnect Gmail
- Grant all permissions this time

### Check Gmail Settings

1. Go to Gmail → Settings (gear icon) → "See all settings"
2. Click "Forwarding and POP/IMAP" tab
3. Make sure **IMAP is enabled**
4. Click "Save Changes"

---

## 💡 Pro Tip

If you're still having issues with your school Gmail (422004488@ntc.edu.ph), it might be because:
- School email has restricted permissions
- IT department blocks third-party apps
- Account has 2FA or security restrictions

**Solution:** Use a personal Gmail account for EmailJS instead. The emails will still look professional with your templates!

---

## 🎯 Quick Fix Summary

1. **Delete** old Gmail service in EmailJS
2. **Add** Gmail service again
3. **Grant ALL permissions** when Google asks
4. **Copy** new Service ID
5. **Update** `.env` file
6. **Restart** dev server
7. **Test** it!

Good luck! Let me know if you need more help! 🚀
