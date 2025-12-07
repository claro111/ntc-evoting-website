# Handling Duplicate Email Error

## Problem

When you reject a voter registration and then try to register again with the same email, you get:
```
This email is already registered
```

This happens because:
1. Firebase Authentication creates an account when the user registers
2. When you reject the voter, only the Firestore status changes to "deactivated"
3. The Firebase Authentication account still exists
4. You cannot create a new Firebase Auth account with the same email

---

## Solution Options

### Option 1: Reactivate the Existing Account (Recommended)

Instead of trying to register again, use the **Reactivate** button in the admin panel:

1. Go to **Admin Panel** → **Manage Voters** → **Deactivated Voters** tab
2. Find the voter you want to reactivate
3. Click **"Reactivate Account"** button
4. The system will:
   - If the voter was rejected **before email verification**: Move them back to **Pending Reviews**
   - If the voter was rejected **after email verification**: Reactivate them as **Registered**

### Option 2: Delete the Firebase Auth Account (For Testing)

If you need to completely remove the account for testing:

#### Using Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select your project
3. Click **Authentication** → **Users**
4. Find the user by email
5. Click the **three dots** (⋮) → **Delete account**
6. Confirm deletion
7. Now you can register with that email again

#### Using Firebase CLI:
```bash
# Delete user by email
firebase auth:delete user@ntc.edu.ph --project your-project-id
```

---

## How the Reactivate Feature Works

### For Voters Rejected Before Email Verification:
- Status changes from `deactivated` → `pending`
- Voter appears in **Pending Reviews** tab
- Admin can review and approve/reject again
- If approved, voter receives verification email

### For Voters Rejected After Email Verification:
- Status changes from `deactivated` → `registered`
- `emailVerified` is set to `true`
- Voter appears in **Registered Voters** tab
- Voter can log in immediately

---

## Best Practices

### For Development/Testing:
1. **Use the Reactivate button** instead of deleting and re-registering
2. If you need a fresh start, delete the Firebase Auth account from Firebase Console
3. Consider using test emails like `test1@ntc.edu.ph`, `test2@ntc.edu.ph`, etc.

### For Production:
1. **Never delete Firebase Auth accounts** unless absolutely necessary
2. Always use the **Reactivate** feature to restore deactivated accounts
3. Keep audit logs of all reactivations
4. Communicate with voters about their account status

---

## Workflow Examples

### Example 1: Voter Rejected Before Email Verification

**Scenario:** Admin rejects a voter who just registered (status: pending)

1. Voter registers → Status: `pending`
2. Admin rejects → Status: `deactivated`
3. Admin clicks **Reactivate** → Status: `pending`
4. Voter appears in **Pending Reviews** again
5. Admin approves → Status: `approved_pending_verification`
6. Voter verifies email → Status: `registered`

### Example 2: Voter Rejected After Email Verification

**Scenario:** Admin deactivates a registered voter

1. Voter is registered → Status: `registered`, `emailVerified: true`
2. Admin deactivates → Status: `deactivated`
3. Admin clicks **Reactivate** → Status: `registered`, `emailVerified: true`
4. Voter appears in **Registered Voters** tab
5. Voter can log in immediately

### Example 3: Voter Wants to Register Again (Wrong Approach)

**Scenario:** Voter tries to register with same email after rejection

❌ **Wrong:** Try to register again
- Result: "This email is already registered" error
- Firebase Auth account already exists

✅ **Correct:** Admin reactivates the account
- Result: Account restored to appropriate status
- Voter can proceed based on their verification status

---

## Technical Details

### Firebase Authentication vs Firestore

**Firebase Authentication:**
- Stores user credentials (email, password)
- Handles login/logout
- Cannot have duplicate emails
- Separate from Firestore data

**Firestore:**
- Stores voter profile data
- Stores voter status (pending, registered, deactivated)
- Can be updated independently

**Key Point:** Rejecting a voter only changes Firestore status, not Firebase Auth!

### Status Flow

```
Registration → pending
              ↓
Admin Approve → approved_pending_verification
              ↓
Email Verify → registered
              ↓
Admin Deactivate → deactivated
              ↓
Admin Reactivate → pending (if not verified) OR registered (if verified)
```

---

## Troubleshooting

### Issue: "This email is already registered"

**Cause:** Firebase Auth account exists

**Solutions:**
1. Use Reactivate button (recommended)
2. Delete Firebase Auth account (testing only)
3. Use a different email address

### Issue: Reactivated voter doesn't appear in Registered Voters

**Cause:** Voter was rejected before email verification

**Solution:** 
- Check **Pending Reviews** tab
- The voter needs to be approved and verify email again

### Issue: Voter can't log in after reactivation

**Possible Causes:**
1. Status is still `deactivated` (reactivation failed)
2. Status is `pending` (needs admin approval)
3. Status is `approved_pending_verification` (needs email verification)

**Solution:**
- Check voter status in Firestore
- Ensure status is `registered` and `emailVerified: true`

---

## Quick Reference

| Action | Result | Next Step |
|--------|--------|-----------|
| Register | Status: `pending` | Admin reviews |
| Approve | Status: `approved_pending_verification` | Voter verifies email |
| Verify Email | Status: `registered` | Voter can log in |
| Reject (pending) | Status: `deactivated` | Use Reactivate |
| Deactivate (registered) | Status: `deactivated` | Use Reactivate |
| Reactivate (not verified) | Status: `pending` | Admin reviews again |
| Reactivate (verified) | Status: `registered` | Voter can log in |

---

## Summary

- ✅ Use **Reactivate** button for deactivated accounts
- ✅ Reactivate sends unverified voters back to Pending Reviews
- ✅ Reactivate restores verified voters to Registered status
- ❌ Don't try to register again with the same email
- ❌ Don't delete Firebase Auth accounts in production
- 💡 For testing, delete Firebase Auth account from console if needed

---

Need help? Check the voter's status in:
1. Firebase Console → Authentication → Users (for auth status)
2. Firebase Console → Firestore → voters collection (for profile status)
