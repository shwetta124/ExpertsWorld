import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Video, MessageSquare, Share2, Heart, Loader, Calendar } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import PaymentModal from '../components/payment/PaymentModal';
import { expertAPI } from '../services/api';
import toast from 'react-hot-toast';

const categoryColors = {
  dev:        { color: '#3B82F6', bg: '#EFF6FF' },
  design:     { color: '#EC4899', bg: '#FDF2F8' },
  blockchain: { color: '#8B5CF6', bg: '#F5F3FF' },
  dsa:        { color: '#10B981', bg: '#ECFDF5' },
  system:     { color: '#F59E0B', bg: '#FFFBEB' },
  ai:         { color: '#06B6D4', bg: '#ECFEFF' },
  other:      { color: '#6B7280', bg: '#F9FAFB' },
};

function Stars({ rating, size = 14 }) {
  const full  = Math.floor(rating || 0);
  const empty = 5 - full;
  return (
    <span style={{ color: '#F59E0B', fontSize: size }}>
      {'★'.repeat(full)}{'☆'.repeat(empty)}
    </span>
  );
}

export default function ExpertDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [expert,      setExpert]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [reviewText,  setReviewText]  = useState('');
  const [newRating,   setNewRating]   = useState(5);
  const [liked,       setLiked]       = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        const { data } = await expertAPI.getById(id);
        const e = data.expert;
        const colors = categoryColors[e.category] || categoryColors.other;
        setExpert({ ...e, color: colors.color, bg: colors.bg });
      } catch (err) {
        toast.error('Expert not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [id]);

  const submitReview = async () => {
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await expertAPI.addReview(id, { rating: newRating, text: reviewText });
      setExpert(prev => ({ ...prev, reviews: data.reviews, rating: data.rating }));
      setReviewText('');
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '6rem' }}>
          <Loader size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading expert...</div>
        </div>
      </div>
    );
  }

  if (!expert) return null;

  const initials   = expert.name?.split(' ').map(n => n[0]).join('') || 'EX';
  const color      = expert.color || '#3B82F6';
  const isOnline   = expert.isOnline || false;
  const reviewList = Array.isArray(expert.reviews) ? expert.reviews : [];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none',
          color: 'var(--text2)', fontSize: 13, cursor: 'pointer', marginBottom: '1.5rem',
        }}>
          <ArrowLeft size={14} /> Back to experts
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

          {/* ── Left column ── */}
          <div>

            {/* Profile card */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: '1.5rem' }}>

              {/* Hero */}
              <div style={{ background: color, padding: '2.5rem 2rem', position: 'relative' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 88, height: 88, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.95)', color,
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden',
                    }}>
                      {expert.avatar
                        ? <img src={expert.avatar} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : initials
                      }
                    </div>
                    {isOnline && (
                      <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, background: '#10B981', borderRadius: '50%', border: '3px solid var(--surface)' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 4 }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                      {expert.name}
                    </h1>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{expert.role}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <Stars rating={expert.rating} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{expert.rating}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>({reviewList.length} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setLiked(v => !v)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={14} fill={liked ? 'white' : 'none'} color="white" />
                  </button>
                  <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Share2 size={14} color="white" />
                  </button>
                </div>
              </div>

              <div style={{ padding: '1.5rem' }}>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Experience', val: expert.experience, icon: <Clock size={14} color={color} /> },
                    { label: 'Sessions',   val: expert.sessions,   icon: <Users size={14} color={color} /> },
                    { label: 'Location',   val: (expert.location || 'India').split(',')[0], icon: <MapPin size={14} color={color} /> },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 'var(--r-md)', padding: '0.8rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* About */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>About</h3>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{expert.about}</p>
                </div>

                {/* Tags */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Expertise</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(expert.tags || []).map(t => (
                      <span key={t} style={{
                        background: expert.bg || '#EFF6FF', color,
                        border: `1px solid ${color}40`,
                        padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Session types */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Session types</h3>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { icon: <Video size={14} />,         label: 'Video call'   },
                      { icon: <MessageSquare size={14} />, label: 'Live chat'    },
                      { icon: <span style={{ fontSize: 12 }}>🖥</span>, label: 'Screen share' },
                    ].map(t => (
                      <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', borderRadius: 99, padding: '6px 12px', fontSize: 12, color: 'var(--text2)' }}>
                        {t.icon} {t.label}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Reviews section */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: '1.2rem' }}>
                Reviews <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 400 }}>({reviewList.length})</span>
              </h3>

              {reviewList.length > 0 ? reviewList.map((r, i) => (
                <div key={r._id || i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.userName || r.user?.name || 'Anonymous'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                  <Stars rating={r.rating} size={12} />
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4, lineHeight: 1.6 }}>{r.text}</p>
                </div>
              )) : (
                <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: '1rem' }}>No reviews yet. Be the first!</p>
              )}

              {/* Add review */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Add your review</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} onClick={() => setNewRating(i)} style={{
                      background: 'none', border: 'none', fontSize: 22,
                      cursor: 'pointer', color: i <= newRating ? '#F59E0B' : 'var(--border2)',
                      transition: 'all .15s',
                    }}>★</button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience with this expert..."
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
                    background: 'var(--surface2)', fontSize: 13, color: 'var(--text)',
                    resize: 'vertical', minHeight: 80, fontFamily: 'var(--font-body)',
                  }}
                />
                <button
                  onClick={submitReview}
                  disabled={submitting || !reviewText.trim()}
                  style={{
                    marginTop: 8,
                    background: submitting ? 'var(--border2)' : 'var(--brand)',
                    color: 'white', border: 'none', borderRadius: 99,
                    padding: '8px 20px', fontSize: 13, fontWeight: 500,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>

          </div>

          {/* ── Right sticky card ── */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '1.5rem' }}>

              {/* Price */}
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text)' }}>
                  ₹{expert.price}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>per session</div>
              </div>

              {/* Features list */}
              <div style={{ marginBottom: '1.2rem' }}>
                {[
                  `${expert.experience} of experience`,
                  `${expert.sessions} sessions completed`,
                  isOnline ? '🟢 Available now' : '🔴 Currently offline',
                  `Languages: ${(expert.languages || ['English']).join(', ')}`,
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--text2)' }}>
                    <div style={{ width: 4, height: 4, background: color, borderRadius: '50%', flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              {/* ── Pay & Start button ── */}
              <button
                onClick={() => isOnline && setShowPayment(true)}
                style={{
                  width: '100%',
                  background: isOnline ? color : 'var(--border2)',
                  color: 'white', border: 'none', borderRadius: 99,
                  padding: '14px', fontFamily: 'var(--font-display)',
                  fontSize: 15, fontWeight: 700,
                  cursor: isOnline ? 'pointer' : 'not-allowed',
                  marginBottom: 10, transition: 'all .2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={e => isOnline && (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {isOnline ? `⚡ Pay ₹${expert.price} & Start Now` : 'Expert Offline'}
              </button>

              {/* ── Schedule for Later button (NOW LINKS TO BOOKING PAGE) ── */}
              <button
                onClick={() => navigate(`/expert/${id}/book`)}
                style={{
                  width: '100%', background: 'none',
                  border: `1.5px solid ${color}`,
                  color, borderRadius: 99, padding: '11px',
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all .2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginBottom: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <Calendar size={15} /> Schedule for Later
              </button>

              {/* Trust badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: '0.5rem', fontSize: 11, color: 'var(--text3)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Escrow-protected · 100% refund if no-show
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          expert={expert}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}