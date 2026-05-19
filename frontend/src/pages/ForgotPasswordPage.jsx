import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('OTP sent to your email');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)', marginBottom: '2rem', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to login
        </Link>

        {!sent ? (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Reset your password</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: '2rem', lineHeight: 1.6 }}>
              Enter your email and we'll send you a 6-digit OTP to reset your password.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
                <Mail size={15} color="var(--text3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" placeholder="Email address" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px 11px 42px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--surface2)', fontSize: 14, color: 'var(--text)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', background: 'var(--brand)', color: 'white',
                border: 'none', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-display)',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loading
                  ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Sending OTP...</>
                  : 'Send OTP'
                }
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={28} color="var(--success)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>OTP sent!</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Check <strong>{email}</strong> for a 6-digit code. Enter it below to reset your password.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '1.5rem' }}>
              {[...Array(6)].map((_, i) => (
                <input key={i} type="text" maxLength={1} style={{
                  width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 700,
                  border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
                  background: 'var(--surface2)', color: 'var(--text)',
                }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  onInput={e => { if (e.target.value && e.target.nextSibling) e.target.nextSibling.focus(); }} />
              ))}
            </div>
            <button style={{
              width: '100%', padding: '13px', background: 'var(--brand)', color: 'white',
              border: 'none', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-display)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>Verify & Reset Password</button>
            <button onClick={() => setSent(false)} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}>
              Didn't receive it? Resend
            </button>
          </div>
        )}
      </div>
    </div>
  );
}