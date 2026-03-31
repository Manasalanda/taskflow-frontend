import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Zap, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle, ArrowLeft, KeyRound
} from 'lucide-react';

function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Step 1: Enter email
function EmailStep({ onNext }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required.'); return; }
    if (!validateEmail(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/users/forgot-password/', { email });
      onNext(email);
    } catch (err) {
      setError(err.response?.data?.email?.[0] || err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="otp-step-header">
        <div className="otp-step-icon"><Mail size={28} /></div>
        <h2>Forgot Password?</h2>
        <p className="auth-subtitle">Enter your registered email to receive an OTP</p>
      </div>

      {error && <div className="error-alert"><AlertCircle size={16} />{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field-group">
          <div className={`input-group ${error ? 'input-error' : email && validateEmail(email) ? 'input-success' : ''}`}>
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Registered email address"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
            {email && validateEmail(email) && <CheckCircle size={16} className="input-check" />}
          </div>
        </div>
        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
    </>
  );
}

// Step 2: Enter OTP
function OTPStep({ email, onNext, onResend }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    // Auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) { setError('Enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/users/verify-otp/', { email, otp: otpString });
      onNext(otpString);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/users/forgot-password/', { email });
      setResent(true);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="otp-step-header">
        <div className="otp-step-icon"><KeyRound size={28} /></div>
        <h2>Enter OTP</h2>
        <p className="auth-subtitle">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      {error && <div className="error-alert"><AlertCircle size={16} />{error}</div>}
      {resent && <div className="success-alert"><CheckCircle size={16} />New OTP sent to your email!</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={`otp-box ${error ? 'otp-error' : digit ? 'otp-filled' : ''}`}
            />
          ))}
        </div>

        <p className="otp-hint">Code expires in 10 minutes</p>

        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button
          type="button"
          className="btn-secondary btn-full"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? 'Resending...' : 'Resend OTP'}
        </button>
      </form>
    </>
  );
}

// Step 3: Reset Password
function ResetStep({ email, otp }) {
  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const getStrength = () => {
    const p = form.new_password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: '#f87171', width: '20%' };
    if (p.length < 8) return { label: 'Weak', color: '#fb923c', width: '40%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Medium', color: '#fbbf24', width: '65%' };
    return { label: 'Strong', color: '#4ade80', width: '100%' };
  };

  const strength = getStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.new_password !== form.confirm_password) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/users/reset-password/', { email, otp, ...form });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-screen">
        <CheckCircle size={56} color="#4ade80" />
        <h2>Password Reset!</h2>
        <p>Your password has been reset successfully.</p>
        <p className="redirect-note">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <div className="otp-step-header">
        <div className="otp-step-icon"><Lock size={28} /></div>
        <h2>New Password</h2>
        <p className="auth-subtitle">Create a strong new password</p>
      </div>

      {error && <div className="error-alert"><AlertCircle size={16} />{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field-group">
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="New password"
              value={form.new_password}
              onChange={e => { setForm({ ...form, new_password: e.target.value }); setError(''); }}
            />
            <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {strength && (
            <div className="strength-bar-container">
              <div className="strength-bar">
                <div className="strength-fill" style={{ width: strength.width, background: strength.color }} />
              </div>
              <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
        </div>

        <div className="field-group">
          <div className={`input-group ${form.confirm_password && form.new_password === form.confirm_password ? 'input-success' : ''}`}>
            <Lock size={18} className="input-icon" />
            <input
              type={showPass2 ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={form.confirm_password}
              onChange={e => { setForm({ ...form, confirm_password: e.target.value }); setError(''); }}
            />
            <button type="button" className="eye-btn" onClick={() => setShowPass2(!showPass2)}>
              {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </>
  );
}

// Main component
export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const steps = ['Email', 'OTP', 'Reset'];

  return (
    <div className="auth-page">
      <div className="auth-card forgot-card">
        <div className="auth-logo">
          <Zap size={28} />
          <span className="logo-text">TaskFlow AI</span>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          {steps.map((label, i) => (
            <div key={i} className="step-item">
              <div className={`step-dot ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`step-label ${step === i + 1 ? 'active' : ''}`}>{label}</span>
              {i < steps.length - 1 && <div className={`step-line ${step > i + 1 ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <EmailStep onNext={(e) => { setEmail(e); setStep(2); }} />
        )}
        {step === 2 && (
          <OTPStep
            email={email}
            onNext={(o) => { setOtp(o); setStep(3); }}
            onResend={() => {}}
          />
        )}
        {step === 3 && (
          <ResetStep email={email} otp={otp} />
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" className="back-link">
            <ArrowLeft size={15} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}