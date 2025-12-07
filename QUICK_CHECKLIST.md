# ✅ Quick Fix Checklist

## Problem: Email not sending + Verification link fails

Follow these steps in order:

---

## 1️⃣ Check Your Configuration

Open in browser: `ntc-evoting/CHECK_EMAILJS_CONFIG.html`

**Expected result:** All green checkmarks ✅

**If you see red X marks:**
- Your `.env` file has placeholder values
- Continue to step 2

---

## 2️⃣ Update .env File

Open `ntc-evoting/.env` and replace these lines:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_APPROVAL=your_approval_template_id_here
VITE_EMAILJS_TEMPLATE_REJECTION=your_rejection_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**Where to get the real values:**

1. Go to https://dashboard.emailjs.com/
2. **Service ID:** Email Services → Copy the ID (starts with `service_`)
3. **Template IDs:** Email Templates → Copy both template IDs (start with `template_`)
4. **Public Key:** Account → API Keys → Copy the key

**After updating:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 3️⃣ Fix EmailJS Template

1. Go to EmailJS Dashboard → Email Templates
2. Click your Approval template
3. Click "Settings" tab
4. In **"To Email"** field, enter: `{{to_email}}`
5. Click "Save"

---

## 4️⃣ Deploy Firestore Rules

**Option A - Using Terminal:**
```bash
cd ntc-evoting
firebase deploy --only firestore:rules
```

**Option B - Using Firebase Console:**
1. Go to https://console.firebase.google.com/
2. Select project: `ntc-evoting-website`
3. Firestore Database → Rules tab
4. Replace all content with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
5. Click "Publish"

---

## 5️⃣ Test Everything

1. **Open:** `CHECK_EMAILJS_CONFIG.html` in browser
2. **Click:** "Check Configuration" → Should see all ✅
3. **Click:** "Test Email Send" → Should see success message
4. **Check:** Your email inbox for test email

---

## 6️⃣ Test Full Workflow

1. Register a new voter (use real email)
2. Login as admin
3. Approve the voter
4. **Check console (F12):** Should see "Verification email sent successfully"
5. **Check email:** Should receive approval email
6. **Click link:** Should see "Email verified successfully"

---

## ✅ Success Indicators

- [ ] `CHECK_EMAILJS_CONFIG.html` shows all green ✅
- [ ] Test email sends successfully
- [ ] Browser console shows "Verification email sent successfully"
- [ ] Email received in Gmail inbox
- [ ] Verification link works (no "Invalid verification link" error)
- [ ] Voter status changes to "registered" in Firestore

---

## ❌ Still Not Working?

**If email doesn't send:**
- Check browser console (F12) for error message
- Verify `.env` has real values (not placeholders)
- Restart dev server after `.env` changes
- Check EmailJS Dashboard → History for failures

**If verification link fails:**
- Confirm Firestore rules deployed (check Firebase Console)
- Make sure you're logged in when clicking link
- Check token exists in `email_verifications` collection

---

## 📖 Detailed Guides

- **Full instructions:** `FIX_VERIFICATION_AND_EMAIL.md`
- **Troubleshooting:** `EMAILJS_TROUBLESHOOTING.md`
- **Summary:** `VERIFICATION_FIX_SUMMARY.md`
