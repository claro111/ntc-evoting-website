# Archive Elections - Multiple Elections & Delete Feature

## Status: ✅ COMPLETE

## Summary
Updated the archive system to store multiple historical elections and added delete functionality for archived elections.

## Changes Made

### 1. Election Snapshot System (VotingControlPage.jsx)
When admin publishes results, the system now:
- ✅ Creates a complete snapshot of election data (positions, candidates, votes, statistics)
- ✅ Stores snapshot in a new archived election document
- ✅ Preserves manual winner selections in the snapshot
- ✅ Includes voter statistics (turnout, registered, voted)
- ✅ Each published election gets its own document in the `elections` collection

**Snapshot Structure:**
```javascript
{
  name: "Election Name",
  status: "closed",
  startTime: Timestamp,
  endTime: Timestamp,
  closedAt: Timestamp,
  resultsPublished: true,
  publishedAt: Timestamp,
  snapshot: {
    results: [
      {
        position: { id, name, order, maxSelection },
        candidates: [
          {
            id, name, voteCount, rank, percentage,
            isWinner, manuallySelectedWinner
          }
        ],
        totalVotes: number
      }
    ],
    statistics: {
      totalRegistered: number,
      alreadyVoted: number,
      notYetVoted: number,
      voterTurnout: "percentage"
    }
  }
}
```

### 2. Archive Results Page (ArchiveResultsPage.jsx)
- ✅ Fetches ALL elections where `resultsPublished === true`
- ✅ Displays elections in a grid (sorted by published date, newest first)
- ✅ Each election card shows:
  - Election name
  - Start/End dates
  - "Results Published" badge
  - "View Details" button
  - **NEW: "Delete" button**
- ✅ View Details modal shows complete election results from snapshot
- ✅ Backwards compatible: Falls back to querying current data if no snapshot exists

### 3. Delete Functionality
- ✅ Red "Delete" button on each archived election card
- ✅ Confirmation dialog before deletion
- ✅ Permanently removes the archived election document
- ✅ Refreshes the list after deletion
- ✅ Cannot be undone (as warned in confirmation)

### 4. Styling (ArchiveResultsPage.css)
- ✅ Updated footer layout to accommodate both buttons
- ✅ Red delete button with hover effect
- ✅ Trash icon on delete button
- ✅ Responsive layout for both buttons

## How It Works

### Publishing Results Flow:
1. Admin closes voting session
2. Admin resolves any ties (if needed)
3. Admin clicks "Publish Results" in Voting Control
4. System creates a snapshot of:
   - All positions and their settings
   - All candidates with vote counts and manual winner flags
   - All vote statistics
   - Voter turnout data
5. New archived election document is created with snapshot
6. Current election is marked as published
7. Archive and Export buttons become enabled

### Viewing Archives:
1. Admin clicks "Archived Results" button on dashboard
2. System fetches ALL elections with `resultsPublished === true`
3. Each election is displayed as a card
4. Admin can view details or delete any archived election
5. Details modal shows the preserved snapshot data

### Deleting Archives:
1. Admin clicks red "Delete" button on election card
2. Confirmation dialog appears
3. If confirmed, election document is permanently deleted
4. List refreshes to show remaining elections

## Benefits

1. **Historical Record**: Each election is preserved as it was when published
2. **Multiple Elections**: Can store unlimited past elections
3. **Data Integrity**: Snapshots prevent data loss when current data changes
4. **Clean Management**: Delete old/test elections easily
5. **Manual Winners Preserved**: Tie-breaking decisions are saved in history

## Files Modified
- `ntc-evoting/src/pages/VotingControlPage.jsx` - Added snapshot creation on publish
- `ntc-evoting/src/pages/ArchiveResultsPage.jsx` - Added delete functionality and snapshot support
- `ntc-evoting/src/pages/ArchiveResultsPage.css` - Styled delete button

## Database Structure

### Before (Old System):
- Only one "current" election document
- Archive showed current data (would change if data updated)

### After (New System):
- "current" election document (working election)
- Multiple archived election documents (one per published election)
- Each archived election has complete snapshot
- Historical data never changes

## Testing Checklist
- [x] Publishing results creates archived election with snapshot
- [x] Archive page shows all published elections
- [x] Elections sorted by published date (newest first)
- [x] View Details shows correct snapshot data
- [x] Manual winner selections preserved in archive
- [x] Delete button appears on each election card
- [x] Delete confirmation dialog works
- [x] Election deleted successfully from database
- [x] List refreshes after deletion
- [x] Backwards compatible with old elections (no snapshot)

## Notes
- Each published election creates a NEW document in the elections collection
- The "current" election document (id: "current") is the working election
- Archived elections have auto-generated IDs
- Deleting an archived election is permanent and cannot be undone
- The snapshot preserves the exact state of the election at publish time
