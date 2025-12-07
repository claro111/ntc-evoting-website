# ✅ Complete EmailJS Setup

## 🎉 All Your EmailJS Credentials:

- **Service ID:** `service_d20m5t8` ✅
- **Approval Template ID:** `template_d2j48s2` ✅
- **Rejection Template ID:** `template_7ksubrz` ✅
- **Public Key:** `B8iNbZREemIGhkWmV` ✅

---

## 📝 Your Complete .env Configuration

Copy and paste this into your `ntc-evoting/.env` file:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_d20m5t8
VITE_EMAILJS_TEMPLATE_APPROVAL=template_d2j48s2
VITE_EMAILJS_TEMPLATE_REJECTION=template_7ksubrz
VITE_EMAILJS_PUBLIC_KEY=B8iNbZREemIGhkWmV
```

---

## 🚀 Next Steps:

### Step 1: Update Your .env File

1. Open `ntc-evoting/.env`
2. Find the EmailJS section (or add it if it doesn't exist)
3. Copy and paste the configuration above
4. Save the file

### Step 2: Restart Your Dev Server

**IMPORTANT:** You MUST restart the dev server for changes to take effect!

```bash
# In your terminal, stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test the Email System

1. Open http://localhost:5173
2. Login as admin
3. Go to **"Manage Voters"**
4. Click **"Review"** on a pending voter
5. Set an expiration date
6. Click **"Approve"**
7. Check the voter's email inbox! 📧

---

## 🧪 Test Checklist:

- [ ] Updated `.env` file with all 4 EmailJS values
- [ ] Saved the `.env` file
- [ ] Restarted dev server (Ctrl+C then `npm run dev`)
- [ ] Logged in as admin
- [ ] Approved a pending voter
- [ ] Checked email inbox (and spam folder!)
- [ ] Email received successfully! 🎉

---

## 📧 What the Emails Will Look Like:

### Approval Email:
- ✅ Professional NTC branding (blue and yellow)
- ✅ Green checkmark icon
- ✅ Big "Verify Email Address" button
- ✅ Shows expiration date
- ✅ 24-hour verification link expiry notice

### Rejection Email:
- ✅ Professional NTC branding
- ✅ Info icon
- ✅ Rejection reason displayed
- ✅ Next steps for the voter
- ✅ Contact information

---

## ⚠️ Troubleshooting

### Emails Not Sending?

1. **Check Browser Console (F12)**
   - Look for any EmailJS errors
   - Common issues: wrong IDs, network errors

2. **Verify .env File**
   - Make sure there are NO quotes around values
   - Make sure there are NO spaces before/after values
   - File must be named exactly `.env` (not `.env.txt`)

3. **Check EmailJS Dashboard**
   - Go to https://dashboard.emailjs.com/
   - Click "History" tab
   - See if emails were sent or if there are errors

4. **Did You Restart?**
   - Changes to `.env` only work after restarting dev server
   - Stop (Ctrl+C) and run `npm run dev` again

### Still Getting 412 Error?

If you still get "insufficient authentication scopes":
1. Go to EmailJS Dashboard → Email Services
2. Delete your Gmail service
3. Add it again
4. **Grant ALL permissions** when Google asks
5. Copy the new Service ID
6. Update `.env` with new Service ID
7. Restart dev server

### Emails Going to Spam?

- Check spam/junk folder
- Mark as "Not Spam"
- Add sender to contacts
- This trains Gmail to trust these emails

---

## 🎯 Your Complete Configuration:

```
EmailJS Setup Complete! ✅

Service ID:     service_d20m5t8
Approval:       template_d2j48s2
Rejection:      template_7ksubrz
Public Key:     B8iNbZREemIGhkWmV

Status:         Ready to send emails! 🚀
Free Limit:     200 emails/month
Cost:           $0 (FREE!)
```

---

## 📊 What Happens When You Approve a Voter:

1. Admin clicks "Approve" in Manage Voters
2. System generates verification token
3. System stores token in Firestore
4. System updates voter status to "approved_pending_verification"
5. **EmailJS sends professional HTML email** 📧
6. Voter receives email with verification link
7. Voter clicks link
8. System verifies token
9. Voter status changes to "registered"
10. Voter can now log in! ✅

---

## 🎉 Success!

Your email system is now fully configured and ready to use!

Once you've updated your `.env` file and restarted the server, try approving a voter and watch the magic happen! ✨

If you have any issues, check the troubleshooting section above or let me know!

Good luck! 🚀
