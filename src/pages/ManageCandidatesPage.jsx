import { useState, useEffect } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import './ManageCandidatesPage.css';

const ManageCandidatesPage = () => {
  const [activeTab, setActiveTab] = useState('candidates');
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const { confirmState, showConfirm } = useConfirm();
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [positionFilter, setPositionFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchPositions(), fetchCandidates()]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    const positionsRef = collection(db, 'positions');
    const snapshot = await getDocs(positionsRef);
    const positionsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPositions(positionsData);
  };

  const fetchCandidates = async () => {
    const candidatesRef = collection(db, 'candidates');
    const snapshot = await getDocs(candidatesRef);
    const candidatesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCandidates(candidatesData);
  };

  const handleAddPosition = () => {
    setSelectedPosition(null);
    setShowPositionModal(true);
  };

  const handleEditPosition = (position) => {
    setSelectedPosition(position);
    setShowPositionModal(true);
  };

  const handleAddCandidate = () => {
    setSelectedCandidate(null);
    setShowCandidateModal(true);
  };

  const handleEditCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleLoadSampleData = async () => {
    if (!window.confirm('This will add sample positions and candidates. Continue?')) {
      return;
    }

    try {
      // Sample positions
      const samplePositions = [
        { name: 'President', maxSelection: 1, order: 1 },
        { name: 'Vice President', maxSelection: 1, order: 2 },
        { name: 'Secretary', maxSelection: 1, order: 3 },
        { name: 'Treasurer', maxSelection: 1, order: 4 },
        { name: 'Auditor', maxSelection: 1, order: 5 },
        { name: 'Senator', maxSelection: 5, order: 6 },
        { name: 'Representatives', maxSelection: 3, order: 7 },
      ];

      // Add positions
      for (const position of samplePositions) {
        await addDoc(collection(db, 'positions'), {
          ...position,
          createdAt: Timestamp.now(),
        });
      }

      // Sample candidate names - expanded list for unique names
      const firstNames = [
        'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria',
        'William', 'Jennifer', 'Richard', 'Patricia', 'Charles', 'Linda', 'Joseph', 'Barbara', 'Thomas', 'Elizabeth',
        'Christopher', 'Susan', 'Daniel', 'Jessica', 'Matthew', 'Karen', 'Anthony', 'Nancy', 'Mark', 'Betty',
        'Donald', 'Margaret', 'Steven', 'Sandra', 'Paul', 'Ashley', 'Andrew', 'Kimberly', 'Joshua', 'Emily',
        'Kenneth', 'Donna', 'Kevin', 'Michelle', 'Brian', 'Carol', 'George', 'Amanda', 'Edward', 'Melissa',
        'Ronald', 'Deborah', 'Timothy', 'Stephanie', 'Jason', 'Rebecca', 'Jeffrey', 'Sharon', 'Ryan', 'Laura',
        'Jacob', 'Cynthia', 'Gary', 'Kathleen', 'Nicholas', 'Amy', 'Eric', 'Shirley', 'Jonathan', 'Angela'
      ];
      const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
        'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
        'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
        'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
        'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
        'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
        'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper'
      ];
      const schools = ['SOB', 'SOTE', 'SOAST', 'SOCJ'];

      let candidateIndex = 0;
      
      // Add 10 candidates for each position
      for (const position of samplePositions) {
        for (let i = 0; i < 10; i++) {
          const candidateName = `${firstNames[candidateIndex]} ${lastNames[candidateIndex]}`;
          candidateIndex++;
          
          const candidateData = {
            name: candidateName,
            position: position.name,
            bio: `<p>${candidateName} is a dedicated candidate for ${position.name}. With years of experience in leadership and community service, they are committed to serving with integrity and excellence.</p>`,
            platform: `<p><strong>Key Goals:</strong></p><ul><li>Promote transparency and accountability</li><li>Foster inclusive community engagement</li><li>Drive positive organizational change</li></ul>`,
            photoUrl: '',
            createdAt: Timestamp.now(),
          };

          // Add school for Representatives position
          if (position.name === 'Representatives') {
            const schoolIndex = Math.floor(i / 2.5); // Distribute 10 candidates across 4 schools
            candidateData.school = schools[schoolIndex];
            candidateData.bio = `<p>${candidateName} is a dedicated candidate for ${position.name} from ${schools[schoolIndex]}. With years of experience in leadership and community service, they are committed to serving with integrity and excellence.</p>`;
          } else {
            candidateData.school = '';
          }

          await addDoc(collection(db, 'candidates'), candidateData);
        }
      }

      showToast('Sample data loaded successfully! Added 7 positions and 70 candidates.', 'success');
      await fetchData();
    } catch (err) {
      console.error('Error loading sample data:', err);
      showToast('Failed to load sample data', 'error');
    }
  };

  const handleResetData = async () => {
    const confirmMessage = 'WARNING: This will permanently delete ALL positions and candidates. This action cannot be undone. Are you sure?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Double confirmation for safety
    if (!window.confirm('Are you ABSOLUTELY sure? All data will be lost!')) {
      return;
    }

    try {
      setLoading(true);

      // Delete all candidates
      const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
      const candidateDeletePromises = candidatesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(candidateDeletePromises);

      // Delete all positions
      const positionsSnapshot = await getDocs(collection(db, 'positions'));
      const positionDeletePromises = positionsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(positionDeletePromises);

      showToast('All positions and candidates have been deleted successfully!', 'success');
      await fetchData();
    } catch (err) {
      console.error('Error resetting data:', err);
      showToast('Failed to reset data. Please try again.', 'error');
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    if (positionFilter === 'all') return candidates;
    return candidates.filter((c) => c.position === positionFilter);
  };

  const groupCandidatesByPosition = () => {
    const filtered = filterCandidates();
    const grouped = {};
    
    filtered.forEach((candidate) => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = [];
      }
      grouped[candidate.position].push(candidate);
    });

    // Sort positions by their order field
    const sortedGrouped = {};
    const sortedPositions = positions
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(p => p.name);
    
    // Add positions in sorted order
    sortedPositions.forEach(positionName => {
      if (grouped[positionName]) {
        sortedGrouped[positionName] = grouped[positionName];
      }
    });
    
    // Add any remaining positions that weren't in the positions array
    Object.keys(grouped).forEach(positionName => {
      if (!sortedGrouped[positionName]) {
        sortedGrouped[positionName] = grouped[positionName];
      }
    });

    return sortedGrouped;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="manage-candidates-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Candidates</h1>
          <p className="page-subtitle">Manage election positions and candidates</p>
        </div>
        <div className="header-buttons">
          <button className="btn-load-sample" onClick={handleLoadSampleData}>
            Load Sample Data
          </button>
          <button className="btn-reset-candidates" onClick={handleResetData}>
            Reset All Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'positions' ? 'active' : ''}`}
            onClick={() => setActiveTab('positions')}
          >
            Positions ({positions.length})
          </button>
          <button
            className={`tab ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            Candidates ({candidates.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'positions' && (
          <PositionsTab
            positions={positions}
            onAdd={handleAddPosition}
            onEdit={handleEditPosition}
            onRefresh={fetchData}
            showToast={showToast}
            showConfirm={showConfirm}
          />
        )}
        {activeTab === 'candidates' && (
          <CandidatesTab
            candidates={groupCandidatesByPosition()}
            positions={positions}
            positionFilter={positionFilter}
            onFilterChange={setPositionFilter}
            onAdd={handleAddCandidate}
            onEdit={handleEditCandidate}
            onRefresh={fetchData}
            showToast={showToast}
            showConfirm={showConfirm}
          />
        )}
      </div>

      {/* Position Modal */}
      {showPositionModal && (
        <PositionFormModal
          position={selectedPosition}
          onClose={() => setShowPositionModal(false)}
          onSuccess={() => {
            setShowPositionModal(false);
            fetchData();
          }}
          showToast={showToast}
        />
      )}

      {/* Candidate Modal */}
      {showCandidateModal && (
        <CandidateFormModal
          candidate={selectedCandidate}
          positions={positions}
          onClose={() => setShowCandidateModal(false)}
          onSuccess={() => {
            setShowCandidateModal(false);
            fetchData();
          }}
          showToast={showToast}
        />
      )}

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

// Positions Tab Component
const PositionsTab = ({ positions, onAdd, onEdit, onRefresh, showToast, showConfirm }) => {
  const handleDelete = async (position) => {
    const confirmed = await showConfirm({
      title: 'Delete Position',
      message: `Are you sure you want to delete position "${position.name}"?`,
      warningText: 'This action cannot be undone. All candidates under this position will remain but may need reassignment.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'positions', position.id));
      showToast('Position deleted successfully', 'success');
      onRefresh();
    } catch (err) {
      console.error('Error deleting position:', err);
      showToast('Failed to delete position', 'error');
    }
  };

  return (
    <div className="positions-tab">
      <div className="section-header">
        <h2>Manage Positions</h2>
        <button className="btn-add" onClick={onAdd}>
          + Add Position
        </button>
      </div>

      {positions.length === 0 ? (
        <div className="empty-state">
          <p>No positions created yet</p>
        </div>
      ) : (
        <div className="positions-list">
          {positions.map((position, index) => (
            <div key={position.id} className="position-item">
              <div className="position-number">{index + 1}</div>
              <div className="position-info">
                <h3>{position.name}</h3>
                <p>Max Selection: {position.maxSelection}</p>
              </div>
              <div className="position-actions">
                <button className="btn-edit" onClick={() => onEdit(position)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(position)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Candidates Tab Component
const CandidatesTab = ({ candidates, positions, positionFilter, onFilterChange, onAdd, onEdit, onRefresh, showToast, showConfirm }) => {
  const handleDelete = async (candidate) => {
    const confirmed = await showConfirm({
      title: 'Delete Candidate',
      message: `Are you sure you want to delete candidate "${candidate.name}"?`,
      warningText: 'This action cannot be undone. All votes for this candidate will be preserved in the records.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'candidates', candidate.id));
      showToast('Candidate deleted successfully', 'success');
      onRefresh();
    } catch (err) {
      console.error('Error deleting candidate:', err);
      showToast('Failed to delete candidate', 'error');
    }
  };

  return (
    <div className="candidates-tab">
      <div className="section-header">
        <h2>Manage Candidates</h2>
        <div className="header-actions">
          <select
            className="position-filter"
            value={positionFilter}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="all">All Positions</option>
            {positions.map((pos) => (
              <option key={pos.id} value={pos.name}>
                {pos.name}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={onAdd}>
            + Add Candidate
          </button>
        </div>
      </div>

      {Object.keys(candidates).length === 0 ? (
        <div className="empty-state">
          <p>No candidates found</p>
        </div>
      ) : (
        <div className="candidates-by-position">
          {Object.entries(candidates).map(([position, candidateList]) => (
            <div key={position} className="position-section">
              <div className="position-header">{position}</div>
              <div className="candidates-grid">
                {candidateList.map((candidate) => (
                  <div key={candidate.id} className="candidate-card">
                    <div className="candidate-photo">
                      {candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt={candidate.name} />
                      ) : (
                        <div className="photo-placeholder">No Photo</div>
                      )}
                    </div>
                    <div className="candidate-info">
                      <h3>{candidate.name}</h3>
                      {candidate.bio && (
                        <div className="candidate-bio" dangerouslySetInnerHTML={{ __html: candidate.bio }} />
                      )}
                      {candidate.platform && (
                        <div className="candidate-platform" dangerouslySetInnerHTML={{ __html: candidate.platform }} />
                      )}
                    </div>
                    <div className="candidate-actions">
                      <button className="btn-edit" onClick={() => onEdit(candidate)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(candidate)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Position Form Modal Component
const PositionFormModal = ({ position, onClose, onSuccess, showToast }) => {
  const [formData, setFormData] = useState({
    name: position?.name || '',
    maxSelection: position?.maxSelection || 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      if (position) {
        // Update existing position
        await updateDoc(doc(db, 'positions', position.id), {
          name: formData.name,
          maxSelection: parseInt(formData.maxSelection),
          updatedAt: Timestamp.now(),
        });
        showToast('Position updated successfully', 'success');
      } else {
        // Create new position
        await addDoc(collection(db, 'positions'), {
          name: formData.name,
          maxSelection: parseInt(formData.maxSelection),
          createdAt: Timestamp.now(),
        });
        showToast('Position created successfully', 'success');
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving position:', err);
      setError('Failed to save position');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{position ? 'Edit Position' : 'Add Position'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Position Name:</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., President"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Selection:</label>
              <input
                type="number"
                name="maxSelection"
                className="form-input"
                value={formData.maxSelection}
                onChange={handleChange}
                min="1"
                required
              />
              <p className="form-hint">Number of candidates voters can select for this position</p>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Candidate Form Modal Component
const CandidateFormModal = ({ candidate, positions, onClose, onSuccess, showToast }) => {
  const [formData, setFormData] = useState({
    name: candidate?.name || '',
    position: candidate?.position || '',
    school: candidate?.school || '',
    bio: candidate?.bio || '<p><br></p>',
    platform: candidate?.platform || '<p><br></p>',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBioChange = (value) => {
    setFormData((prev) => ({ ...prev, bio: value }));
  };

  const handlePlatformChange = (value) => {
    setFormData((prev) => ({ ...prev, platform: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'warning');
        return;
      }
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      let photoUrl = candidate?.photoUrl || '';

      // Upload photo if new file selected
      if (photoFile) {
        const storageRef = ref(storage, `candidates/${Date.now()}_${photoFile.name}`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      }

      const candidateData = {
        name: formData.name,
        position: formData.position,
        school: formData.school || '',
        bio: formData.bio,
        platform: formData.platform,
        photoUrl: photoUrl,
      };

      if (candidate) {
        // Update existing candidate
        await updateDoc(doc(db, 'candidates', candidate.id), {
          ...candidateData,
          updatedAt: Timestamp.now(),
        });
        showToast('Candidate updated successfully', 'success');
      } else {
        // Create new candidate
        await addDoc(collection(db, 'candidates'), {
          ...candidateData,
          createdAt: Timestamp.now(),
        });
        showToast('Candidate created successfully', 'success');
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving candidate:', err);
      setError('Failed to save candidate');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{candidate ? 'Edit Candidate' : 'Add Candidate'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Candidate Name:</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Position:</label>
              <select
                name="position"
                className="form-input"
                value={formData.position}
                onChange={handleChange}
                required
              >
                <option value="">Select Position</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.name}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>

            {/* School field - only for Representatives */}
            {formData.position === 'Representatives' && (
              <div className="form-group">
                <label className="form-label">School:</label>
                <select
                  name="school"
                  className="form-input"
                  value={formData.school}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select School</option>
                  <option value="SOB">School of Business (SOB)</option>
                  <option value="SOTE">School of Teacher Education (SOTE)</option>
                  <option value="SOAST">School of Arts, Sciences and Technology (SOAST)</option>
                  <option value="SOCJ">School of Criminal Justice (SOCJ)</option>
                </select>
                <p className="form-hint">Representatives are school-specific</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Bio:</label>
              <div className="quill-wrapper">
                <ReactQuill
                  theme="snow"
                  value={formData.bio || ''}
                  onChange={handleBioChange}
                  placeholder="Enter candidate's full biography..."
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['clean'],
                    ],
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Platform:</label>
              <div className="quill-wrapper">
                <ReactQuill
                  theme="snow"
                  value={formData.platform || ''}
                  onChange={handlePlatformChange}
                  placeholder="Enter candidate's platform..."
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['clean'],
                    ],
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="form-input-file"
              />
              {candidate?.photoUrl && !photoFile && (
                <p className="form-hint">Current photo will be kept if no new file is selected</p>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageCandidatesPage;
