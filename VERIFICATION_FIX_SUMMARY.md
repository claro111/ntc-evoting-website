# Email & Verification Fix Summary

## Current Status

✅ **Approval works** - Voter status updated, verification link generated
❌ **Email not sending** - No email received
❌ **Verification link fails** - "Invalid verification link" error

## Root Causes Identified

### 1. Email Not Sending
**Problem**: Your `.env` file still has placeholder values instead of actual EmailJS credentials.

**Current `.env` content:**
```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_APPROVAL=your_approval_template_id_here
VITE_EMAILJS_TEMPLATE_REJECTION=your_rejection_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**What it should look like:**
```env
VITE_EMAILJS_SERVICE_ID=service_abc123xyz
VITE_EMAILJS_TEMPLATE_APPROVAL=template_def456uvw
VITE_EMAILJS_TEMPLATE_REJECTION=template_ghi789rst
VITE_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOpQr
```

### 2. Verification Link Failing
**Problem**: The Firestore rules need to be deployed to Firebase.

Even though we created permissive rules in `firestore.rules`, they're only on your local machine. Firebase is still using the old secure rules that block the verification token lookup.

## Fix Steps

### STEP 1: Update .env with Real EmailJS Credentials

1. Open [EmailJS Dashboard](https://dashboard.emailjs.com/)

2. **Get Service ID:**
   - Click "Email Services" in left menu
   - Copy the Service ID (starts with `service_`)
   
3. **Get Template IDs:**
   - Click "Email Templates" in left menu
   - Find your Approval template → Copy Template ID (starts with `template_`)
   - Find your Rejection template → Copy Template ID (starts with `template_`)

4. **Get Public Key:**
   - Click "Account" in left menu
   - Click "API Keys" tab
   - Copy your Public Key (long string, no prefix)

5. **Update your `.env` file** with the real values:
   ```env
   VITE_EMAILJS_SERVICE_ID=service_YOUR_ACTUAL_ID
   VITE_EMAILJS_TEMPLATE_APPROVAL=template_YOUR_ACTUAL_ID
   VITE_EMAILJS_TEMPLATE_REJECTION=template_YOUR_ACTUAL_ID
   VITE_EMAILJS_PUBLIC_KEY=YOUR_ACTUAL_PUBLIC_KEY
   ```

6. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

### STEP 2: Deploy Firestore Rules

You have two options:

**Option A: Using Firebase CLI (Recommended)**
```bash
cd ntc-evoting
firebase deploy --only firestore:rules
```

**Option B: Using Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ntc-evoting-website`
3. Click "Firestore Database" in left menu
4. Click "Rules" tab at top
5. Replace ALL content with this:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY PERMISSIVE RULES FOR TESTING
    // TODO: Restore secure rules from firestore.rules.backup after testing
    
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Click "Publish" button

### STEP 3: Fix EmailJS Template Variables

Your email template needs these exact variables in the "To Email" field:

1. Go to EmailJS Dashboard → Email Templates
2. Click on your Approval template
3. Click "Settings" tab
4. In the **"To Email"** field, enter: `{{to_email}}`
5. Save the template

The template HTML should include:
- `{{to_email}}` - Recipient email (in Settings, not HTML)
- `{{to_name}}` - Recipient name
- `{{verification_link}}` - The verification URL
- `{{expiration_date}}` - Account expiration date
- `{{from_name}}` - Sender name (optional)

### STEP 4: Test Everything

1. **Test Email Sending:**
   - Go to admin page
   - Open browser console (F12)
   - Approve a voter
   - Check console for errors
   - Check your Gmail inbox

2. **Test Verification Link:**
   - Copy the verification link from the success message
   - Open it in a new browser tab
   - Should see "Email verified successfully"

## Verification Checklist

- [ ] `.env` updated with real EmailJS credentials (not placeholders)
- [ ] Dev server restarted after `.env` changes
- [ ] Firestore rules deployed to Firebase
- [ ] EmailJS template has `{{to_email}}` in "To Email" field
- [ ] EmailJS template HTML includes all required variables
- [ ] Browser console checked for specific errors (F12)
- [ ] Test approval shows no errors in console
- [ ] Email received in Gmail inbox
- [ ] Verification link works when clicked

## Expected Behavior After Fix

1. **Approve voter** → Success message with verification link
2. **Check console** → "Verification email sent successfully"
3. **Check Gmail** → Email received with verification link
4. **Click link** → "Email verified successfully"
5. **Check Firestore** → Voter status = "registered"

## Troubleshooting

### If email still doesn't send:
1. Check browser console (F12) for the exact error message
2. Verify all `.env` values are correct (no typos)
3. Check EmailJS Dashboard → History for failed attempts
4. Make sure EmailJS account is verified (check your email)
5. Test email directly in EmailJS Dashboard

### If verification link still fails:
1. Confirm Firestore rules were deployed (check Firebase Console)
2. Check browser console for specific error
3. Verify the token exists in `email_verifications` collection
4. Make sure you're logged in when clicking the link

## Important Notes

- **Email is optional** - The system works even if email fails. The verification link is shown in the success message.
- **Temporary rules** - The current Firestore rules are permissive for testing. After everything works, restore secure rules from `firestore.rules.backup`.
- **Token expiry** - Verification tokens expire after 24 hours.

## Need Help?

If you're still having issues:
1. Copy the exact error from browser console (F12)
2. Check what the error says specifically
3. Verify your EmailJS credentials are correct
4. Make sure Firestore rules are deployed
