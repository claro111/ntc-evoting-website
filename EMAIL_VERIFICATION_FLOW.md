# Email Verification Flow

## Complete Process Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    VOTER REGISTRATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. VOTER REGISTERS
   │
   ├─→ Fills registration form
   ├─→ Submits with email: voter@gmail.com
   └─→ Status: "pending"
        │
        ▼
   ┌─────────────────────────────────────┐
   │  Firestore: voters collection       │
   │  - email: voter@gmail.com           │
   │  - status: "pending"                │
   │  - fullName: "John Doe"             │
   └─────────────────────────────────────┘


2. ADMIN REVIEWS
   │
   ├─→ Opens "Manage Voters"
   ├─→ Sees pending voter
   ├─→ Clicks "Review"
   └─→ Clicks "Approve"
        │
        ▼
   ┌─────────────────────────────────────┐
   │  voterService.approveVoter()        │
   │  - Generates token: "abc123xyz"     │
   │  - Creates verification link        │
   │  - Updates voter status             │
   │  - Sends email                      │
   └─────────────────────────────────────┘
        │
        ├─────────────────────────────────┐
        │                                 │
        ▼                                 ▼
   ┌─────────────────────────┐    ┌──────────────────────────┐
   │  Firestore Updates      │    │  EmailJS Sends Email     │
   │                         │    │                          │
   │  voters/voterId:        │    │  To: voter@gmail.com     │
   │  - status: "approved_   │    │  Subject: Registration   │
   │    pending_verification"│    │           Approved       │
   │  - verificationToken    │    │                          │
   │  - expirationDate       │    │  Body:                   │
   │                         │    │  Hello John Doe,         │
   │  email_verifications:   │    │  Click to verify:        │
   │  - token: "abc123xyz"   │    │  [Verification Link]     │
   │  - email: voter@gmail   │    │                          │
   │  - expiresAt: +24hrs    │    │  Expires: Dec 31, 2025   │
   │  - used: false          │    │                          │
   └─────────────────────────┘    └──────────────────────────┘


3. VOTER RECEIVES EMAIL
   │
   ├─→ Opens Gmail inbox
   ├─→ Sees "Registration Approved" email
   └─→ Clicks verification link
        │
        ▼
   http://localhost:5174/verify-email?token=abc123xyz
        │
        ▼
   ┌─────────────────────────────────────┐
   │  EmailVerificationPage.jsx          │
   │  - Extracts token from URL          │
   │  - Calls voterService.verifyEmail() │
   └─────────────────────────────────────┘
        │
        ▼
   ┌─────────────────────────────────────┐
   │  voterService.verifyEmail()         │
   │  - Looks up token in Firestore      │
   │  - Validates token not expired      │
   │  - Validates token not used         │
   │  - Updates voter status             │
   │  - Marks token as used              │
   └─────────────────────────────────────┘
        │
        ├─────────────────────────────────┐
        │                                 │
        ▼                                 ▼
   ┌─────────────────────────┐    ┌──────────────────────────┐
   │  Firestore Updates      │    │  Success Message         │
   │                         │    │                          │
   │  voters/voterId:        │    │  "Email verified         │
   │  - status: "registered" │    │   successfully.          │
   │  - emailVerified: true  │    │   You can now login."    │
   │  - verifiedAt: now      │    │                          │
   │                         │    │  [Go to Login]           │
   │  email_verifications:   │    │                          │
   │  - used: true           │    └──────────────────────────┘
   │  - usedAt: now          │
   └─────────────────────────┘


4. VOTER CAN LOGIN
   │
   ├─→ Goes to login page
   ├─→ Enters email & password
   └─→ Successfully logs in
        │
        ▼
   ┌─────────────────────────────────────┐
   │  Voter Homepage                     │
   │  - Can view announcements           │
   │  - Can vote when session active     │
   │  - Full access to system            │
   └─────────────────────────────────────┘
