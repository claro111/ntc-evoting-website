# 🔧 Setup Firebase Functions Emulator

## 🎯 **GOAL:** 
Eliminate CORS errors and test complete permanent deletion functionality in development.

## 📋 **SETUP STEPS:**

### **1. Install Firebase CLI (if not already installed)**
```bash
npm install -g firebase-tools
```

### **2. Install Functions Dependencies**
```bash
cd ntc-evoting/functions
npm install
cd ..
```

### **3. Start Firebase Emulators**
```bash
# In the ntc-evoting directory
firebase emulators:start --only functions,firestore
```

### **4. Update Firebase Config for Development**
The app will automatically detect and use the emulator when running locally.

## 🚀 **TESTING WITH EMULATOR:**

### **Start the Emulator:**
1. Open terminal in `ntc-evoting` directory
2. Run: `firebase emulators:start --only functions,firestore`
3. Wait for emulator to start (usually on port 5001 for functions)

### **Start Development Server:**
1. Open another terminal in `ntc-evoting` directory  
2. Run: `npm run dev`
3. Go to: `http://localhost:5174/`

### **Test Permanent Deletion:**
1. Login as admin
2. Go to Manage Voters → Deactivated Voters
3. Click "🗑️ Delete Permanently"
4. **NO CORS ERRORS!** ✅
5. **Complete deletion from all services!** ✅

## 🎉 **BENEFITS:**

### **With Emulator:**
- ✅ No CORS errors
- ✅ Complete Firebase Auth deletion
- ✅ Complete Firestore deletion  
- ✅ Complete Storage cleanup
- ✅ Full Cloud Function testing
- ✅ Identical to production behavior

### **Emulator Features:**
- 🔧 Local Firebase Functions execution
- 🔧 Local Firestore database
- 🔧 Real-time debugging
- 🔧 No deployment needed for testing
- 🔧 Faster development cycle

## 📝 **COMMANDS SUMMARY:**

```bash
# Terminal 1: Start Firebase Emulators
cd ntc-evoting
firebase emulators:start --only functions,firestore

# Terminal 2: Start Development Server  
cd ntc-evoting
npm run dev
```

## 🎯 **RESULT:**
Complete permanent voter deletion functionality with no CORS errors and full Firebase service integration!