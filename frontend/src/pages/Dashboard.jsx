import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import API from '../services/api';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Input Form States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [showManageCategories, setShowManageCategories] = useState(false);
  
  // Inline Edit States
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter, Sort & Pagination States
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const LIMIT = 5;

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        let taskUrl = `/tasks/get?page=${currentPage}&limit=${LIMIT}&sortBy=${sortBy}`;
        if (searchQuery) {
          taskUrl += `&search=${searchQuery}`;
        }
        if (statusFilter === 'completed') {
          taskUrl += `&isCompleted=true`;
        } else if (statusFilter === 'incomplete') {
          taskUrl += `&isCompleted=false`;
        }
        if (activeCategoryFilter) {
          taskUrl += `&categoryId=${activeCategoryFilter}`;
        }
        
        const [taskRes, catRes] = await Promise.all([
          API.get(taskUrl),
          API.get('/categories/get')
        ]);

        if (active) {
          setTasks(taskRes.data.data || taskRes.data);
          setCategories(catRes.data.data || catRes.data);
          setTotalTasks(taskRes.data.totalTasks || 0);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading data:', error.message);
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [searchQuery, currentPage, sortBy, statusFilter, activeCategoryFilter, refreshTrigger]);

  // Handle Category Submission
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const { data } = await API.post('/categories/create', { name: newCatName, color: newCatColor });
      setCategories((prev) => [...prev, data.data]);
      setNewCatName('');
    } catch (error) {
      console.error('Error creating category:', error.response?.data?.message || error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await API.delete(`/categories/delete/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.category?._id === id || t.category === id ? { ...t, category: null } : t
        )
      );
    } catch (error) {
      console.error('Error deleting category:', error.message);
    }
  };

  // Handle Task Submission
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await API.post('/tasks/create', { 
        title: newTaskTitle,
        category: selectedCategory || null 
      });
      
      // Refresh tasks list to pull populated category properties properly
      setRefreshTrigger((prev) => prev + 1);
      setNewTaskTitle('');
      setSelectedCategory('');
    } catch (error) {
      console.error('Error creating task:', error.message);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const { data } = await API.put(`/tasks/update/${id}`, { isCompleted: !currentStatus });
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, isCompleted: data.data.isCompleted } : t)));
    } catch (error) {
      console.error('Error updating task:', error.message);
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
  };

  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) return;
    try {
      const { data } = await API.put(`/tasks/update/${id}`, { title: editTitle });
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, title: data.data.title } : t)));
      setEditingTaskId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Error saving edited task:', error.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/tasks/delete/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error.message);
    }
  };

  const totalPages = Math.ceil(totalTasks / LIMIT);

  return (
    <div className="dashboard-container">
      {/* Header Panel */}
      <header className="db-header">
        <h3>Welcome, {user?.username}!</h3>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="db-controls">
        {/* Category Creation Form */}
        <form onSubmit={handleCreateCategory} className="category-form">
          <input
            type="text"
            placeholder="New Category Label..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="task-input"
          />
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="color-picker"
          />
          <button type="submit" className="add-btn" style={{ backgroundColor: '#3b82f6' }}>Create Tag</button>
          <button 
            type="button" 
            onClick={() => setShowManageCategories(prev => !prev)} 
            className="manage-tags-btn"
            style={{ backgroundColor: showManageCategories ? '#6b7280' : '#ef4444' }}
          >
            {showManageCategories ? 'Close' : 'Delete Tag'}
          </button>
        </form>

        {/* Collapsible Category List */}
        {showManageCategories && (
          <div className="category-management-panel">
            <span className="panel-title">Existing Tags (Click ✕ to delete):</span>
            {categories.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>No categories created yet.</p>
            ) : (
              <div className="category-list">
                {categories.map((cat) => (
                  <div 
                    key={cat._id} 
                    className="category-chip" 
                    style={{ backgroundColor: cat.color || '#3b82f6' }}
                  >
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat._id);
                      }}
                      className="category-delete-btn"
                      title={`Delete ${cat.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Task Creation Form */}
        <form onSubmit={handleCreateTask} className="task-form">
          <div className="task-form-row">
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="task-input"
              />
              <button type="submit" className="add-btn">Add Task</button>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">Assign Optional Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Search Filter Bar & Sorting Dropdown */}
        <div className="filter-row">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
              setLoading(true);
            }}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
              setLoading(true);
            }}
            className="sort-select"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
          <select
            value={activeCategoryFilter}
            onChange={(e) => {
              setActiveCategoryFilter(e.target.value);
              setCurrentPage(1);
              setLoading(true);
            }}
            className="sort-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
              setLoading(true);
            }}
            className="sort-select"
          >
            <option value="createdAt:asc">Oldest First</option>
            <option value="createdAt:desc">Newest First</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <p>Updating view data list...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-text">No tasks found. Create items or labels above!</p>
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
                {editingTaskId === task._id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(task._id);
                      else if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="edit-input"
                    autoFocus
                  />
                ) : (
                  <span 
                    className={task.isCompleted ? "task-text-completed" : "task-text"}
                    onClick={() => handleStartEdit(task)}
                    style={{ cursor: 'pointer' }}
                    title="Click to edit task title"
                  >
                    {task.title}
                  </span>
                )}
                {task.category && (
                  <span 
                    className="category-badge" 
                    style={{ backgroundColor: task.category.color || '#9ca3af', cursor: 'pointer' }}
                    onClick={() => {
                      setActiveCategoryFilter(prev => prev === task.category._id ? '' : task.category._id);
                      setCurrentPage(1);
                    }}
                    title={`Filter by ${task.category.name}`}
                  >
                    {task.category.name}
                  </span>
                )}
              </div>
              {editingTaskId === task._id ? (
                <div className="edit-actions">
                  <button onClick={() => handleSaveEdit(task._id)} className="save-btn">
                    Save
                  </button>
                  <button onClick={handleCancelEdit} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleStartEdit(task)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTask(task._id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
              setLoading(true);
            }}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.min(prev + 1, totalPages));
              setLoading(true);
            }}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}