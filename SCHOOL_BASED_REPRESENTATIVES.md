# School-Based Representatives Feature

## Overview
Implemented school-based filtering for Representatives position, where voters can only see and vote for candidates from their own school.

## Changes Made

### 1. Voter Registration (Already Existed)
- School field already present in voter registration form
- Options: SOB, SOTE, SOAST, SOCJ
- Stored in voter document in Firestore

### 2. Candidate Management (`ManageCandidatesPage.jsx`)

#### Added School Field to Candidate Form
- School dropdown appears only when "Representatives" position is selected
- Required field for Representatives candidates
- Options match voter registration: SOB, SOTE, SOAST, SOCJ
- Stored in candidate document with `school` field

#### Updated Sample Data
- Representatives candidates now assigned to schools
- Distribution: 10 candidates across 4 schools (~2-3 per school)
- Bio updated to mention school affiliation
- Other positions have empty school field

### 3. Voting Page (`VotingPage.jsx`)

#### School-Based Filtering
- Fetches voter's school from their Firestore document
- `getCandidatesForPosition()` filters Representatives by voter's school
- Only shows Representatives candidates matching voter's school
- Other positions show all candidates (no filtering)

#### UI Updates
- Position header shows "Showing candidates from your school: [SCHOOL]" for Representatives
- Candidate cards display school name for Representatives: "Representatives - SOB"

## How It Works

### For Voters:
1. Voter registers and selects their school (SOB, SOTE, SOAST, or SOCJ)
2. When voting, they see all candidates for regular positions
3. For Representatives position, they only see candidates from their school
4. Cannot vote for Representatives from other schools

### For Admins:
1. When adding/editing a Representative candidate, select their school
2. School field only appears for Representatives position
3. Sample data automatically distributes Representatives across schools

## Database Structure

### Voter Document
```javascript
{
  fullName: "John Doe",
  school: "SOB",  // SOB, SOTE, SOAST, or SOCJ
  // ... other fields
}
```

### Candidate Document
```javascript
{
  name: "Jane Smith",
  position: "Representatives",
  school: "SOB",  // Only for Representatives, empty for other positions
  bio: "...",
  platform: "...",
  // ... other fields
}
```

## Testing

### Load Sample Data
- Creates 7 positions including Representatives
- Creates 70 candidates (10 per position)
- Representatives candidates distributed across 4 schools

### Test Scenarios
1. Register voters from different schools
2. Login and navigate to voting page
3. Verify Representatives section only shows candidates from voter's school
4. Verify other positions show all candidates
5. Test with voters from each school: SOB, SOTE, SOAST, SOCJ

## Benefits
- Fair representation for each school
- Prevents cross-school voting for Representatives
- Maintains flexibility for other positions (President, VP, etc.)
- Clear UI indication of school-based filtering
