# Your EmailJS Credentials

## ✅ What You Have:

- **Public Key:** `B8iNbZREemIGhkWmV` ✅
- **Approval Template ID:** `template_d2j48s2` ✅
- **Rejection Template ID:** `template_7ksubrz` ✅
- **Service ID:** ❓ **STILL NEEDED**

---

## 🔍 How to Get Your Service ID:

### Step 1: Go to Email Services
1. Open https://dashboard.emailjs.com/
2. Click **"Email Services"** in the left sidebar

### Step 2: Find Your Service ID
You'll see your Gmail service listed. It will look like:

```
📧 Gmail Service Name
   Service ID: service_xxxxxxx  ← Copy this!
   Status: Connected ✓
```

The Service ID starts with `service_` followed by random characters.

### Step 3: Copy It
Click the copy icon next to the Service ID, or select and copy it manually.

---

## 📝 Your .env File Configuration

Once you have the Service ID, your `.env` file should look like this:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_APPROVAL=template_d2j48s2
VITE_EMAILJS_TEMPLATE_REJECTION=template_7ksubrz
VITE_EMAILJS_PUBLIC_KEY=B8iNbZREemIGhkWmV
```

**Replace `service_xxxxxxx` with your actual Service ID!**

---

## 🚀 After You Get the Service ID:

1. **Update `.env` file** with the Service ID
2. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **Test it:**
   - Login as admin
   - Go to "Manage Voters"
   - Approve a pending voter
   - Check email inbox!

---

## 📸 Visual Guide - Where to Find Service ID:

```
EmailJS Dashboard
├── Email Services (left sidebar) ← Click here
│   └── Your Gmail Service
│       ├── Service Name: "Gmail" or "NTC E-Voting Gmail"
│       ├── Service ID: service_xxxxxxx ← COPY THIS!
│       ├── Status: Connected ✓
│       └── Actions: [Edit] [Delete]
```

---

## ⚠️ If You Don't See a Service:

If you don't see any service listed:

1. Click **"Add New Service"**
2. Select **"Gmail"**
3. Click **"Connect Account"**
4. Sign in with your Gmail
5. **Grant ALL permissions** when Google asks
6. Give it a name: "NTC E-Voting"
7. Click **"Create Service"**
8. Copy the Service ID that appears

---

## 🎯 Quick Checklist:

- [x] Public Key: `B8iNbZREemIGhkWmV`
- [x] Approval Template: `template_d2j48s2`
- [x] Rejection Template: `template_7ksubrz`
- [ ] Service ID: `service_???????` ← Get this!
- [ ] Updated `.env` file
- [ ] Restarted dev server
- [ ] Tested email sending

---

## 💡 Pro Tip:

If you're having trouble finding the Service ID, take a screenshot of your EmailJS "Email Services" page and I can help you identify it!

---

Once you have the Service ID, just tell me and I'll help you verify everything is set up correctly! 🚀
