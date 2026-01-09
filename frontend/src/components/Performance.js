import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/axios';
import './Performance.css';

const Performance = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/api/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="performance-container">
        <div className="loading">Loading performance metrics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="performance-container">
        <div className="error">Failed to load metrics</div>
      </div>
    );
  }

  const { summary, completion, weekly } = metrics;

  return (
    <div className="performance-container">
      <h1>Performance Dashboard</h1>
      
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Total Tasks</h3>
            <p className="metric-value">{summary.totalTasks}</p>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>Completed</h3>
            <p className="metric-value">{summary.completedTasks}</p>
            <p className="metric-label">{summary.completionRate}% completion rate</p>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <h3>Pending</h3>
            <p className="metric-value">{summary.pendingTasks}</p>
            <p className="metric-label">{summary.overdueTasks} overdue</p>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>On-Time Rate</h3>
            <p className="metric-value">{summary.onTimeRate}%</p>
            <p className="metric-label">
              {completion.completedOnTime} of {summary.completedTasks} on time
            </p>
          </div>
        </div>
      </div>

      <div className="detailed-metrics">
        <div className="detail-card">
          <h2>Completion Performance</h2>
          <div className="detail-stats">
            <div className="stat-item">
              <span className="stat-label">Completed On Time:</span>
              <span className="stat-value success">{completion.completedOnTime}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed Delayed:</span>
              <span className="stat-value danger">{completion.completedDelayed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Delay:</span>
              <span className="stat-value">
                {completion.averageDelay > 0 
                  ? `${completion.averageDelay} days` 
                  : 'No delays'}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h2>This Week</h2>
          <div className="detail-stats">
            <div className="stat-item">
              <span className="stat-label">Tasks Created:</span>
              <span className="stat-value">{weekly.tasksCreated}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tasks Completed:</span>
              <span className="stat-value success">{weekly.tasksCompleted}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h2>Completion Progress</h2>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${summary.completionRate}%` }}
          >
            <span>{summary.completionRate}%</span>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h2>On-Time Performance</h2>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill success" 
            style={{ width: `${summary.onTimeRate}%` }}
          >
            <span>{summary.onTimeRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
