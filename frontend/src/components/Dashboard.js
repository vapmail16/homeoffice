import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    daysToComplete: '',
    expectedDate: '',
    assignedToId: '',
    isBacklog: false
  });
  const [dateInputType, setDateInputType] = useState('days'); // 'days' or 'date'
  const [editingTask, setEditingTask] = useState(null);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed, backlog

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
      // Set default assignedTo to current user if available
      if (response.data.length > 0 && user) {
        const currentUser = response.data.find(u => u.id === user.id);
        if (currentUser && !formData.assignedToId) {
          setFormData(prev => ({ ...prev, assignedToId: currentUser.id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/api/tasks/${editingTask.id}`, {
          comments: comment
        });
        setEditingTask(null);
        setComment('');
      } else {
        const taskData = {
          title: formData.title,
          description: formData.description,
          assignedToId: formData.assignedToId || user?.id,
          isBacklog: formData.isBacklog || false
        };
        
        // Add expected date based on input type (only if not backlog)
        if (!formData.isBacklog) {
          if (dateInputType === 'date' && formData.expectedDate) {
            taskData.expectedDate = formData.expectedDate;
          } else if (dateInputType === 'days' && formData.daysToComplete) {
            taskData.daysToComplete = formData.daysToComplete;
          }
        }
        
        await api.post('/api/tasks', taskData);
        setFormData({ 
          title: '', 
          description: '', 
          daysToComplete: '',
          expectedDate: '',
          assignedToId: user?.id || '',
          isBacklog: false
        });
        setDateInputType('days');
        setShowForm(false);
      }
      fetchTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await api.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Tasks</h1>
          <p>Welcome, {user?.username}!</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowForm(!showForm)} className="add-btn">
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tasks-section">
          <div className="section-header">
            <div className="filter-buttons">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All Tasks
              </button>
              <button
                className={filter === 'pending' ? 'active' : ''}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
              <button
                className={filter === 'backlog' ? 'active' : ''}
                onClick={() => setFilter('backlog')}
              >
                Backlog
              </button>
            </div>
          </div>

          {showForm && !editingTask && (
            <div className="task-form-card">
              <h3>Create New Task</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Task title"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task description (optional)"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isBacklog}
                      onChange={(e) => setFormData({ ...formData, isBacklog: e.target.checked })}
                      className="checkbox-input"
                    />
                    <span>Add to Backlog (no deadline)</span>
                  </label>
                </div>
                {!formData.isBacklog && (
                  <>
                    <div className="form-group">
                      <label>Set Expected Date By:</label>
                      <div className="date-input-toggle">
                        <button
                          type="button"
                          className={dateInputType === 'days' ? 'toggle-active' : 'toggle-btn'}
                          onClick={() => setDateInputType('days')}
                        >
                          Days
                        </button>
                        <button
                          type="button"
                          className={dateInputType === 'date' ? 'toggle-active' : 'toggle-btn'}
                          onClick={() => setDateInputType('date')}
                        >
                          Date
                        </button>
                      </div>
                    </div>
                    {dateInputType === 'days' ? (
                      <div className="form-group">
                        <label>Days to Complete *</label>
                        <input
                          type="number"
                          value={formData.daysToComplete}
                          onChange={(e) => setFormData({ ...formData, daysToComplete: e.target.value })}
                          required
                          min="1"
                          placeholder="e.g., 7"
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>Expected Date *</label>
                        <input
                          type="date"
                          value={formData.expectedDate}
                          onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    )}
                  </>
                )}
                <div className="form-group">
                  <label>Assign To *</label>
                  <select
                    value={formData.assignedToId || user?.id || ''}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                    required
                    className="role-select"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="submit-btn">Create Task</button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">No tasks yet. Create your first task!</div>
          ) : (
            <div className="tasks-list">
              {tasks
                .filter(task => {
                  if (filter === 'pending') return !task.isCompleted && !task.isBacklog;
                  if (filter === 'completed') return task.isCompleted;
                  if (filter === 'backlog') return task.isBacklog;
                  return true;
                })
                .map((task) => (
                <div
                  key={task.id}
                  className={`task-card ${task.isCompleted ? 'completed' : ''} ${!task.isCompleted && !task.isBacklog && task.delayDays > 0 ? 'delayed' : ''} ${task.isBacklog ? 'backlog' : ''}`}
                >
                  <div className="task-header">
                    <div className="task-title-section">
                      <input
                        type="checkbox"
                        checked={task.isCompleted || false}
                        onChange={async () => {
                          try {
                            await api.put(`/api/tasks/${task.id}`, {
                              isCompleted: !task.isCompleted
                            });
                            fetchTasks();
                          } catch (error) {
                            console.error('Failed to update task:', error);
                            alert('Failed to update task status');
                          }
                        }}
                        className="task-checkbox"
                      />
                      <h3 className={task.isCompleted ? 'completed-title' : ''}>{task.title}</h3>
                    </div>
                    {task.isBacklog && (
                      <span className="backlog-badge">📋 Backlog</span>
                    )}
                    {!task.isBacklog && !task.isCompleted && task.delayDays > 0 && (
                      <span className="delay-badge">
                        {task.delayDays} day{task.delayDays > 1 ? 's' : ''} delayed
                      </span>
                    )}
                    {task.isCompleted && (
                      <span className="completed-badge">✓ Completed</span>
                    )}
                  </div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  {task.assignedBy && (
                    <div className="task-assigned-by">
                      <strong>Assigned by:</strong> {task.assignedBy.username} ({task.assignedBy.role})
                    </div>
                  )}
                  <div className="task-dates">
                    <div>
                      <strong>Created:</strong> {formatDate(task.createdDate)}
                    </div>
                    {task.expectedDate && (
                      <div>
                        <strong>Expected:</strong> {formatDate(task.expectedDate)}
                      </div>
                    )}
                    {task.isBacklog && (
                      <div className="backlog-indicator">
                        <strong>Status:</strong> No deadline (Backlog)
                      </div>
                    )}
                    {task.completedDate && (
                      <div>
                        <strong>Completed:</strong> {formatDate(task.completedDate)}
                      </div>
                    )}
                  </div>
                  {task.comments && (
                    <div className="task-comments">
                      <strong>Comments:</strong> {task.comments}
                    </div>
                  )}
                  <div className="task-actions">
                    {!editingTask || editingTask.id !== task.id ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setComment(task.comments || '');
                          }}
                          className="comment-btn"
                        >
                          {task.comments ? 'Edit Comment' : 'Add Comment'}
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmit(e);
                        }}
                        className="comment-form"
                      >
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add your comment..."
                          rows="2"
                        />
                        <div className="comment-actions">
                          <button type="submit" className="save-btn">Save</button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTask(null);
                              setComment('');
                            }}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
