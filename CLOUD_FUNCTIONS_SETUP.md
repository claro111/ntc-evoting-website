# Firebase Cloud Functions Setup Guide

This guide explains how to set up and deploy Firebase Cloud Functions for the NTC E-Voting system.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Node.js 18 or higher
- Firebase project with Blaze (pay-as-you-go) plan (required for Cloud Functions)

## Setup Steps

### 1. Install Dependencies

Navigate to the functions directory and install dependencies:

```bash
cd ntc-evoting/functions
npm install
```

### 2. Configure Email Service

The Cloud Functions use Nodemailer to send emails. You need to configure email credentials.

#### Option A: Using Gmail (Development/Testing)

1. Create a Gmail account or use an existing one
2. Enable 2-Factor Authentication on your Google account
3. Generate an App Password:
   - Go to Google Account Settings → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

4. Set Firebase environment variables:

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
firebase functions:config:set app.url="https://your-app-url.web.app"
```

#### Option B: Using SendGrid (Production)

For production, consider using SendGrid or another email service:

1. Sign up for SendGrid and get an API key
2. Update `functions/index.js` to use SendGrid instead of Gmail
3. Set the API key in environment config

### 3. Update firebase.json

Ensure your `firebase.json` includes functions configuration:

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "hosting": {
    ...
  },
  "firestore": {
    ...
  }
}
```

### 4. Deploy Cloud Functions

Deploy all functions to Firebase:

```bash
firebase deploy --only functions
```

Or deploy specific functions:

```bash
firebase deploy --only functions:approveVoter
firebase deploy --only functions:rejectVoter
firebase deploy --only functions:verifyEmail
```

### 5. Test Functions Locally (Optional)

You can test functions locally using the Firebase Emulator:

```bash
cd ntc-evoting/functions
npm run serve
```

Then update your frontend to point to the local emulator:

```javascript
// In src/config/firebase.js
import { connectFunctionsEmulator } from 'firebase/functions';

// Add this after initializing functions
if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

## Available Cloud Functions

### 1. approveVoter

Approves a voter registration and sends verification email.

**Parameters:**
- `voterId` (string): The voter document ID
- `expirationDate` (string): Account expiration date (ISO format)

**Returns:**
- `success` (boolean)
- `message` (string)

### 2. rejectVoter

Rejects a voter registration and sends notification email.

**Parameters:**
- `voterId` (string): The voter document ID
- `reason` (string, optional): Rejection reason

**Returns:**
- `success` (boolean)
- `message` (string)

### 3. verifyEmail

Verifies a voter's email address using a token.

**Parameters:**
- `token` (string): Verification token from email link

**Returns:**
- `success` (boolean)
- `message` (string)

## Security Considerations

1. **Admin Authentication**: All functions check if the caller is authenticated
2. **Email Credentials**: Never commit email credentials to version control
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Token Expiration**: Email verification tokens expire after 24 hours
5. **Audit Logging**: All admin actions are logged to the `audit_logs` collection

## Firestore Collections Used

- `voters`: Voter registration data
- `email_verifications`: Email verification tokens
- `audit_logs`: Admin action logs

## Troubleshooting

### Functions not deploying

- Ensure you're on the Blaze plan
- Check that Node.js version matches the runtime specified
- Verify all dependencies are installed

### Emails not sending

- Check email credentials are correctly set
- Verify Gmail App Password is correct (not regular password)
- Check Firebase Functions logs: `firebase functions:log`
- Ensure "Less secure app access" is NOT enabled (use App Password instead)

### Permission errors

- Verify the admin user is authenticated
- Check Firestore security rules allow admin access
- Ensure the `admins` collection contains the admin's email

## Environment Variables

Set these using `firebase functions:config:set`:

- `email.user`: Email address for sending emails
- `email.password`: Email password or app password
- `app.url`: Your application URL (for verification links)

View current config:
```bash
firebase functions:config:get
```

## Cost Considerations

Cloud Functions pricing:
- First 2 million invocations per month are free
- $0.40 per million invocations after that
- Outbound networking costs apply

Email sending:
- Gmail: Free for low volume (consider limits)
- SendGrid: Free tier includes 100 emails/day
- For production, consider a dedicated email service

## Next Steps

1. Deploy the functions
2. Test the approval workflow with a test voter
3. Verify emails are being sent correctly
4. Monitor function logs for any errors
5. Set up alerts for function failures

## Support

For issues or questions:
- Check Firebase Functions documentation: https://firebase.google.com/docs/functions
- Review function logs: `firebase functions:log`
- Check the Firebase Console for function status
