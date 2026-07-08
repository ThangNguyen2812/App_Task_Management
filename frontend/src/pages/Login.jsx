import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css'; // Import the clean stylesheet

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login(formData.username, formData.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-input-group">
          <label className="auth-label">Username</label>
          <input type="text" name="username" required value={formData.username} onChange={handleChange} className="auth-input" />
        </div>

        <div className="auth-input-group">
          <label className="auth-label">Password</label>
          <input type="password" name="password" required value={formData.password} onChange={handleChange} className="auth-input" />
        </div>

        <button type="submit" className="auth-button">Sign In</button>
        <p className="auth-switch-text">Don't have an account? <Link to="/register" className="auth-link">Register here</Link></p>
      </form>
    </div>
  );
}