```

---

## Current Implementation Status

### ✅ Already Implemented

1. **Token Generation**
   - Random unique tokens
   - 24-hour expiry
   - Stored in Firestore

2. **Email Sending Code**
   - EmailJS integration
   - Template variables
   - Error handling

3. **Verification Link**
   - Automatic generation
   - Token validation
   - Status updates

4. **Verification Page**
   - Token extraction from URL
   - Validation logic
   - Success/error messages

### ❌ Needs Configuration

1. **EmailJS Credentials**
   - Service ID
   - Template IDs
   - Public Key

2. **Email Template**
   - Add `{{to_email}}` to settings
   - Include all required variables

---

## What Each File Does

### `voterService.js`
```javascript
approveVoter(voterId, expirationDate)
├─→ Generates verification token
├─→ Stores token in Firestore
├─→ Updates voter status
├─→ Calls emailService.sendApprovalEmail()
└─→ Returns success with verification link

verifyEmail(token)
├─→ Looks up token in Firestore
├─→ Validates token (not expired, not used)
├─→ Updates voter status to "registered"
├─→ Marks token as used
└─→ Returns success message
```

### `emailService.js`
```javascript
sendApprovalEmail({ toEmail, toName, verificationLink, expirationDate })
├─→ Prepares template parameters
├─→ Calls EmailJS API
├─→ Sends email to voter's Gmail
└─→ Returns success/error
```

### `EmailVerificationPage.jsx`
```javascript
Component loads
├─→ Extracts token from URL query params
├─→ Calls voterService.verifyEmail(token)
├─→ Shows success message if valid
└─→ Shows error message if invalid/expired
```

---

## Email Template Variables

### Required in Template Settings:
```
To Email: {{to_email}}
```

### Required in Template HTML:
```
{{to_name}}           → Voter's full name
{{verification_link}} → Full URL with token
{{expiration_date}}   → Formatted date string
{{from_name}}         → "NTC E-Voting System"
```

### Example Values:
```
to_email: "voter@gmail.com"
to_name: "John Doe"
verification_link: "http://localhost:5174/verify-email?token=abc123xyz"
expiration_date: "December 31, 2025"
from_name: "NTC E-Voting System"
```

---

## Error Handling

### Email Sending Fails
```javascript
try {
  await sendApprovalEmail(...);
  console.log('Email sent successfully');
} catch (emailError) {
  console.warn('Email failed, but voter approved');
  // System continues - link shown in success message
}
```

**Result:** Voter is still approved, admin sees verification link

### Token Validation Fails
```javascript
// Invalid token
if (querySnapshot.empty) {
  throw new Error('Invalid verification token');
}

// Token already used
if (tokenData.used) {
  throw new Error('Token has already been used');
}

// Token expired
if (tokenData.expiresAt < now) {
  throw new Error('Token has expired');
}
```

**Result:** Error message shown to voter

---

## Security Features

### Token Security
- ✅ Random generation (Math.random + timestamp)
- ✅ Unique per approval
- ✅ 24-hour expiry
- ✅ Single-use only
- ✅ Stored securely in Firestore

### Validation Checks
- ✅ Token exists in database
- ✅ Token not expired
- ✅ Token not already used
- ✅ User authenticated
- ✅ Firestore rules enforced

### Data Protection
- ✅ Tokens stored separately from voter data
- ✅ Email addresses validated
- ✅ Status transitions controlled
- ✅ Audit trail maintained

---

## Testing Checklist

### Test 1: Email Configuration
- [ ] Open `CHECK_EMAILJS_CONFIG.html`
- [ ] All credentials show ✅ green
- [ ] Test email sends successfully

### Test 2: Approval Flow
- [ ] Register test voter
- [ ] Approve as admin
- [ ] Check console: "Verification email sent successfully"
- [ ] Check Gmail: Email received

### Test 3: Verification Flow
- [ ] Click verification link in email
- [ ] See success message
- [ ] Check Firestore: status = "registered"
- [ ] Login successfully

### Test 4: Error Cases
- [ ] Click verification link twice → "Token already used"
- [ ] Wait 24 hours → "Token expired"
- [ ] Use invalid token → "Invalid verification token"

---

## Summary

The email verification system is **fully implemented** and ready to use. You just need to:

1. ✅ Add EmailJS credentials to `.env`
2. ✅ Configure email template
3. ✅ Restart dev server
4. ✅ Test the flow

Once configured, the complete flow works automatically:
**Register → Approve → Email Sent → Verify → Login** 🎉

See `SETUP_EMAIL_NOW.md` for step-by-step setup instructions!
