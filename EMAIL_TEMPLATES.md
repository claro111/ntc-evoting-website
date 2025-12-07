# EmailJS Template Creation Guide

Follow these steps to create your email templates in EmailJS.

## Step 1: Login to EmailJS

1. Go to https://dashboard.emailjs.com/
2. Login with your account
3. Click on "Email Templates" in the left sidebar

---

## Template 1: Voter Approval Email

### Template Settings:
- **Template Name:** `Voter Approval`
- **Template ID:** (will be auto-generated, copy this!)

### Subject Line:
```
NTC E-Voting - Verify Your Email Address
```

### Content (Copy and paste this EXACTLY):

```
Hello {{to_name}},

Your voter registration has been approved by the administrator!

Please verify your email address to complete your registration by clicking the link below:

{{verification_link}}

Important Information:
• Your account will expire on {{expiration_date}}
• This verification link will expire in 24 hours
• If you did not register for NTC E-Voting, please ignore this email

Thank you for registering!

---
NTC E-Voting System
Northern Technological College
```

### Template Variables to Configure:
In EmailJS, you'll see these variables on the right side. Make sure they match:

- `to_name` - Voter's full name
- `to_email` - Voter's email (auto-filled by EmailJS)
- `verification_link` - Link to verify email
- `expiration_date` - Account expiration date
- `from_name` - "NTC E-Voting System"

### How to Create This Template:

1. Click "Create New Template"
2. In the "Template Name" field, type: `Voter Approval`
3. In the "Subject" field, paste the subject line above
4. In the "Content" field, paste the content above
5. Click "Save"
6. **IMPORTANT:** Copy the Template ID (looks like `template_xxxxxxx`)
7. Save this ID - you'll need it for your `.env` file

---

## Template 2: Voter Rejection Email

### Template Settings:
- **Template Name:** `Voter Rejection`
- **Template ID:** (will be auto-generated, copy this!)

### Subject Line:
```
NTC E-Voting - Registration Status Update
```

### Content (Copy and paste this EXACTLY):

```
Hello {{to_name}},

We regret to inform you that your voter registration for NTC E-Voting has not been approved at this time.

Reason: {{rejection_reason}}

If you believe this is an error or have questions about your registration, please contact the administrator at the NTC office.

You may resubmit your registration after addressing the issues mentioned above.

Thank you for your understanding.

---
NTC E-Voting System
Northern Technological College
```

### Template Variables to Configure:
- `to_name` - Voter's full name
- `to_email` - Voter's email (auto-filled by EmailJS)
- `rejection_reason` - Reason for rejection
- `from_name` - "NTC E-Voting System"

### How to Create This Template:

1. Click "Create New Template" again
2. In the "Template Name" field, type: `Voter Rejection`
3. In the "Subject" field, paste the subject line above
4. In the "Content" field, paste the content above
5. Click "Save"
6. **IMPORTANT:** Copy the Template ID (looks like `template_xxxxxxx`)
7. Save this ID - you'll need it for your `.env` file

---

## Step 2: Test Your Templates

After creating both templates, you can test them:

1. Click on a template
2. Click "Test It" button
3. Fill in sample values:
   - `to_name`: Your Name
   - `to_email`: your-email@example.com
   - `verification_link`: http://localhost:5173/verify-email?token=test123
   - `expiration_date`: December 31, 2025
   - `rejection_reason`: Test rejection reason
4. Click "Send Test"
5. Check your email inbox (and spam folder!)

---

## Step 3: Update Your .env File

After creating both templates, open `ntc-evoting/.env` and add:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_APPROVAL=template_xxxxxxx
VITE_EMAILJS_TEMPLATE_REJECTION=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

Replace:
- `service_xxxxxxx` - Your Service ID from Step 2 of EMAILJS_SETUP.md
- First `template_xxxxxxx` - Your Approval Template ID
- Second `template_xxxxxxx` - Your Rejection Template ID
- `xxxxxxxxxxxxxxxx` - Your Public Key from Step 4 of EMAILJS_SETUP.md

---

## Step 4: Restart Your Dev Server

After updating `.env`:

```bash
# Stop your current dev server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Visual Guide for Template Creation

### Where to Find Template Settings:

```
EmailJS Dashboard
├── Email Templates (left sidebar)
│   ├── Create New Template (button)
│   │   ├── Template Name: [Enter name here]
│   │   ├── Subject: [Enter subject here]
│   │   ├── Content: [Paste content here]
│   │   └── Variables (right panel):
│   │       ├── to_name
│   │       ├── to_email
│   │       ├── verification_link (for approval)
│   │       ├── expiration_date (for approval)
│   │       ├── rejection_reason (for rejection)
│   │       └── from_name
│   └── Save (button)
└── Copy Template ID after saving!
```

---

## Troubleshooting

### Template Variables Not Working?

Make sure the variable names in your template EXACTLY match:
- `{{to_name}}` - with double curly braces
- `{{to_email}}` - lowercase, underscore
- `{{verification_link}}` - lowercase, underscore
- `{{expiration_date}}` - lowercase, underscore
- `{{rejection_reason}}` - lowercase, underscore

### Emails Going to Spam?

1. Send a test email to yourself
2. Mark it as "Not Spam"
3. Add EmailJS to your contacts
4. This trains Gmail to trust these emails

### Can't Find Template ID?

1. Go to Email Templates
2. Click on your template
3. Look at the URL: `https://dashboard.emailjs.com/admin/templates/template_xxxxxxx`
4. The `template_xxxxxxx` part is your Template ID

---

## Quick Checklist

- [ ] Created "Voter Approval" template
- [ ] Copied Approval Template ID
- [ ] Created "Voter Rejection" template
- [ ] Copied Rejection Template ID
- [ ] Tested both templates
- [ ] Updated `.env` file with all IDs
- [ ] Restarted dev server
- [ ] Ready to test in the app!

---

## Next Steps

Once your templates are created and `.env` is updated:

1. Start your dev server: `npm run dev`
2. Login as admin
3. Go to "Manage Voters"
4. Click "Review" on a pending voter
5. Set expiration date and click "Approve"
6. Check the voter's email inbox!

The email should arrive within seconds. If not, check:
- EmailJS Dashboard → History (to see if email was sent)
- Browser console (F12) for any errors
- Spam folder in email

---

## Need Help?

If you get stuck:
1. Check EmailJS Dashboard → History for error messages
2. Check browser console (F12) for JavaScript errors
3. Verify all IDs in `.env` are correct
4. Make sure you restarted the dev server after changing `.env`

Good luck! 🚀
