# 🔧 Complete Fix: Email Sending & Verification Link

## Current Issues

1. ❌ **Email not sending** - Approval works but no email received
2. ❌ **Verification link fails** - "Invalid verification link" error

## Quick Diagnosis

Open this file in your browser to check your configuration:
```
ntc-evoting/CHECK_EMAILJS_CONFIG.html
```

This will tell you exactly what's wrong with your EmailJS setup.

---

## Fix #1: Update EmailJS Credentials in .env

### Problem
Your `.env` file has placeholder values instead of real EmailJS credentials.

### Solution

1. **Open EmailJS Dashboard**: https://dashboard.emailjs.com/

2. **Get Service ID:**
   - Click "Email Services" in left sidebar
   - You should see your Gmail service
   - Copy the **Service ID** (looks like `service_abc123xyz`)

3. **Get Template IDs:**
   - Click "Email Templates" in left sidebar
   - Find your **Approval** template
   - Copy the **Template ID** (looks like `template_def456uvw`)
   - Find your **Rejection** template  
   - Copy the **Template ID** (looks like `template_ghi789rst`)

4. **Get Public Key:**
   - Click "Account" in left sidebar
   - Click "API Keys" tab
   - Copy your **Public Key** (long alphanumeric string)

5. **Update `.env` file:**

Open `ntc-evoting/.env` and replace the placeholder values:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_YOUR_ACTUAL_ID_HERE
VITE_EMAILJS_TEMPLATE_APPROVAL=template_YOUR_ACTUAL_ID_HERE
VITE_EMAILJS_TEMPLATE_REJECTION=template_YOUR_ACTUAL_ID_HERE
VITE_EMAILJS_PUBLIC_KEY=YOUR_ACTUAL_PUBLIC_KEY_HERE
```

**Example of what it should look like:**
```env
VITE_EMAILJS_SERVICE_ID=service_8x9y2z3
VITE_EMAILJS_TEMPLATE_APPROVAL=template_4a5b6c7
VITE_EMAILJS_TEMPLATE_REJECTION=template_8d9e0f1
VITE_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOpQr
```

6. **Restart dev server:**
```bash
# Press Ctrl+C to stop the server
npm run dev
```

---

## Fix #2: Update EmailJS Template Settings

### Problem
Your email template is missing the `{{to_email}}` variable in the "To Email" field.

### Solution

1. Go to EmailJS Dashboard → Email Templates
2. Click on your **Approval** template
3. Click the **"Settings"** tab
4. Find the **"To Email"** field
5. Enter: `{{to_email}}`
6. Click **"Save"**

### Verify Template Variables

Make sure your template HTML includes these variables:
- `{{to_name}}` - Recipient's name
- `{{verification_link}}` - The verification URL
- `{{expiration_date}}` - Account expiration date
- `{{from_name}}` - Sender name (optional)

**Your template should look something like this:**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Your beautiful styling here */
  </style>
</head>
<body>
  <div class="container">
    <h1>Registration Approved!</h1>
    <p>Hello {{to_name}},</p>
    <p>Your registration has been approved.</p>
    <a href="{{verification_link}}">Verify Your Email</a>
    <p>Expires: {{expiration_date}}</p>
  </div>
</body>
</html>
```

---

## Fix #3: Deploy Firestore Rules

### Problem
The Firestore rules on your local machine are not deployed to Firebase, so the database is still using the old secure rules that block verification token lookups.

### Solution - Option A: Using Firebase CLI (Recommended)

```bash
cd ntc-evoting
firebase deploy --only firestore:rules
```

You should see:
```
✔  Deploy complete!
```

### Solution - Option B: Using Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: **ntc-evoting-website**
3. Click **"Firestore Database"** in left menu
4. Click **"Rules"** tab at the top
5. Delete ALL existing content
6. Paste this:

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

7. Click **"Publish"** button
8. Confirm the deployment

---

## Testing Everything

### Step 1: Check Configuration

