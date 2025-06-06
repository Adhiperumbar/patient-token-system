import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QueueStatistics.css';

const QueueStatistics = () => {
  const navigate = useNavigate();
  const [queueStats, setQueueStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQueueStats();
  }, []);

  const fetchQueueStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tokens/queues');
      const data = await response.json();
      
      // Transform the data into a more usable format
      const stats = data.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});
      
      setQueueStats(stats);
    } catch (error) {
      console.error('Error fetching queue statistics:', error);
      setError('Failed to fetch queue statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading queue statistics...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="queue-statistics">
      <div className="page-header">
        <h1>Queue Statistics</h1>
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div className="stats-grid">
        {Object.entries(queueStats).map(([department, count]) => (
          <div key={department} className="stat-card">
            <h3>{department}</h3>
            <div className="stat-value">{count}</div>
            <div className="stat-label">Patients Waiting</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueueStatistics; 