import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState('form'); // form | verify

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strengthColor = ['var(--border2)', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'][strength()];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength()];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await signup({
      name:     form.name,
      email:    form.email,
      password: form.password,
    });
    if (result.success) {
      setStep('verify');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse);
    if (result?.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google signup failed. Please try again.');
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px 11px 42px',
    border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
    background: 'var(--surface2)', fontSize: 14, color: 'var(--text)',
    transition: 'all .2s',
  };

  // ── Email verification screen ────────────────────────────
  if (step === 'verify') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 72, height: 72, background: 'var(--success-light)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1.5rem',
          }}>
            <CheckCircle size={32} color="var(--success)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Check your email!
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: '1.5rem' }}>
            We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'var(--brand)', color: 'white', border: 'none',
              borderRadius: 'var(--r-sm)', padding: '12px 28px',
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
            }}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Signup form ──────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--brand)', textDecoration: 'none' }}>
            ExpertsWorld
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginTop: '1rem', marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Join 12,000+ learners today. It's free.</p>
        </div>

        {/* Google Signup Button */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="rectangular"
            size="large"
            width="368"
            text="signup_with"
            logo_alignment="left"
          />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>or with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Full Name */}
          <div style={{ position: 'relative' }}>
            <User size={15} color="var(--text3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Full name"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={15} color="var(--text3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              placeholder="Email address"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Password with strength meter */}
          <div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={15} color="var(--text3)" /> : <Eye size={15} color="var(--text3)" />}
              </button>
            </div>

            {/* Password strength */}
            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 99,
                      background: i <= strength() ? strengthColor : 'var(--border)',
                      transition: 'all .3s',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: strengthColor, fontWeight: 500 }}>{strengthLabel}</div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={15} color="var(--text3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              placeholder="Confirm password"
              required
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              style={{
                ...inputStyle,
                borderColor: form.confirm && form.confirm !== form.password ? '#EF4444' : 'var(--border)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = form.confirm !== form.password ? '#EF4444' : 'var(--border)'}
            />
          </div>

          {/* Password match error */}
          {form.confirm && form.confirm !== form.password && (
            <div style={{ fontSize: 11, color: '#EF4444', marginTop: -8 }}>
              Passwords do not match
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: 'var(--brand)', color: 'white',
              border: 'none', borderRadius: 'var(--r-sm)',
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.8 : 1, transition: 'all .2s',
            }}>
            {loading
              ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Creating account...</>
              : 'Create account'
            }
          </button>
        </form>

        {/* Sign in link */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign in</Link>
        </p>

      </div>
    </div>
  );
}