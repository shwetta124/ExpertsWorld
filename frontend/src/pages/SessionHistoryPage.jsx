import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Download, MessageSquare, Video, Loader, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import { sessionAPI } from '../services/api';
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

export default function SessionHistoryPage() {
  const navigate = useNavigate();

  const [sessions,      setSessions]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [filter,        setFilter]        = useState('all');
  const [ratingSession, setRatingSession] = useState(null);
  const [myRating,      setMyRating]      = useState(5);
  const [ratingText,    setRatingText]    = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [retryCount,    setRetryCount]    = useState(0);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await sessionAPI.getMySessions();
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Load sessions error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load sessions';
      setError(msg);
      // Don't show toast on initial load — show inline error instead
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [retryCount]);

  const filtered = filter === 'all'
    ? sessions
    : sessions.filter(s => s.status === filter);

  const totalSpent = sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const handleSubmitRating = async () => {
    if (!ratingSession) return;
    setSubmitting(true);
    try {
      await sessionAPI.rate(ratingSession._id, { rating: myRating, review: ratingText });
      setSessions(prev => prev.map(s =>
        s._id === ratingSession._id
          ? { ...s, userRating: myRating, userReview: ratingText }
          : s
      ));
      toast.success('Rating submitted! ⭐');
      setRatingSession(null);
      setRatingText('');
      setMyRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const tabStyle = (tab) => ({
    padding: '7px 18px', borderRadius: 99, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: 'none', transition: 'all .2s',
    background: filter === tab ? 'var(--brand)' : 'transparent',
    color:      filter === tab ? 'white' : 'var(--text2)',
  });

  const statusColors = {
    completed: { bg: 'var(--success-light)', color: 'var(--success)',  label: '✅ Completed' },
    pending:   { bg: 'var(--accent-light)',   color: '#92400E',         label: '⏳ Pending'   },
    accepted:  { bg: 'var(--brand-light)',    color: 'var(--brand)',    label: '🔵 Active'    },
    rejected:  { bg: 'var(--danger-light)',   color: 'var(--danger)',   label: '❌ Rejected'  },
    cancelled: { bg: 'var(--surface2)',       color: 'var(--text3)',    label: '⚫ Cancelled' },
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Rating Popup */}
      {ratingSession && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', padding: '2rem', maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: '1rem' }}>⭐</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Rate your session</h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1.2rem' }}>
              How was your session with <strong>{ratingSession.expert?.name || 'the expert'}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setMyRating(i)} style={{ background: 'none', border: 'none', fontSize: 36, cursor: 'pointer', color: i <= myRating ? '#F59E0B' : 'var(--border2)', transition: 'all .15s' }}>★</button>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: '1rem' }}>
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][myRating]}
            </div>
            <textarea
              value={ratingText}
              onChange={e => setRatingText(e.target.value)}
              placeholder="Share your experience (optional)..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--surface2)', fontSize: 13, color: 'var(--text)', resize: 'none', fontFamily: 'var(--font-body)', marginBottom: '1.2rem' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setRatingSession(null); setRatingText(''); setMyRating(5); }} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 99, padding: '11px', fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSubmitRating} disabled={submitting} style={{ flex: 2, background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.8 : 1 }}>
                {submitting ? 'Submitting...' : `Submit ${myRating}★ Rating`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>Session History</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{sessions.length} total sessions</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Retry button */}
            <button
              onClick={() => setRetryCount(c => c + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 99, padding: '7px 14px', fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
              <RefreshCw size={12} /> Refresh
            </button>
            <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--r-md)', padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--success)', marginBottom: 2 }}>Total Spent</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--success)' }}>
                ₹{totalSpent.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', borderRadius: 99, padding: 4, width: 'fit-content', marginBottom: '1.5rem' }}>
          {[['all', 'All'], ['completed', 'Completed'], ['pending', 'Pending'], ['accepted', 'Active'], ['rejected', 'Rejected']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={tabStyle(id)}>{label}</button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text3)' }}>
            <Loader size={28} color="var(--brand)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: 14 }}>Loading sessions...</div>
          </div>
        ) : error ? (
          /* Error state with retry */
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: '1rem' }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Could not load sessions</div>
            <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: '1.5rem', background: 'var(--danger-light)', padding: '8px 16px', borderRadius: 8, display: 'inline-block' }}>
              {error}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => setRetryCount(c => c + 1)}
                style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '10px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto' }}>
                <RefreshCw size={13} /> Try Again
              </button>
            </div>
            <div style={{ marginTop: '1rem', fontSize: 12, color: 'var(--text3)' }}>
              Make sure backend is running on port 4000
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: '1rem' }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>No sessions yet</div>
            <div style={{ fontSize: 13 }}>Book your first session with an expert</div>
            <button onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '10px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Browse Experts
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(s => {
              const expert   = s.expert || {};
              const catColor = categoryColors[expert.category] || categoryColors.other;
              const status   = statusColors[s.status] || statusColors.cancelled;
              const initials = (expert.name || 'EX').split(' ').map(n => n[0]).join('');
              const date     = s.createdAt || s.requestedAt
                ? new Date(s.createdAt || s.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A';
              const canRate  = s.status === 'completed' && !s.userRating;
              const isActive = s.status === 'accepted';

              return (
                <div key={s._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem', borderLeft: `4px solid ${catColor.color}` }}>

                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: catColor.bg, color: catColor.color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {expert.avatar
                          ? <img src={expert.avatar} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : initials
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{expert.name || 'Expert'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{s.topic || 'General consultation'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                          {date} {s.duration ? `· ${s.duration} min` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>₹{s.amount}</div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: status.bg, color: status.color, fontWeight: 500 }}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Rating display */}
                  {s.userRating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.8rem', padding: '5px 10px', background: 'var(--accent-light)', borderRadius: 'var(--r-sm)', width: 'fit-content' }}>
                      <span style={{ color: '#F59E0B' }}>{'★'.repeat(s.userRating)}</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>You rated {s.userRating}/5</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.8rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      {canRate && (
                        <button onClick={() => { setRatingSession(s); setMyRating(5); setRatingText(''); }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 99, padding: '6px 14px', fontSize: 12, color: '#92400E', fontWeight: 500, cursor: 'pointer' }}>
                          <Star size={12} /> Rate This Session
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isActive && (
                        <button onClick={() => navigate(`/video/${s._id}/${s._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                          <Video size={12} /> Join Video Call
                        </button>
                      )}
                      <button onClick={() => navigate(`/chat/${s._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--brand-light)', border: '1px solid var(--border3)', borderRadius: 99, padding: '6px 12px', fontSize: 12, color: 'var(--brand)', cursor: 'pointer' }}>
                        <MessageSquare size={12} /> Open Chat
                      </button>
                      <button onClick={() => toast('Receipt coming soon!', { icon: '📄' })} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: 'none', borderRadius: 99, padding: '6px 12px', fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
                        <Download size={12} /> Receipt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}