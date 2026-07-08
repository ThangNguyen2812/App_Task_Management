import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import API from '../services/api';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchTasks = async () => {
      try {
        const url = searchQuery ? `/tasks/get?search=${searchQuery}&limit=100` : '/tasks/get?limit=100';
        const { data } = await API.get(url);
        if (active) {
          setTasks(data.data || data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error.message);
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      active = false;
    };
  }, [searchQuery]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const { data } = await API.post('/tasks/create', { title: newTaskTitle });
      setTasks((prevTasks) => [data.data, ...prevTasks]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error creating task:', error.message);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const { data } = await API.put(`/tasks/update/${id}`, { isCompleted: !currentStatus });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === id ? data.data : task))
      );
    } catch (error) {
      console.error('Error updating task:', error.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/tasks/delete/${id}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error.message);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header Panel */}
      <header className="db-header">
        <h3>📋 Welcome, {user?.username}!</h3>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      {/* Control Area */}
      <div className="db-controls">
        <form onSubmit={handleCreateTask} className="task-form">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="task-input"
          />
          <button type="submit" className="add-btn">Add</button>
        </form>

        <input
          type="text"
          placeholder="🔍 Search tasks..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setLoading(true);
          }}
          className="search-input"
        />
      </div>

      {/* Tasks List */}
      {loading ? (
        <p>Loading your tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-text">No tasks found. Create one above!</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-info">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggleComplete(task._id, task.isCompleted)}
                  className="task-checkbox"
                />
                <span className={task.isCompleted ? "task-text-completed" : "task-text"}>
                  {task.title}
                </span>
              </div>
              <button onClick={() => handleDeleteTask(task._id)} className="delete-btn">
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}