import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import CheckInForm from './components/CheckInForm';
import Dashboard from './components/Dashboard';
import QueueStatistics from './components/QueueStatistics';
import DoctorStatus from './components/DoctorStatus';
import AuthButton from './components/AuthButton';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <nav className="nav">
            <div className="nav-links">
              <Link to="/" className="nav-link">Patient Check-In</Link>
              <Link to="/dashboard" className="nav-link">Staff Dashboard</Link>
            </div>
            <AuthButton />
          </nav>

          <div className="main-content">
            <Routes>
              <Route path="/" element={<CheckInForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/queue-statistics" element={<QueueStatistics />} />
              <Route path="/doctor-status" element={<DoctorStatus />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
