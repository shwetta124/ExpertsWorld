// 📁 CREATE THIS FILE AT:
// frontend/src/pages/BookingPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CheckCircle, Loader } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { expertAPI, sessionAPI } from '../services/api';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM',
];

const categoryColors = {
  dev:        { color: '#3B82F6', bg: '#EFF6FF' },
  design:     { color: '#EC4899', bg: '#FDF2F8' },
  blockchain: { color: '#8B5CF6', bg: '#F5F3FF' },
  dsa:        { color: '#10B981', bg: '#ECFDF5' },
  system:     { color: '#F59E0B', bg: '#FFFBEB' },
  ai:         { color: '#06B6D4', bg: '#ECFEFF' },
  other:      { color: '#6B7280', bg: '#F9FAFB' },
};

export default function BookingPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [expert,       setExpert]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [topic,        setTopic]        = useState('');
  const [step,         setStep]         = useState('pick'); // pick | confirm | success
  const [booking,      setBooking]      = useState(false);

  // Generate next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  useEffect(() => {
    expertAPI.getById(id)
      .then(res => {
        const e = res.data.expert;
        const colors = categoryColors[e.category] || categoryColors.other;
        setExpert({ ...e, color: colors.color, bg: colors.bg });
      })
      .catch(() => { toast.error('Expert not found'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !topic.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setBooking(true);
    // In real app: call booking API
    await new Promise(r => setTimeout(r, 1500));
    setBooking(false);
    setStep('success');
    toast.success('Session booked successfully!');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader size={28} color="var(--brand)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back to expert
        </button>

        {/* Expert mini card */}
        {expert && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: expert.bg, color: expert.color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {expert.name?.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{expert.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{expert.role}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--brand)' }}>₹{expert.price}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>per session</div>
            </div>
          </div>
        )}

        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem' }}>
          {[['pick', 'Select Slot'], ['confirm', 'Confirm'], ['success', 'Booked!']].map(([s, label], i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step === s ? 'var(--brand)' : ['pick','confirm','success'].indexOf(step) > i ? 'var(--success)' : 'var(--surface2)',
                  color: step === s || ['pick','confirm','success'].indexOf(step) > i ? 'white' : 'var(--text3)',
                  fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid',
                  borderColor: step === s ? 'var(--brand)' : ['pick','confirm','success'].indexOf(step) > i ? 'var(--success)' : 'var(--border)',
                }}>
                  {['pick','confirm','success'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: step === s ? 600 : 400, color: step === s ? 'var(--text)' : 'var(--text3)' }}>
                  {label}
                </span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Pick slot ── */}
        {step === 'pick' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="var(--brand)" /> Select Date & Time
            </h2>

            {/* Date picker */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: 'var(--text2)' }}>Choose a date</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {days.map(d => (
                  <button key={d.value} onClick={() => setSelectedDate(d.value)} style={{
                    flexShrink: 0, padding: '8px 14px',
                    borderRadius: 'var(--r-md)', border: '1.5px solid',
                    borderColor: selectedDate === d.value ? 'var(--brand)' : 'var(--border)',
                    background:  selectedDate === d.value ? 'var(--brand)' : 'var(--surface)',
                    color:       selectedDate === d.value ? 'white' : 'var(--text2)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s',
                    textAlign: 'center',
                  }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} /> Available time slots
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px,1fr))', gap: 8 }}>
                  {TIME_SLOTS.map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)} style={{
                      padding: '8px', borderRadius: 'var(--r-sm)', border: '1.5px solid',
                      borderColor: selectedTime === t ? 'var(--brand)' : 'var(--border)',
                      background:  selectedTime === t ? 'var(--brand-light)' : 'var(--surface)',
                      color:       selectedTime === t ? 'var(--brand)' : 'var(--text2)',
                      fontSize: 12, fontWeight: selectedTime === t ? 600 : 400,
                      cursor: 'pointer', transition: 'all .15s',
                    }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Topic */}
            {selectedDate && selectedTime && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text2)' }}>
                  What do you need help with?
                </div>
                <textarea value={topic} onChange={e => setTopic(e.target.value)}
                  placeholder="Describe your problem or what you want to learn..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--surface2)', fontSize: 13, color: 'var(--text)', resize: 'vertical', fontFamily: 'var(--font-body)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            )}

            <button
              onClick={() => selectedDate && selectedTime && topic.trim() && setStep('confirm')}
              disabled={!selectedDate || !selectedTime || !topic.trim()}
              style={{
                width: '100%', background: !selectedDate || !selectedTime || !topic.trim() ? 'var(--border2)' : 'var(--brand)',
                color: 'white', border: 'none', borderRadius: 99,
                padding: '13px', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                cursor: !selectedDate || !selectedTime || !topic.trim() ? 'not-allowed' : 'pointer',
              }}>
              Continue to Confirm →
            </button>
          </div>
        )}

        {/* ── Step 2: Confirm ── */}
        {step === 'confirm' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: '1.5rem' }}>
              Confirm Booking
            </h2>

            {/* Summary */}
            <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Expert', value: expert?.name },
                { label: 'Date', value: new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) },
                { label: 'Time', value: selectedTime },
                { label: 'Topic', value: topic },
                { label: 'Amount', value: `₹${expert?.price}`, highlight: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: item.highlight ? 700 : 500, color: item.highlight ? 'var(--brand)' : 'var(--text)', maxWidth: '60%', textAlign: 'right' }}>
                    {item.highlight
                      ? <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{item.value}</span>
                      : item.value
                    }
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: '1.2rem', display: 'flex', gap: 6 }}>
              <span>ℹ️</span>
              <span>Payment will be held in escrow and released to the expert after your session is completed.</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('pick')} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 99, padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                ← Change Slot
              </button>
              <button onClick={handleConfirmBooking} disabled={booking} style={{ flex: 2, background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '12px', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, cursor: booking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {booking
                  ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Booking...</>
                  : `Pay ₹${expert?.price} & Book`
                }
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === 'success' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={32} color="var(--success)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Session Booked! 🎉
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: '0.5rem' }}>
              Your session with <strong>{expert?.name}</strong> is confirmed.
            </p>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: '2rem' }}>
              📅 {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {selectedTime}
            </p>

            <div style={{ background: 'var(--success-light)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: '1.5rem', fontSize: 13, color: 'var(--success)', fontWeight: 500 }}>
              ✅ You'll receive a reminder 30 minutes before the session
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => navigate('/history')} style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '11px 24px', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                View My Sessions
              </button>
              <button onClick={() => navigate('/dashboard')} style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 99, padding: '11px 24px', fontSize: 14, cursor: 'pointer' }}>
                Browse More
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}