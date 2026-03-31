import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

function validateEmail(email) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!form.email) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    // Clear error on type
    if (errors[field]) setErrors({ ...errors, [field]: '' });
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setApiError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Zap size={32} />
          <h1>TaskFlow AI</h1>
        </div>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your workspace</p>

        {apiError && (
          <div className="error-alert">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="field-group">
            <div className={`input-group ${errors.email ? 'input-error' : form.email && validateEmail(form.email) ? 'input-success' : ''}`}>
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
              />
              {form.email && validateEmail(form.email) && (
                <CheckCircle size={16} className="input-check" />
              )}
            </div>
            {errors.email && (
              <p className="field-error"><AlertCircle size={13} />{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="field-group">
            <div className={`input-group ${errors.password ? 'input-error' : ''}`}>
              <Lock size={18} className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="field-error"><AlertCircle size={13} />{errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div style={{ textAlign: 'right', marginTop: '-6px' }}>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}