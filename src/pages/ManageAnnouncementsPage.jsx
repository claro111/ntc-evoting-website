import { useState, useEffect } from 'react';
import { collection, query, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import './ManageAnnouncementsPage.css';

const ManageAnnouncementsPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const { confirmState, showConfirm } = useConfirm();

  useEffect(() => {
    // Set up real-time listener for announcements
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const announcementsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnnouncements(announcementsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching announcements:', err);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleClearForm = () => {
    setTitle('');
    setDescription('');
    setEditingId(null);
  };

  const handlePostAnnouncement = async () => {
    // Validate
    if (!title.trim()) {
      showToast('Please enter an announcement title', 'warning');
      return;
    }

    if (!description.trim() || description === '<p><br></p>') {
      showToast('Please enter an announcement description', 'warning');
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        // Update existing announcement
        const announcementRef = doc(db, 'announcements', editingId);
        await updateDoc(announcementRef, {
          title: title.trim(),
          description: description,
          updatedAt: Timestamp.now(),
        });
        showToast('Announcement updated successfully!', 'success');
      } else {
        // Create new announcement
        await addDoc(collection(db, 'announcements'), {
          title: title.trim(),
          description: description,
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        showToast('Announcement posted successfully!', 'success');
      }

      handleClearForm();
      // No need to manually fetch - real-time listener will update automatically
      setSubmitting(false);
    } catch (err) {
      console.error('Error posting announcement:', err);
      showToast('Failed to post announcement. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setTitle(announcement.title);
    setDescription(announcement.description);
    setEditingId(announcement.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    const confirmed = await showConfirm({
      title: 'Delete Announcement',
      message: 'Are you sure you want to delete this announcement?',
      warningText: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
      showToast('Announcement deleted successfully!', 'success');
      // No need to manually fetch - real-time listener will update automatically
    } catch (err) {
      console.error('Error deleting announcement:', err);
      showToast('Failed to delete announcement. Please try again.', 'error');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Quill editor modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="manage-announcements-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Manage Announcements</h1>
        <p className="page-subtitle">Create and manage announcements for voters</p>
      </div>

      {/* Create/Edit Announcement Form */}
      <div className="announcement-form-section">
        <h2 className="section-title">
          {editingId ? 'Edit Announcement' : 'Create New Announcement'}
        </h2>
        
        <div className="form-group">
          <label className="form-label">Title:</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter announcement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description:</label>
          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
            modules={modules}
            formats={formats}
            placeholder="Enter announcement description..."
          />
        </div>

        <div className="form-actions">
          <button
            className="btn-post"
            onClick={handlePostAnnouncement}
            disabled={submitting}
          >
            {submitting ? 'Posting...' : editingId ? 'Update Announcement' : 'Post Announcement'}
          </button>
          {editingId ? (
            <button
              className="btn-cancel"
              onClick={handleClearForm}
              disabled={submitting}
            >
              Cancel
            </button>
          ) : (
            <button
              className="btn-clear"
              onClick={handleClearForm}
              disabled={submitting}
            >
              Clear Form
            </button>
          )}
        </div>
      </div>

      {/* Posted Announcements */}
      <div className="announcements-list-section">
        <h2 className="section-title">Posted Announcements</h2>
        
        {announcements.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
            <p>No announcements posted yet</p>
          </div>
        ) : (
          <div className="announcements-list">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="announcement-card">
                <div className="announcement-header">
                  <h3 className="admin-announcement-title">{announcement.title}</h3>
                  <span className="admin-announcement-date">{formatDate(announcement.createdAt)}</span>
                </div>
                
                <div 
                  className="announcement-description"
                  dangerouslySetInnerHTML={{ __html: announcement.description }}
                />

                <div className="announcement-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEditAnnouncement(announcement)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          warningText={confirmState.warningText}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          type={confirmState.type}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default ManageAnnouncementsPage;
