import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css'; // Import the clean stylesheet

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = await register(formData.username, formData.email, formData.password);
    if (res.success) {
      setSuccess('Account registered successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <div className="auth-input-group">
          <label className="auth-label">Username</label>
          <input type="text" name="username" required value={formData.username} onChange={handleChange} className="auth-input" />
        </div>

        <div className="auth-input-group">
          <label className="auth-label">Email Address</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} className="auth-input" />
        </div>

        <div className="auth-input-group">
          <label className="auth-label">Password</label>
          <input type="password" name="password" required value={formData.password} onChange={handleChange} className="auth-input" />
        </div>

        <button type="submit" className="auth-button">Sign Up</button>
        <p className="auth-switch-text">Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
      </form>
    </div>
  );
}