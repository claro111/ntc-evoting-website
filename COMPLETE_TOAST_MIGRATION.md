# Complete Toast Migration Guide

## Status Summary

### ✅ Completed Pages
1. **ManageAnnouncementsPage.jsx** - Fully migrated
2. **VotingControlPage.jsx** - Fully migrated

### 🔄 Partially Completed
3. **ManageCandidatesPage.jsx** - Imports added, main component alerts replaced, nested components pending

### ⏳ Pending Pages
4. ManageVotersPage.jsx
5. AdminDashboard.jsx
6. VoterRegisterPage.jsx
7. EmailVerificationPage.jsx
8. ArchiveResultsPage.jsx (if exists)

## For ManageCandidatesPage.jsx - Remaining Work

The file has nested components (PositionsTab, CandidatesTab, PositionModal, CandidateModal) that need showToast passed as props.

### Changes Needed:

1. **Pass showToast to nested components:**
```javascript
<PositionsTab 
  positions={positions}
  onAdd={() => setShowPositionModal(true)}
  onEdit={handleEditPosition}
  onRefresh={fetchData}
  showToast={showToast}  // ADD THIS
/>
```

2. **Update nested component signatures:**
```javascript
const PositionsTab = ({ positions, onAdd, onEdit, onRefresh, showToast }) => {
  const handleDelete = async (position) => {
    // ... existing code ...
    showToast('Position deleted successfully', 'success');  // REPLACE alert()
  };
};
```

3. **Replace remaining alerts:**
- Line 304: `alert('Position deleted successfully')` → `showToast('Position deleted successfully', 'success')`
- Line 308: `alert('Failed to delete position')` → `showToast('Failed to delete position', 'error')`
- Line 359: `alert('Candidate deleted successfully')` → `showToast('Candidate deleted successfully', 'success')`
- Line 363: `alert('Failed to delete candidate')` → `showToast('Failed to delete candidate', 'error')`
- Line 465: `alert('Position updated successfully')` → `showToast('Position updated successfully', 'success')`
- Line 473: `alert('Position created successfully')` → `showToast('Position created successfully', 'success')`
- Line 568: `alert('File size must be less than 5MB')` → `showToast('File size must be less than 5MB', 'warning')`
- Line 606: `alert('Candidate updated successfully')` → `showToast('Candidate updated successfully', 'success')`
- Line 613: `alert('Candidate created successfully')` → `showToast('Candidate created successfully', 'success')`

4. **Add Toast to JSX (before closing div):**
```javascript
{/* Toast Notification */}
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={hideToast}
  />
)}
```

## Quick Reference - Standard Pattern

### 1. Add Imports
```javascript
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
```

### 2. Initialize Hook
```javascript
const { toast, showToast, hideToast } = useToast();
```

### 3. Replace Alerts
```javascript
// Success
alert('Success message') → showToast('Success message', 'success')

// Error
alert('Error message') → showToast('Error message', 'error')

// Warning
alert('Warning message') → showToast('Warning message', 'warning')

// Info
alert('Info message') → showToast('Info message', 'info')
```

### 4. Add Toast Component
```javascript
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={hideToast}
  />
)}
```

## Toast Types
- `success` - Green/Blue for successful operations
- `error` - Red for errors and failures
- `warning` - Orange/Yellow for warnings and confirmations needed
- `info` - Blue for informational messages

## Notes
- Toast auto-dismisses after 3 seconds
- Click overlay or OK button to dismiss manually
- Fully responsive for mobile devices
- Smooth animations included
