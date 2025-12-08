# Firestore Database Structure

This document outlines the Firestore collections and their structure for the NTC E-Voting system.

## Collections

### 1. voters
Stores voter registration and account information.

```javascript
{
  id: "auto-generated-id",
  firstName: "John",
  middleName: "Smith",
  lastName: "Doe",
  birthdate: Timestamp,
  studentId: "8212753",
  yearLevel: "3rd Year", // "1st Year" | "2nd Year" | "3rd Year" | "4th Year"
  school: "SOCJ", // "SOB" | "SOTE" | "SOAST" | "SOCJ"
  email: "john.doe@ntc.edu.ph",
  verificationDocument: "gs://bucket/verification_docs/voter-id/document.pdf",
  emailVerified: false,
  registrationDate: Timestamp,
  expirationDate: Timestamp,
  status: "pending", // "pending" | "approved_pending_verification" | "registered" | "deactivated"
  hasVoted: false,
  votedAt: Timestamp | null
}
```

**Indexes needed:**
- `email` (for login)
- `studentId` (for uniqueness check)
- `status` (for filtering)

---

### 2. elections
Stores election information.

```javascript
{
  id: "auto-generated-id",
  title: "Student Council Election 2025",
  description: "Annual student council election",
  startTime: Timestamp,
  endTime: Timestamp,
  status: "active", // "draft" | "active" | "closed" | "archived"
  createdBy: "admin-id",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Indexes needed:**
- `status` (for filtering active elections)
- `startTime`, `endTime` (for timing checks)

---

### 3. positions
Stores election positions (President, Vice President, etc.).

```javascript
{
  id: "auto-generated-id",
  electionId: "election-id",
  name: "President",
  maxSelection: 1,
  displayOrder: 1
}
```

**Indexes needed:**
- `electionId` (for querying positions by election)
- Composite: `electionId` + `displayOrder` (for ordered display)

---

### 4. candidates
Stores candidate information.

```javascript
{
  id: "auto-generated-id",
  electionId: "election-id",
  positionId: "position-id",
  name: "Sarah Lim",
  partylist: "Partylist A",
  description: "Platform and bio...",
  photoUrl: "gs://bucket/candidate_photos/election-id/candidate-id/photo.jpg",
  displayOrder: 1
}
```

**Indexes needed:**
- `electionId` (for querying candidates by election)
- `positionId` (for querying candidates by position)
- Composite: `electionId` + `positionId` + `displayOrder`

---

### 5. votes
Stores anonymized votes (NO voter ID for privacy).

```javascript
{
  id: "auto-generated-id",
  electionId: "election-id",
  positionId: "position-id",
  candidateId: "candidate-id",
  timestamp: Timestamp
  // NOTE: No voterId field - votes are completely anonymous
}
```

**Indexes needed:**
- Composite: `electionId` + `candidateId` (for vote counting)
- Composite: `electionId` + `positionId` (for position-wise counting)

---

### 6. vote_receipts
Stores vote receipts (links voter to election but not to specific votes).

```javascript
{
  id: "auto-generated-id",
  voterId: "voter-id",
  electionId: "election-id",
  receiptCode: "unique-receipt-code",
  votes: [
    {
      positionName: "President",
      candidateName: "Sarah Lim"
    },
    {
      positionName: "Vice President",
      candidateName: "Miguel Reyes"
    }
  ],
  timestamp: Timestamp
}
```

**Indexes needed:**
- `voterId` (for retrieving voter's receipt)
- `receiptCode` (for verification)

---

### 7. announcements
Stores system announcements.

```javascript
{
  id: "auto-generated-id",
  title: "Voting System Reset",
  description: "<p>Rich text HTML content...</p>",
  createdBy: "admin-id",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true
}
```

**Indexes needed:**
- `isActive` (for filtering active announcements)
- `createdAt` (for sorting)

---

### 8. admins
Stores administrator accounts.

```javascript
{
  id: "user-auth-id", // Same as Firebase Auth UID
  email: "admin@ntc.edu.ph",
  name: "Admin Name",
  role: "admin", // "admin" | "super_admin"
  mfaEnabled: false,
  mfaSecret: "secret-key" | null,
  lastLogin: Timestamp | null
}
```

**Indexes needed:**
- `email` (for login)
- `role` (for permission checks)

---

### 9. audit_logs
Stores admin action logs.

```javascript
{
  id: "auto-generated-id",
  adminId: "admin-id",
  action: "APPROVE_VOTER",
  entityType: "voter",
  entityId: "voter-id",
  details: {
    voterEmail: "voter@ntc.edu.ph",
    expirationDate: Timestamp
  },
  timestamp: Timestamp,
  ipAddress: "192.168.1.1"
}
```

**Indexes needed:**
- `adminId` (for filtering by admin)
- `timestamp` (for sorting)
- Composite: `adminId` + `timestamp`

---

## Firebase Storage Structure

```
/verification_docs/
  /{voterId}/
    /document.pdf

/candidate_photos/
  /{electionId}/
    /{candidateId}/
      /photo.jpg
```

---

## Setup Instructions

1. **Create Firestore Database:**
   - Go to Firebase Console > Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select your region

2. **Deploy Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

3. **Create Indexes:**
   - Firestore will prompt you to create indexes when you run queries
   - Or manually create them in Firebase Console > Firestore > Indexes

4. **Create Initial Admin Account:**
   - Use Firebase Console > Authentication to create an admin user
   - Add the user to the `admins` collection with role: "super_admin"

---

## Data Flow Examples

### Voter Registration Flow:
1. Voter submits registration → Creates document in `voters` with status: "pending"
2. Admin approves → Updates status to "approved_pending_verification", sends email
3. Voter clicks email link → Updates emailVerified: true, status: "registered"

### Voting Flow:
1. Voter selects candidates → Stored in local state
2. Voter submits vote → Creates anonymized documents in `votes` collection
3. System creates receipt → Creates document in `vote_receipts` with voter ID
4. System updates voter → Sets hasVoted: true, votedAt: timestamp

### Vote Anonymization:
- `votes` collection: Contains candidateId but NO voterId
- `vote_receipts` collection: Contains voterId and selected candidates
- These are separate collections to ensure vote anonymity
- Admins can count votes but cannot link votes to specific voters
