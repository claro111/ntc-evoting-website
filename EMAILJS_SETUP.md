# EmailJS Setup Guide

This guide will help you set up EmailJS for sending verification and rejection emails in the NTC E-Voting system.

## Why EmailJS?

- ✅ **100% Free** - 200 emails/month on free plan
- ✅ **No Credit Card Required**
- ✅ **No Backend Needed** - Works directly from frontend
- ✅ **Easy Setup** - 5-10 minutes

## Step-by-Step Setup

### 1. Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" (top right)
3. Sign up with your Gmail account (422004488@ntc.edu.ph)
4. Verify your email address

### 2. Add Email Service

1. After logging in, click "Add New Service"
2. Select "Gmail"
3. Click "Connect Account"
4. Sign in with your Gmail (422004488@ntc.edu.ph)
5. Allow EmailJS to send emails on your behalf
6. Give it a Service Name: "NTC E-Voting"
7. Copy the **Service ID** (looks like: `service_xxxxxxx`)
8. Click "Create Service"

### 3. Create Email Templates

#### Template 1: Approval Email

1. Go to "Email Templates" tab
2. Click "Create New Template"
3. Template Name: "Voter Approval"
4. **Subject:** `NTC E-Voting - Verify Your Email Address`
5. **Content:**

```html
Hello {{to_name}},

Your voter registration has been approved by the administrator!

Please verify your email address to complete your registration:

{{verification_link}}

Important: Your account will expire on {{expiration_date}}.

Note: This verification link will expire in 24 hours.

If you did not register for NTC E-Voting, please ignore this email.

---
NTC E-Voting System
```

6. Click "Save"
7. Copy the **Template ID** (looks like: `template_xxxxxxx`)

#### Template 2: Rejection Email

1. Click "Create New Template" again
2. Template Name: "Voter Rejection"
3. **Subject:** `NTC E-Voting - Registration Status Update`
4. **Content:**

```html
Hello {{to_name}},

We regret to inform you that your voter registration for NTC E-Voting has not been approved at this time.

Reason: {{rejection_reason}}

If you believe this is an error or have questions, please contact the administrator.

Thank you for your understanding.

---
NTC E-Voting System
```

5. Click "Save"
6. Copy the **Template ID** (looks like: `template_xxxxxxx`)

### 4. Get Your Public Key

1. Go to "Account" tab (top right, click your email)
2. Find "API Keys" section
3. Copy your **Public Key** (looks like: `xxxxxxxxxxxxxxxx`)

### 5. Update Your .env File

Open `ntc-evoting/.env` and add these values:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_APPROVAL=template_xxxxxxx
VITE_EMAILJS_TEMPLATE_REJECTION=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

Replace the `xxxxxxx` with your actual IDs from EmailJS.

### 6. Test the Setup

1. Restart your development server:
```bash
npm run dev
```

2. Login as admin
3. Go to "Manage Voters"
4. Click "Review" on a pending voter
5. Set expiration date and click "Approve"
6. Check the voter's email inbox for the verification email

## Email Template Variables

### Approval Email Variables:
- `{{to_name}}` - Voter's full name
- `{{to_email}}` - Voter's email (auto-filled by EmailJS)
- `{{verification_link}}` - Link to verify email
- `{{expiration_date}}` - Account expiration date
- `{{from_name}}` - "NTC E-Voting System"

### Rejection Email Variables:
- `{{to_name}}` - Voter's full name
- `{{to_email}}` - Voter's email (auto-filled by EmailJS)
- `{{rejection_reason}}` - Reason for rejection
- `{{from_name}}` - "NTC E-Voting System"

## Troubleshooting

### Emails not sending?

1. **Check EmailJS Dashboard**
   - Go to https://dashboard.emailjs.com/
   - Check "History" tab to see if emails were sent
   - Look for error messages

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for EmailJS errors in console

3. **Verify Configuration**
   - Make sure all IDs in `.env` are correct
   - Restart dev server after changing `.env`

4. **Check Spam Folder**
   - Verification emails might go to spam
   - Mark as "Not Spam" to train Gmail

### Gmail Blocking Emails?

If Gmail blocks EmailJS:
1. Go to Gmail Settings → Filters and Blocked Addresses
2. Make sure EmailJS is not blocked
3. Check "Less secure app access" (though EmailJS uses OAuth)

### Rate Limits

Free plan limits:
- 200 emails/month
- 2 emails/second

If you exceed limits:
- Upgrade to paid plan ($7/month for 1000 emails)
- Or use multiple EmailJS accounts

## Security Notes

⚠️ **Important:**
- EmailJS Public Key is safe to expose in frontend
- Never commit `.env` file to Git (it's in `.gitignore`)
- EmailJS automatically prevents spam/abuse

## Cost

- **Free Plan:** 200 emails/month (perfect for testing)
- **Personal Plan:** $7/month for 1,000 emails
- **Professional Plan:** $15/month for 5,000 emails

For a school election with ~500 voters:
- Approval emails: ~500
- Rejection emails: ~50
- **Total: ~550 emails** (need Personal plan for production)

## Alternative: Upgrade for Production

For the actual election, consider:
1. Upgrade to Personal plan ($7/month)
2. Or use multiple free accounts (not recommended)
3. Or switch to Firebase Blaze + Cloud Functions (more professional)

## Support

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com
- Dashboard: https://dashboard.emailjs.com/

## Next Steps

After setup:
1. Test approval email
2. Test rejection email
3. Test email verification link
4. Check spam folder
5. Ready for production!
