import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, CheckCircle, Loader, User, Briefcase, DollarSign, FileText } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Profile', icon: <User size={16} /> },
  { id: 2, label: 'Expertise', icon: <Briefcase size={16} /> },
  { id: 3, label: 'Pricing', icon: <DollarSign size={16} /> },
  { id: 4, label: 'Documents', icon: <FileText size={16} /> },
];

const CATEGORIES = ['MERN Stack', 'Frontend Dev', 'Backend Dev', 'Blockchain', 'DSA / CP', 'System Design', 'UI/UX Design', 'AI / ML', 'DevOps', 'Mobile Dev'];

const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
  background: 'var(--surface2)', fontSize: 14, color: 'var(--text)',
  transition: 'all .2s',
};

export default function BecomeExpertPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '', bio: '', location: '', photo: null,
    category: '', skills: '', experience: '',
    about: '',
    price: '',
    paymentUPI: '', paymentBank: '',
    docId: null, docCert: null,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setSubmitting(false);
    setDone(true);
    toast.success('Application submitted! Admin will review within 24 hours.');
  };

  if (done) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={36} color="var(--success)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Our admin team will review your profile and documents within <strong>24 hours</strong>. You'll receive an email once approved.
          </p>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            {['Application under review', 'Document verification', 'Profile activation', 'Start earning!'].map((s, i) => (
              <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? 'var(--accent-light)' : 'var(--surface2)', border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i === 0 ? 'var(--accent-dark)' : 'var(--text3)' }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 13, color: i === 0 ? 'var(--text)' : 'var(--text3)', fontWeight: i === 0 ? 500 : 400 }}>{s}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '12px 28px', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Become an Expert</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: '2rem' }}>Join 2,400+ verified experts and start earning today.</p>

        {/* Step progress */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '2.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, left: '12.5%', right: '12.5%', height: 2, background: 'var(--border)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 16, left: '12.5%', width: `${((step - 1) / 3) * 75}%`, height: 2, background: 'var(--brand)', zIndex: 1, transition: 'width .4s' }} />
          {STEPS.map(s => (
            <div key={s.id} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', margin: '0 auto 8px',
                background: s.id <= step ? 'var(--brand)' : 'var(--surface)',
                border: `2px solid ${s.id <= step ? 'var(--brand)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.id <= step ? 'white' : 'var(--text3)',
                transition: 'all .3s',
              }}>
                {s.id < step ? <CheckCircle size={14} /> : s.icon}
              </div>
              <div style={{ fontSize: 11, color: s.id <= step ? 'var(--brand)' : 'var(--text3)', fontWeight: s.id === step ? 600 : 400 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '2rem' }}>

          {/* Step 1: Profile */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Your Profile</h2>

              {/* Photo upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: form.photo ? '#EFF6FF' : 'var(--surface2)', border: '2px dashed var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  {form.photo ? <span style={{ fontSize: 28 }}>📷</span> : <Upload size={20} color="var(--text3)" />}
                </div>
                <div>
                  <button onClick={() => set('photo', 'uploaded')} style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--border3)', borderRadius: 99, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                    Upload Photo
                  </button>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>JPG or PNG, max 2MB</div>
                </div>
              </div>

              <input placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <input placeholder="Location (e.g. Pune, India)" value={form.location} onChange={e => set('location', e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <textarea placeholder="Short bio (shown on your card)" value={form.bio} onChange={e => set('bio', e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          )}

          {/* Step 2: Expertise */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Your Expertise</h2>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Primary Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => set('category', c)} style={{
                      padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', border: '1.5px solid',
                      borderColor: form.category === c ? 'var(--brand)' : 'var(--border)',
                      background: form.category === c ? 'var(--brand)' : 'var(--surface)',
                      color: form.category === c ? 'white' : 'var(--text2)', transition: 'all .15s',
                    }}>{c}</button>
                  ))}
                </div>
              </div>

              <input placeholder="Skills (e.g. React, Node.js, MongoDB)" value={form.skills} onChange={e => set('skills', e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Years of Experience</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['1-2 years', '3-4 years', '5-6 years', '7+ years'].map(e => (
                    <button key={e} onClick={() => set('experience', e)} style={{
                      flex: 1, padding: '8px 0', borderRadius: 'var(--r-sm)', fontSize: 12, cursor: 'pointer', border: '1.5px solid',
                      borderColor: form.experience === e ? 'var(--brand)' : 'var(--border)',
                      background: form.experience === e ? 'var(--brand-light)' : 'var(--surface)',
                      color: form.experience === e ? 'var(--brand)' : 'var(--text2)', fontWeight: form.experience === e ? 600 : 400,
                    }}>{e}</button>
                  ))}
                </div>
              </div>

              <textarea placeholder="Detailed about section (shown on your expert profile)" value={form.about} onChange={e => set('about', e.target.value)} style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Pricing & Payments</h2>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Session Price (₹)</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {['299', '499', '699', '899', '1199'].map(p => (
                    <button key={p} onClick={() => set('price', p)} style={{
                      flex: 1, padding: '8px 0', borderRadius: 'var(--r-sm)', fontSize: 13, cursor: 'pointer', border: '1.5px solid',
                      borderColor: form.price === p ? 'var(--brand)' : 'var(--border)',
                      background: form.price === p ? 'var(--brand)' : 'var(--surface)',
                      color: form.price === p ? 'white' : 'var(--text2)', fontFamily: 'var(--font-display)', fontWeight: 600,
                    }}>₹{p}</button>
                  ))}
                </div>
                <input placeholder="Or enter custom price..." value={form.price} onChange={e => set('price', e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-md)', padding: '1rem', fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                💡 <strong>Platform fee:</strong> ExpertsWorld takes 15% per session. You keep <strong style={{ color: 'var(--success)' }}>85%</strong>.
                At ₹{form.price || '499'}/session you earn <strong>₹{Math.round((Number(form.price) || 499) * 0.85)}</strong>.
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Payout Method</label>
                <input placeholder="UPI ID (e.g. name@upi)" value={form.paymentUPI} onChange={e => set('paymentUPI', e.target.value)} style={{ ...inputStyle, marginBottom: 8 }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <input placeholder="Bank account number (optional)" value={form.paymentBank} onChange={e => set('paymentBank', e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Verification Documents</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>Upload documents to verify your identity and expertise. Reviewed within 24 hours.</p>

              {[
                { key: 'docId', label: 'Government ID', sub: 'Aadhaar / PAN / Passport', emoji: '🪪' },
                { key: 'docCert', label: 'Expertise Proof', sub: 'Certificate / LinkedIn / GitHub', emoji: '📜' },
              ].map(d => (
                <div key={d.key} onClick={() => set(d.key, 'uploaded')} style={{
                  border: `2px dashed ${form[d.key] ? 'var(--success)' : 'var(--border2)'}`,
                  borderRadius: 'var(--r-lg)', padding: '1.5rem', textAlign: 'center',
                  cursor: 'pointer', background: form[d.key] ? 'var(--success-light)' : 'var(--surface2)',
                  transition: 'all .2s',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{form[d.key] ? '✅' : d.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: form[d.key] ? 'var(--success)' : 'var(--text)' }}>
                    {form[d.key] ? 'Uploaded!' : d.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{form[d.key] ? 'Click to change' : d.sub}</div>
                </div>
              ))}

              <div style={{ background: 'var(--accent-light)', border: '1px solid #FCD34D', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
                🔒 Your documents are encrypted and only viewed by our admin team for verification. Never shared publicly.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid var(--border)', borderRadius: 99, padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--text2)' }}>
              <ArrowLeft size={14} /> {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {submitting ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Submitting...</> : <>Submit Application <CheckCircle size={14} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}