# 🚀 Setup Email Verification - Quick Guide

## Current Status

✅ **Code is ready** - Email sending is already implemented
❌ **Configuration needed** - Your EmailJS credentials are missing

## What Happens When You Approve a Voter

The system is designed to:
1. ✅ Update voter status to "approved_pending_verification"
2. ✅ Generate a unique verification token
3. ✅ Create verification link (e.g., `http://localhost:5174/verify-email?token=abc123`)
4. ❌ **Send email to voter's Gmail** (not working - needs EmailJS setup)
5. ✅ Show verification link in success message (working as backup)

## Why Email Isn't Sending

Your `.env` file has placeholder values:
```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here  ❌
VITE_EMAILJS_TEMPLATE_APPROVAL=your_approval_template_id_here  ❌
VITE_EMAILJS_TEMPLATE_REJECTION=your_rejection_template_id_here  ❌
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here  ❌
```

These need to be replaced with **real values from EmailJS**.

---

## 5-Minute Setup Guide

### Step 1: Get EmailJS Credentials (2 minutes)

1. **Go to EmailJS Dashboard**: https://dashboard.emailjs.com/
2. **Login** (or create free account if you haven't)

3. **Get Service ID:**
   - Click "Email Services" in left menu
   - You should see your Gmail service
   - Copy the **Service ID** (looks like `service_abc123xyz`)
   - Write it down: `_________________`

4. **Get Template IDs:**
   - Click "Email Templates" in left menu
   - Find your **Approval** template
   - Copy the **Template ID** (looks like `template_def456uvw`)
   - Write it down: `_________________`
   - Find your **Rejection** template
   - Copy the **Template ID**
   - Write it down: `_________________`

5. **Get Public Key:**
   - Click "Account" in left menu
   - Click "API Keys" tab
   - Copy your **Public Key** (long alphanumeric string)
   - Write it down: `_________________`

### Step 2: Update .env File (1 minute)

1. Open `ntc-evoting/.env` in your editor
2. Replace the placeholder values with your real values:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_YOUR_ACTUAL_ID
VITE_EMAILJS_TEMPLATE_APPROVAL=template_YOUR_ACTUAL_ID
VITE_EMAILJS_TEMPLATE_REJECTION=template_YOUR_ACTUAL_ID
VITE_EMAILJS_PUBLIC_KEY=YOUR_ACTUAL_PUBLIC_KEY
```

3. Save the file

### Step 3: Fix EmailJS Template (1 minute)

**IMPORTANT:** Your template needs `{{to_email}}` in the settings!

1. Go to EmailJS Dashboard → Email Templates
2. Click on your **Approval** template
3. Click **"Settings"** tab
4. Find the **"To Email"** field
5. Enter: `{{to_email}}`
6. Click **"Save"**

### Step 4: Restart Dev Server (30 seconds)

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 5: Test It! (1 minute)

1. **Open diagnostic tool** in browser:
   ```
   ntc-evoting/CHECK_EMAILJS_CONFIG.html
   ```

2. **Click "Check Configuration"**
   - Should show all ✅ green checkmarks
   - If you see ❌ red X, your credentials are wrong

3. **Click "Test Email Send"**
   - Should see "✅ Email sent successfully!"
   - Check your Gmail inbox for test email

4. **Test full workflow:**
   - Go to admin → Manage Voters
   - Approve a pending voter
   - Check browser console (F12) - should see "Verification email sent successfully"
   - Check voter's Gmail - should receive approval email with verification link

---

## Email Template Requirements

Your EmailJS template **MUST** include these variables:

### In Template Settings:
- **To Email:** `{{to_email}}` ← **CRITICAL!**

### In Template HTML:
- `{{to_name}}` - Voter's name
- `{{verification_link}}` - The verification URL
- `{{expiration_date}}` - Account expiration date
- `{{from_name}}` - Sender name (optional)

### Example Template HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      background: #003366; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 4px; 
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Registration Approved!</h1>
    <p>Hello {{to_name}},</p>
    <p>Your voter registration has been approved by the administrator.</p>
    <p>Please verify your email address to complete your registration:</p>
    <p>
      <a href="{{verification_link}}" class="button">Verify Email Address</a>
    </p>
    <p>Or copy this link: {{verification_link}}</p>
    <p><strong>Account expires:</strong> {{expiration_date}}</p>
    <p>Best regards,<br>{{from_name}}</p>
  </div>
</body>
</html>
```

---

## Troubleshooting

### ❌ "Check Configuration" shows red X marks

**Problem:** Your `.env` still has placeholder values

**Solution:**
1. Double-check you copied the correct values from EmailJS
2. Make sure there are no extra spaces
3. Restart dev server after changes

### ❌ "Test Email Send" fails

**Common errors:**

**"The public key is required"**
→ Public key is wrong or missing

**"Service ID is invalid"**
→ Service ID is wrong

**"Template not found"**
→ Template ID is wrong

**"The 'to_email' variable is not defined"**
→ Template settings missing `{{to_email}}` in "To Email" field

**Solution:** Go back to EmailJS Dashboard and verify all values

### ❌ Test email works but approval email doesn't send

**Problem:** Template variables don't match

**Solution:**
1. Check template has all required variables
2. Make sure `{{to_email}}` is in "To Email" field (Settings tab)
3. Verify template HTML includes `{{to_name}}`, `{{verification_link}}`, `{{expiration_date}}`

### ❌ Email sends but voter doesn't receive it

**Possible causes:**
1. **Spam folder** - Check voter's spam/junk folder
2. **Wrong email** - Verify voter's email in Firestore
3. **EmailJS limit** - Check EmailJS Dashboard for monthly limit
4. **Gmail blocking** - Check EmailJS Dashboard → History for delivery status

---

## Quick Checklist

- [ ] EmailJS account created and verified
- [ ] Gmail service connected in EmailJS
- [ ] Approval template created with all variables
- [ ] Rejection template created
- [ ] Service ID copied to `.env`
- [ ] Template IDs copied to `.env`
- [ ] Public Key copied to `.env`
- [ ] Template has `{{to_email}}` in "To Email" field
- [ ] Dev server restarted
- [ ] `CHECK_EMAILJS_CONFIG.html` shows all ✅
- [ ] Test email sends successfully
- [ ] Approval email sends when approving voter

---

## What Happens After Setup

### When Admin Approves Voter:

1. ✅ Voter status updated to "approved_pending_verification"
2. ✅ Verification token generated
3. ✅ Token stored in Firestore `email_verifications` collection
4. ✅ **Email sent to voter's Gmail** with verification link
5. ✅ Success message shows verification link (as backup)

### When Voter Clicks Verification Link:

1. ✅ System validates token
2. ✅ Voter status updated to "registered"
3. ✅ Voter can now login
4. ✅ Success message: "Email verified successfully"

### Email Content:

```
Subject: Registration Approved - NTC E-Voting

Hello [Voter Name],

Your voter registration has been approved!

Click here to verify your email: [Verification Link]

Account expires: [Expiration Date]

Best regards,
NTC E-Voting System
```

---

## Important Notes

### Email is Optional
The system works even if email fails:
- Verification link is shown in admin success message
- Admin can copy and send link manually
- Voter can still verify using the link

### Token Expiry
- Verification tokens expire after 24 hours
- If expired, admin needs to approve voter again
- New token will be generated

### Security
- Each token is unique and random
- Tokens can only be used once
- Expired tokens are rejected
- All verification attempts are logged

---

## Need Help?

### Detailed Guides:
- `FIX_VERIFICATION_AND_EMAIL.md` - Complete troubleshooting
- `EMAILJS_TROUBLESHOOTING.md` - Email-specific issues
- `QUICK_CHECKLIST.md` - Quick reference

### Diagnostic Tools:
- `CHECK_EMAILJS_CONFIG.html` - Test your configuration
- Browser console (F12) - See error messages
- EmailJS Dashboard → History - See email delivery status

---

## Summary

Your email verification system is **already coded and ready**. You just need to:

1. ✅ Get your EmailJS credentials (5 minutes)
2. ✅ Update `.env` file
3. ✅ Add `{{to_email}}` to template settings
4. ✅ Restart dev server
5. ✅ Test it!

Once configured, voters will automatically receive verification emails when approved! 🎉
