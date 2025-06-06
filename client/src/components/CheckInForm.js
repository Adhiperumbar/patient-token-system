import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CheckInForm.css';

const CheckInForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    department: '',
    symptoms: [],
    preferredDoctor: 'no-preference'
  });
  const [doctors, setDoctors] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [showDoctorWarning, setShowDoctorWarning] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch available doctors and symptoms
    fetchDoctors();
    fetchSymptoms();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tokens/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchSymptoms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tokens/symptoms');
      setSymptoms(response.data);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSymptomChange = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleDoctorSelect = (e) => {
    const doctor = e.target.value;
    setFormData(prev => ({
      ...prev,
      preferredDoctor: doctor
    }));
    setShowDoctorWarning(!!doctor);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.name || !formData.age || !formData.gender || !formData.department || !formData.symptoms.length) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate age
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 0 || age > 120) {
        setError('Please enter a valid age between 0 and 120');
        return;
      }

      // Clean up doctor name if present
      const submitData = {
        ...formData,
        age: age,
        preferredDoctor: formData.preferredDoctor === 'no-preference' ? null : formData.preferredDoctor
      };

      console.log('Submitting form data:', submitData);

      const response = await fetch('http://localhost:5000/api/tokens/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate token');
      }

      setSuccess(`Token generated successfully! Your token number is ${data.token}`);
      setToken(data); // Set the token data to show the token display
      setFormData({
        name: '',
        age: '',
        gender: '',
        department: '',
        symptoms: [],
        preferredDoctor: 'no-preference'
      });
    } catch (error) {
      console.error('Error generating token:', error);
      setError(error.message || 'Failed to generate token. Please try again.');
    }
  };

  return (
    <div className="check-in-form">
      <h2>Patient Check-In</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {token ? (
        <div className="token-display">
          <h3>Token Generated!</h3>
          <p>Token Number: {token.token}</p>
          <p>Department: {token.department}</p>
          <p>Triage Level: {token.triageLevel}</p>
          {token.preferredDoctor && (
            <p>Preferred Doctor: {token.preferredDoctor}</p>
          )}
          {token.estimatedWaitTime > 0 && (
            <p>Estimated Wait Time: {Math.round(token.estimatedWaitTime)} minutes</p>
          )}
          <button onClick={() => setToken(null)}>Generate New Token</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age:</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="0"
              max="120"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="department">Department:</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
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
            <label>Symptoms:</label>
            <div className="symptoms-grid">
              {symptoms.map(symptom => (
                <div key={symptom._id} className="symptom-item">
                  <input
                    type="checkbox"
                    id={symptom._id}
                    checked={formData.symptoms.includes(symptom.name)}
                    onChange={() => handleSymptomChange(symptom.name)}
                  />
                  <label htmlFor={symptom._id}>
                    {symptom.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="preferredDoctor">Preferred Doctor (Optional):</label>
            <select
              id="preferredDoctor"
              name="preferredDoctor"
              value={formData.preferredDoctor}
              onChange={handleDoctorSelect}
            >
              <option value="no-preference">No Preference</option>
              {doctors
                .filter(doctor => doctor.isAvailable)
                .map(doctor => (
                  <option key={doctor._id} value={doctor.name}>
                    Dr. {doctor.name} - {doctor.specialization}
                  </option>
                ))}
            </select>
            {showDoctorWarning && (
              <p className="warning-message">
                Note: Selecting a preferred doctor may increase your wait time.
              </p>
            )}
          </div>

          <button type="submit" className="submit-button">
            Generate Token
          </button>
        </form>
      )}
    </div>
  );
};

export default CheckInForm; 