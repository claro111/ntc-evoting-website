import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import './ManageCandidatesPage.css';

const ManageCandidatesPage = () => {
  const [activeTab, setActiveTab] = useState('candidates');
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
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
      ];

      for (const position of samplePositions) {
        await addDoc(collection(db, 'positions'), {
          ...position,
          createdAt: Timestamp.now(),
        });
      }

      alert('Sample data loaded successfully!');
      await fetchData();
    } catch (err) {
      console.error('Error loading sample data:', err);
      alert('Failed to load sample data');
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

    return grouped;
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
        <button className="btn-load-sample" onClick={handleLoadSampleData}>
          Load Sample Data
        </button>
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
        />
      )}
    </div>
  );
};

// Positions Tab Component
const PositionsTab = ({ positions, onAdd, onEdit, onRefresh }) => {
  const handleDelete = async (position) => {
    if (!window.confirm(`Delete position "${position.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'positions', position.id));
      alert('Position deleted successfully');
      onRefresh();
    } catch (err) {
      console.error('Error deleting position:', err);
      alert('Failed to delete position');
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
const CandidatesTab = ({ candidates, positions, positionFilter, onFilterChange, onAdd, onEdit, onRefresh }) => {
  const handleDelete = async (candidate) => {
    if (!window.confirm(`Delete candidate "${candidate.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'candidates', candidate.id));
      alert('Candidate deleted successfully');
      onRefresh();
    } catch (err) {
      console.error('Error deleting candidate:', err);
      alert('Failed to delete candidate');
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
                      <p className="candidate-partylist">{candidate.partylist || 'Independent'}</p>
                      <p className="candidate-description">{candidate.description}</p>
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
const PositionFormModal = ({ position, onClose, onSuccess }) => {
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
        alert('Position updated successfully');
      } else {
        // Create new position
        await addDoc(collection(db, 'positions'), {
          name: formData.name,
          maxSelection: parseInt(formData.maxSelection),
          createdAt: Timestamp.now(),
        });
        alert('Position created successfully');
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
const CandidateFormModal = ({ candidate, positions, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: candidate?.name || '',
    position: candidate?.position || '',
    partylist: candidate?.partylist || '',
    description: candidate?.description || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
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
        partylist: formData.partylist,
        description: formData.description,
        photoUrl: photoUrl,
      };

      if (candidate) {
        // Update existing candidate
        await updateDoc(doc(db, 'candidates', candidate.id), {
          ...candidateData,
          updatedAt: Timestamp.now(),
        });
        alert('Candidate updated successfully');
      } else {
        // Create new candidate
        await addDoc(collection(db, 'candidates'), {
          ...candidateData,
          createdAt: Timestamp.now(),
        });
        alert('Candidate created successfully');
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

            <div className="form-group">
              <label className="form-label">Partylist:</label>
              <input
                type="text"
                name="partylist"
                className="form-input"
                value={formData.partylist}
                onChange={handleChange}
                placeholder="e.g., Unity Party (optional)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description or platform"
                rows="4"
              />
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