1. Open in browser: `ntc-evoting/CHECK_EMAILJS_CONFIG.html`
2. Click "Check Configuration"
3. All items should show ✅ green checkmarks
4. If any show ❌ red X, follow the instructions to fix

### Step 2: Test Email Sending

1. In the same page, click "Test Email Send"
2. Should see "✅ Email sent successfully!"
3. Check the email inbox configured in EmailJS
4. You should receive a test email

### Step 3: Test Full Workflow

1. **Register a new voter account:**
   - Go to http://localhost:5174/register
   - Fill in the form with a real email you can access
   - Submit registration

2. **Approve the voter (as admin):**
   - Login as admin
   - Go to Manage Voters
   - Find the pending voter
   - Click "Review"
   - Set expiration date
   - Click "Approve"

3. **Check for success:**
   - Should see: "Voter approved successfully. Verification link: ..."
   - Open browser console (F12)
   - Should see: "Verification email sent successfully"
   - Check your Gmail inbox
   - Should receive the approval email

4. **Verify email:**
   - Click the verification link in the email
   - OR copy the link from the success message
   - Should see: "Email verified successfully"

5. **Verify in Firestore:**
   - Go to Firebase Console → Firestore Database
   - Open `voters` collection
   - Find the voter document
   - Status should be: `registered`
   - `emailVerified` should be: `true`

---

## Troubleshooting

### Email still not sending?

1. **Check browser console (F12)** for the exact error message
2. **Check EmailJS Dashboard → History** for failed attempts
3. **Verify .env values** are correct (no typos, no placeholders)
4. **Restart dev server** after any .env changes
5. **Check EmailJS account** is verified (check your email for verification link)
6. **Test directly in EmailJS** Dashboard using the "Test it" button

### Verification link still failing?

1. **Confirm Firestore rules deployed:**
   - Go to Firebase Console → Firestore Database → Rules
   - Should see the permissive rules (match /{document=**})
   
2. **Check browser console** when clicking the link for specific error

3. **Verify token exists:**
   - Go to Firebase Console → Firestore Database
   - Check `email_verifications` collection
   - Should see a document with your token

4. **Make sure you're logged in** when clicking the verification link

### Common Error Messages

**"The public key is required"**
→ Public key is missing or wrong in .env

**"Service ID is invalid"**
→ Service ID is wrong in .env

**"Template not found"**
→ Template ID is wrong in .env

**"The 'to_email' variable is not defined"**
→ Template settings missing {{to_email}} in "To Email" field

**"Invalid verification link"**
→ Firestore rules not deployed to Firebase

**"Token has expired"**
→ Token is older than 24 hours, approve the voter again

**"Token has already been used"**
→ This token was already used, approve the voter again

---

## Important Notes

### Email is Optional
The system is designed to work even if email fails:
- Approval still updates voter status
- Verification link is shown in the success message
- You can copy and use the link manually

### Temporary Rules
The current Firestore rules are **permissive for testing only**. After everything works:
1. Copy content from `firestore.rules.backup`
2. Paste into `firestore.rules`
3. Deploy: `firebase deploy --only firestore:rules`

### Token Expiry
Verification tokens expire after 24 hours. If a token expires, just approve the voter again to generate a new one.

---

## Quick Checklist

- [ ] `.env` updated with real EmailJS credentials (not placeholders)
- [ ] Dev server restarted after `.env` changes
- [ ] EmailJS template has `{{to_email}}` in "To Email" field
- [ ] EmailJS template HTML includes all required variables
- [ ] Firestore rules deployed to Firebase
- [ ] `CHECK_EMAILJS_CONFIG.html` shows all green checkmarks
- [ ] Test email sends successfully
- [ ] Full workflow tested (register → approve → verify)

---

## Need More Help?

1. Run the diagnostic: Open `CHECK_EMAILJS_CONFIG.html` in browser
2. Copy the exact error message from browser console (F12)
3. Check EmailJS Dashboard → History for failed attempts
4. Verify all credentials are correct in `.env`
5. Make sure Firestore rules are deployed in Firebase Console
