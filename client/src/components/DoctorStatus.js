import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorStatus.css';

const DoctorStatus = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    department: '',
    specialization: '',
    maxPatientsPerHour: 2
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tokens/doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to fetch doctor status');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (doctorId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tokens/doctors/${doctorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update doctor status');
      }

      const updatedDoctor = await response.json();
      
      // Update the local state with the server response
      setDoctors(doctors.map(doctor => 
        doctor._id === doctorId 
          ? updatedDoctor
          : doctor
      ));
      
      // Clear any previous errors
      setError('');
    } catch (error) {
      console.error('Error updating doctor status:', error);
      setError(error.message || 'Failed to update doctor status');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/tokens/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDoctor),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add doctor');
      }

      // Update the doctors list with the new doctor
      setDoctors(prevDoctors => [...prevDoctors, data]);
      
      // Reset form and close modal
      setShowAddModal(false);
      setNewDoctor({
        name: '',
        department: '',
        specialization: '',
        maxPatientsPerHour: 2
      });
      
      // Clear any previous errors
      setError('');
    } catch (error) {
      console.error('Error adding doctor:', error);
      setError(error.message || 'Failed to add doctor');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="loading">Loading doctor status...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctor-status">
      <div className="page-header">
        <h1>Doctor Status</h1>
        <div className="header-actions">
          <button className="add-doctor-btn" onClick={() => setShowAddModal(true)}>
            Add New Doctor
          </button>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="doctors-grid">
        {doctors.map(doctor => (
          <div key={doctor._id} className="doctor-card">
            <h3>Dr. {doctor.name}</h3>
            <div className="doctor-info">
              <p><strong>Department:</strong> {doctor.department}</p>
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
              <p><strong>Current Queue:</strong> {doctor.currentQueueLength}</p>
              <p><strong>Status:</strong> 
                <span className={`status ${doctor.isAvailable ? 'available' : 'unavailable'}`}>
                  {doctor.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </p>
            </div>
            <button 
              className={`toggle-button ${doctor.isAvailable ? 'unavailable' : 'available'}`}
              onClick={() => toggleAvailability(doctor._id, doctor.isAvailable)}
            >
              {doctor.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
            </button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Doctor</h3>
            <form onSubmit={handleAddDoctor}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newDoctor.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter doctor's name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department:</label>
                <select
                  id="department"
                  name="department"
                  value={newDoctor.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="General">General</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specialization:</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={newDoctor.specialization}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter specialization"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxPatientsPerHour">Max Patients Per Hour:</label>
                <input
                  type="number"
                  id="maxPatientsPerHour"
                  name="maxPatientsPerHour"
                  value={newDoctor.maxPatientsPerHour}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="10"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorStatus; 