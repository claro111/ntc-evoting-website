# EmailJS Troubleshooting Guide

## Problem: Emails Not Sending

The approval works but emails aren't being sent. Here's how to fix it:

## Step 1: Check Browser Console for Errors

1. Open your admin page
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Approve a voter
5. Look for error messages (usually in red)

## Common Errors and Solutions

### Error: "The public key is required"
**Solution**: Your Public Key is missing or incorrect
- Go to EmailJS Dashboard → Account → API Keys
- Copy your Public Key
- Update `.env`: `VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key`
- Restart dev server

### Error: "Service ID is invalid"
**Solution**: Your Service ID is wrong
- Go to EmailJS Dashboard → Email Services
- Copy the Service ID (looks like `service_abc123`)
- Update `.env`: `VITE_EMAILJS_SERVICE_ID=service_abc123`
- Restart dev server

### Error: "Template ID is invalid" or "Template not found"
**Solution**: Your Template ID is wrong
- Go to EmailJS Dashboard → Email Templates
- Find your Approval template
- Copy the Template ID (looks like `template_abc123`)
- Update `.env`: `VITE_EMAILJS_TEMPLATE_APPROVAL=template_abc123`
- Restart dev server

### Error: "The 'to_email' variable is not defined"
**Solution**: Your email template is missing required variables

Your template MUST have these exact variable names:
```
{{to_email}}
{{to_name}}
{{verification_link}}
{{expiration_date}}
{{from_name}}
```

**Fix it:**
1. Go to EmailJS Dashboard → Email Templates
2. Edit your Approval template
3. Make sure the template content includes all variables above
4. Example template:
```
Hello {{to_name}},

Your registration has been approved!

Click here to verify: {{verification_link}}

Expires: {{expiration_date}}

Best regards,
{{from_name}}
```
5. Save the template

### Error: "Failed to send email" (generic)
**Possible causes:**
1. **EmailJS account not verified** - Check your email for verification link
2. **Gmail not connected** - Reconnect your Gmail in EmailJS Dashboard
3. **Monthly limit reached** - EmailJS free tier has limits (check dashboard)
4. **Template variables mismatch** - See above

## Step 2: Verify Your .env File

Open `ntc-evoting/.env` and check:

```env
# These should NOT be placeholders!
VITE_EMAILJS_SERVICE_ID=service_XXXXX  # Should start with "service_"
VITE_EMAILJS_TEMPLATE_APPROVAL=template_XXXXX  # Should start with "template_"
VITE_EMAILJS_TEMPLATE_REJECTION=template_XXXXX  # Should start with "template_"
VITE_EMAILJS_PUBLIC_KEY=XXXXXXXXXX  # Long string, no prefix
```

If any still say `your_service_id_here` or similar, you need to replace them with real values from EmailJS!

## Step 3: Test EmailJS Directly

Create a test file to verify EmailJS works:

1. Go to EmailJS Dashboard
2. Click on your template
3. Click "Test it" button
4. Fill in test values
5. Click "Send test email"
6. Check if you receive the email

If the test email works, the problem is in your `.env` configuration.
If the test email doesn't work, there's an issue with your EmailJS setup.

## Step 4: Check EmailJS Dashboard

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Check **"History"** tab - do you see any failed attempts?
3. Click on failed attempts to see error details

## Step 5: Restart Dev Server

After ANY changes to `.env`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Quick Checklist

- [ ] EmailJS account created and verified
- [ ] Gmail service connected in EmailJS
- [ ] Approval template created with correct variables
- [ ] Rejection template created with correct variables
- [ ] Service ID copied to `.env`
- [ ] Template IDs copied to `.env`
- [ ] Public Key copied to `.env`
- [ ] Dev server restarted after `.env` changes
- [ ] Browser console checked for specific errors

## Still Not Working?

1. **Copy the exact error message** from browser console (F12)
2. **Check EmailJS Dashboard → History** for failed attempts
3. **Verify template variable names** match exactly (case-sensitive!)
4. **Try the test email** in EmailJS Dashboard

## For Testing Without Email

If you want to test the system without email working:
- The approval still works
- The verification link is shown in the success message
- Copy the link and open it manually to verify the voter

The system is designed to work even if email fails!
