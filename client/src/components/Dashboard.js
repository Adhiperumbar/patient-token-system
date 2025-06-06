import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Department-specific average consultation times (in minutes)
const DEPARTMENT_CONSULTATION_TIMES = {
  'General': 10,
  'Cardiology': 15,
  'Neurology': 20,
  'Orthopedics': 15,
  'Pediatrics': 12
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddSymptomsModal, setShowAddSymptomsModal] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    triageLevel: 1
  });

  useEffect(() => {
    fetchData();
    fetchSymptoms();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSymptoms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tokens/symptoms');
      setSymptoms(response.data);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
    }
  };

  const fetchData = async () => {
    try {
      const tokensRes = await axios.get('http://localhost:5000/api/tokens');
      console.log('Fetched Tokens:', tokensRes.data);
      setTokens(tokensRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const getTriageColor = (level) => {
    switch (level) {
      case 'Critical': return '#dc3545';
      case 'Moderate': return '#ffc107';
      case 'Low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const handleStatusUpdate = async (tokenId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/tokens/${tokenId}`, {
        status: newStatus
      });
      fetchData();
    } catch (error) {
      console.error('Error updating token status:', error);
    }
  };

  const getQueueByDepartment = (department) => {
    return tokens.filter(token => 
      token.department === department && 
      token.status === 'waiting'
    ).sort((a, b) => b.triageScore - a.triageScore);
  };

  const handleAddSymptom = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/tokens/symptoms', newSymptom);
      setShowAddSymptomsModal(false);
      setNewSymptom({
        name: '',
        triageLevel: 1
      });
      // Refresh symptoms list
      fetchSymptoms();
    } catch (error) {
      console.error('Error adding symptom:', error);
      setError(error.response?.data?.message || 'Failed to add symptom');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSymptom(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Hospital Dashboard</h1>
        <div className="dashboard-nav">
          <button 
            className="nav-button queue-stats"
            onClick={() => setShowAddSymptomsModal(true)}
          >
            Add Symptoms
          </button>
          <button 
            className="nav-button queue-stats"
            onClick={() => navigate('/queue-statistics')}
          >
            Queue Statistics
          </button>
          <button 
            className="nav-button doctor-status"
            onClick={() => navigate('/doctor-status')}
          >
            Doctor Status
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Department Queues */}
        <div className="department-queues">
          <h3>Department Queues</h3>
          {['General', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'].map(dept => (
            <div key={dept} className="queue-section">
              <h4>{dept}</h4>
              
              {/* Waiting Queue */}
              <div className="queue-category">
                <h5>Waiting</h5>
                <div className="queue-list">
                  {getQueueByDepartment(dept).map(token => (
                    <div 
                      key={token._id} 
                      className="queue-item"
                      style={{ borderLeft: `4px solid ${getTriageColor(token.triageLevel)}` }}
                    >
                      <div className="token-info">
                        <span className="token-number">{token.token}</span>
                        <span className="patient-name">{token.name}</span>
                        <span className="triage-level">{token.triageLevel}</span>
                        {token.estimatedWaitTime > 0 && (
                          <span className="wait-time">
                            ~{Math.round(token.estimatedWaitTime)} min
                          </span>
                        )}
                      </div>
                      <div className="token-actions">
                        <button 
                          onClick={() => handleStatusUpdate(token._id, 'in-progress')}
                          disabled={token.status !== 'waiting'}
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress Queue */}
              <div className="queue-category">
                <h5>In Progress</h5>
                <div className="queue-list">
                  {tokens
                    .filter(token => 
                      token.department === dept && 
                      token.status === 'in-progress'
                    )
                    .map(token => (
                      <div 
                        key={token._id} 
                        className="queue-item in-progress"
                        style={{ borderLeft: `4px solid ${getTriageColor(token.triageLevel)}` }}
                      >
                        <div className="token-info">
                          <span className="token-number">{token.token}</span>
                          <span className="patient-name">{token.name}</span>
                          <span className="triage-level">{token.triageLevel}</span>
                        </div>
                        <div className="token-actions">
                          <button 
                            onClick={() => handleStatusUpdate(token._id, 'completed')}
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Completed Queue */}
              <div className="queue-category">
                <h5>Completed</h5>
                <div className="queue-list">
                  {tokens
                    .filter(token => 
                      token.department === dept && 
                      token.status === 'completed'
                    )
                    .map(token => (
                      <div 
                        key={token._id} 
                        className="queue-item completed"
                        style={{ borderLeft: `4px solid ${getTriageColor(token.triageLevel)}` }}
                      >
                        <div className="token-info">
                          <span className="token-number">{token.token}</span>
                          <span className="patient-name">{token.name}</span>
                          <span className="triage-level">{token.triageLevel}</span>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddSymptomsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Symptom</h3>
            <form onSubmit={handleAddSymptom}>
              <div className="form-group">
                <label htmlFor="name">Symptom Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newSymptom.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter symptom name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="triageLevel">Triage Level (1-10):</label>
                <select
                  id="triageLevel"
                  name="triageLevel"
                  value={newSymptom.triageLevel}
                  onChange={handleInputChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <option key={level} value={level}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Existing Symptoms:</label>
                <div className="symptoms-list">
                  {symptoms.map(symptom => (
                    <div key={symptom._id} className="symptom-item">
                      <span className="symptom-name">{symptom.name}</span>
                      <span className="symptom-level">Level {symptom.triageLevel}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddSymptomsModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Symptom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 