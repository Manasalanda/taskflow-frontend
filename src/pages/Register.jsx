import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

function validateEmail(email) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!form.username) {
      newErrors.username = 'Username is required.';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Only letters, numbers, and underscores allowed.';
    }
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
    if (!form.password2) {
      newErrors.password2 = 'Please confirm your password.';
    } else if (form.password !== form.password2) {
      newErrors.password2 = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
    setApiError('');
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: '#f87171', width: '20%' };
    if (p.length < 8) return { label: 'Weak', color: '#fb923c', width: '40%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Medium', color: '#fbbf24', width: '65%' };
    return { label: 'Strong', color: '#4ade80', width: '100%' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setApiError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(fieldErrors);
      } else {
        setApiError('Registration failed. Please try again.');
      }
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
        <h2>Create your account</h2>
        <p className="auth-subtitle">Start managing smarter</p>

        {apiError && (
          <div className="error-alert">
            <AlertCircle size={16} /> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          {/* Username */}
          <div className="field-group">
            <div className={`input-group ${errors.username ? 'input-error' : form.username.length >= 3 ? 'input-success' : ''}`}>
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={e => handleChange('username', e.target.value)}
              />
              {form.username.length >= 3 && !errors.username && (
                <CheckCircle size={16} className="input-check" />
              )}
            </div>
            {errors.username && (
              <p className="field-error"><AlertCircle size={13} />{errors.username}</p>
            )}
          </div>

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
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password Strength Bar */}
            {strength && (
              <div className="strength-bar-container">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ width: strength.width, background: strength.color }}
                  />
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
            {errors.password && (
              <p className="field-error"><AlertCircle size={13} />{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <div className={`input-group ${errors.password2 ? 'input-error' : form.password2 && form.password === form.password2 ? 'input-success' : ''}`}>
              <Lock size={18} className="input-icon" />
              <input
                type={showPass2 ? 'text' : 'password'}
                placeholder="Confirm password"
                value={form.password2}
                onChange={e => handleChange('password2', e.target.value)}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass2(!showPass2)}>
                {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password2 && (
              <p className="field-error"><AlertCircle size={13} />{errors.password2}</p>
            )}
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}