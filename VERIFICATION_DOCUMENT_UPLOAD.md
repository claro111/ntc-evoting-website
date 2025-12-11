# Verification Document Upload Implementation

## Overview
The verification document upload functionality has been implemented for voter registration. This allows voters to upload required verification documents during registration, and admins can view these documents when reviewing voter applications.

## How It Works

### For Voters (Registration)
1. **Registration Form**: When registering, voters see a file upload area for verification documents
2. **File Types Supported**: Images (JPEG, PNG, GIF, WebP), PDF, Word documents
3. **File Size Limit**: Maximum 10MB per document
4. **Upload Process**: 
   - File is uploaded to Firebase Storage under `verification_docs/{voterId}/`
   - Document URL is saved to the voter's Firestore record
   - Upload happens after successful account creation

### For Admins (Review)
1. **Manage Voters Page**: Admins can see all pending voter applications
2. **View Document Button**: Each voter card has a "View Document" button
3. **Document Viewing**: Clicking opens the verification document in a new tab
4. **Review Process**: Admins can approve/reject voters after reviewing documents

## File Storage Structure
```
Firebase Storage:
└── verification_docs/
    └── {voterId}/
        └── {timestamp}_{filename}
```

## Database Schema
Voter documents in Firestore include:
```javascript
{
  // ... other voter fields
  verificationDocUrl: "https://storage.googleapis.com/...",
  verificationDocName: "document.pdf",
  // ... other fields
}
```

## Security Rules
- **Upload**: Only the voter themselves can upload to their folder during registration
- **Read**: Only admins can read verification documents
- **No Updates/Deletes**: Verification documents cannot be modified once uploaded

## Components Used
- `FileUpload`: Reusable drag-and-drop file upload component
- `FileUploadService`: Service for handling file uploads to Firebase Storage

## Testing the Feature

### Test Voter Registration with Document Upload:
1. Go to `/voter/register`
2. Fill out the registration form
3. Drag and drop a document or click to browse
4. Submit the form
5. Check Firebase Storage for the uploaded document

### Test Admin Document Review:
1. Go to `/admin/manage-voters`
2. Find a voter with uploaded document
3. Click "View Document" button
4. Document should open in new tab

## Error Handling
- File size validation (max 10MB)
- File type validation (images, PDF, Word docs)
- Upload failure handling (registration continues even if upload fails)
- Missing document validation (prevents form submission)

## Future Enhancements
- Multiple document upload support
- Document preview in admin interface
- Document approval/rejection workflow
- Automatic document processing/validation