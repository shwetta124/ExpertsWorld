import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter email and password');
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success) {
      if (result.role === 'admin')       navigate('/admin');
      else if (result.role === 'expert') navigate('/expert-dashboard');
      else                               navigate('/dashboard');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse);
    if (result?.success) {
      if (result.role === 'admin')       navigate('/admin');
      else if (result.role === 'expert') navigate('/expert-dashboard');
      else                               navigate('/dashboard');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px 11px 42px',
    border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
    background: 'var(--surface2)', fontSize: 14, color: 'var(--text)',
    transition: 'all .2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* Left panel */}
      <div style={{
        flex: '0 0 420px', background: 'var(--brand)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 2.5rem',
      }} className="hide-mobile">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
          ExpertsWorld
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.7, marginBottom: '2rem' }}>
          Connect with verified experts for instant consultations — video, audio, chat and more.
        </p>
        {['2,400+ verified experts', '18K+ sessions completed', '4.9★ average rating'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Title */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>Sign in to your account to continue</p>
          </div>

          {/* Quick Demo Login */}
          <div style={{
            background: 'var(--accent-light)', border: '1px solid #FCD34D',
            borderRadius: 'var(--r-sm)', padding: '10px 14px', marginBottom: '1.5rem',
            fontSize: 12, color: '#92400E',
          }}>
            <strong>Quick Demo Login:</strong>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'User',   email: 'user@test.com',           password: 'Test@1234'  },
                { label: 'Expert', email: 'arjun@test.com',          password: 'Test@1234'  },
                { label: 'Admin',  email: 'admin@expertsworld.com',  password: 'Admin@1234' },
              ].map(r => (
                <button key={r.label}
                  onClick={() => setForm({ email: r.email, password: r.password })}
                  style={{
                    padding: '4px 12px', borderRadius: 99, fontSize: 11,
                    fontWeight: 500, cursor: 'pointer', border: 'none',
                    background: 'var(--brand)', color: 'white',
                  }}>
                  {r.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: '#92400E' }}>
              Click a role to fill credentials, then click Sign in
            </div>
          </div>

          {/* Google Login Button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              shape="rectangular"
              size="large"
              width="368"
              text="continue_with"
              logo_alignment="left"
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Mail size={15} color="var(--text3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <Lock size={15} color="var(--text3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--brand)' }}>Forgot password?</Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', background: 'var(--brand)', color: 'white',
                border: 'none', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-display)',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.8 : 1, transition: 'all .2s',
              }}>
              {loading
                ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Signing in...</>
                : 'Sign in'
              }
            </button>
          </form>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: '1.5rem' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign up free</Link>
          </p>

        </div>
      </div>
    </div>
  );
}