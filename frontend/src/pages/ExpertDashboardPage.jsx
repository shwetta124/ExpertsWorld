import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Star, CheckCircle, XCircle, Clock, ToggleLeft, ToggleRight, Loader } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { sessionAPI, expertAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
        <div style={{ width: 40, height: 40, background: color + '22', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>}
    </div>
  );
}

export default function ExpertDashboardPage() {
  const { user }            = useAuth();
  const { socket, emit }    = useSocket() || {};

  const [online,    setOnline]    = useState(true);
  const [requests,  setRequests]  = useState([]);
  const [stats,     setStats]     = useState(null);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  // ── Load initial data ──────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const [reqRes, dashRes] = await Promise.all([
          sessionAPI.getExpertRequests(),
          expertAPI.getDashboard(),
        ]);
        setRequests(reqRes.data.sessions || []);
        setStats(dashRes.data.stats);
        setSessions(dashRes.data.recentSessions || []);
        setOnline(dashRes.data.expert?.isOnline ?? true);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ── Real-time: listen for new requests via Socket.io ───────
  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = (request) => {
      // Add new request to top of list instantly
      setRequests(prev => {
        // Avoid duplicates
        const exists = prev.find(r => r._id === request.requestId);
        if (exists) return prev;
        return [{
          _id:         request.requestId,
          user:        { name: request.userName, avatar: request.userAvatar },
          topic:       request.topic,
          amount:      request.amount,
          status:      'pending',
          requestedAt: new Date(),
        }, ...prev];
      });

      // Show notification toast
      toast.custom((t) => (
        <div style={{
          background: 'var(--surface)',
          border: '2px solid var(--brand)',
          borderRadius: 14, padding: '14px 18px',
          maxWidth: 320, boxShadow: 'var(--shadow-lg)',
          opacity: t.visible ? 1 : 0, transition: 'opacity .3s',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 24 }}>🔔</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
              New Session Request!
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
              <strong>{request.userName}</strong> wants to connect
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
              📋 {request.topic}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
                ₹{request.amount}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>· Go to Requests tab</span>
            </div>
          </div>
        </div>
      ), { duration: 8000 });

      // Switch to requests tab automatically
      setActiveTab('requests');
    };

    socket.on('new_request', handleNewRequest);

    return () => {
      socket.off('new_request', handleNewRequest);
    };
  }, [socket]);

  // ── Real-time: emit availability when toggled ──────────────
  const handleToggleOnline = async () => {
    try {
      await expertAPI.setAvailability(!online);
      setOnline(v => !v);

      // Notify other clients via socket
      if (emit) {
        emit('set_availability', {
          expertId: user?.expertId || user?._id,
          online:   !online,
        });
      }

      toast.success(online ? '⚫ You are now offline' : '🟢 You are now online!');
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  // ── Accept / Reject request ────────────────────────────────
  const handleRequest = async (id, action) => {
    try {
      const session = await sessionAPI.respond(id, action);

      // Update local state
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: action } : r));

      // Notify user via socket
      if (emit) {
        const req = requests.find(r => r._id === id);
        emit('respond_request', {
          sessionId:  id,
          userId:     req?.user?._id,
          action,
          expertName: user?.name,
        });
      }

      toast.success(action === 'accepted'
        ? '✅ Request accepted! Session starting...'
        : '❌ Request declined'
      );
    } catch (err) {
      toast.error('Failed to respond to request');
    }
  };

  const tabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: 99, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: 'none', transition: 'all .2s',
    background: activeTab === tab ? 'var(--brand)' : 'transparent',
    color:      activeTab === tab ? 'white' : 'var(--text2)',
  });

  const statusColor = {
    pending:  { bg: 'var(--accent-light)',  color: '#92400E'        },
    accepted: { bg: 'var(--success-light)', color: 'var(--success)' },
    rejected: { bg: 'var(--danger-light)',  color: 'var(--danger)'  },
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
              Expert Dashboard
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>
              Manage your sessions and track earnings
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Socket connection indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: socket?.connected ? 'var(--success)' : 'var(--text3)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: socket?.connected ? 'var(--success)' : 'var(--border2)',
              }} />
              {socket?.connected ? 'Live' : 'Connecting...'}
            </div>

            {/* Online toggle */}
            <div
              onClick={handleToggleOnline}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 99, padding: '8px 16px', cursor: 'pointer',
                transition: 'all .2s',
              }}>
              {online
                ? <ToggleRight size={22} color="var(--success)" />
                : <ToggleLeft  size={22} color="var(--text3)"   />
              }
              <span style={{ fontSize: 13, fontWeight: 500, color: online ? 'var(--success)' : 'var(--text3)' }}>
                {online ? '🟢 Online' : '⚫ Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Loader size={28} color="var(--brand)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: '2rem' }}>
              <StatCard icon={<DollarSign size={18} color="#10B981"       />} label="Total Earned"   value={`₹${(stats?.totalEarned    || 0).toLocaleString()}`} sub="Lifetime earnings"                    color="#10B981"       />
              <StatCard icon={<Users      size={18} color="var(--brand)"  />} label="Total Sessions" value={stats?.totalSessions || 0}                             sub="All time"                             color="var(--brand)"  />
              <StatCard icon={<Star       size={18} color="#F59E0B"       />} label="Avg. Rating"    value={`${stats?.rating || 0}★`}                             sub={`${stats?.reviewCount || 0} reviews`} color="#F59E0B"       />
              <StatCard icon={<TrendingUp size={18} color="#8B5CF6"       />} label="This Month"     value={`₹${(stats?.monthEarnings  || 0).toLocaleString()}`} sub="Monthly earnings"                     color="#8B5CF6"       />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', borderRadius: 99, padding: 4, width: 'fit-content', marginBottom: '1.5rem' }}>
              {[
                ['requests', pendingCount > 0 ? `Requests (${pendingCount})` : 'Incoming Requests'],
                ['history',  'Session History'],
                ['earnings', 'Earnings'],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  ...tabStyle(id),
                  ...(id === 'requests' && pendingCount > 0 && activeTab !== id
                    ? { color: 'var(--brand)', fontWeight: 600 }
                    : {}
                  ),
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── Requests Tab ── */}
            {activeTab === 'requests' && (
              <div>
                {requests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
                    <div style={{ fontSize: 36, marginBottom: '1rem' }}>📭</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)' }}>No pending requests</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      {online ? 'Waiting for new requests...' : 'Go online to receive requests'}
                    </div>
                    {/* Pulse animation when online and waiting */}
                    {online && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '1.5rem' }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: 8, height: 8, background: 'var(--success)', borderRadius: '50%',
                            animation: `bounce 1.2s ease ${i * 0.2}s infinite`,
                          }} />
                        ))}
                        <style>{`@keyframes bounce{0%,80%,100%{transform:scale(.6)}40%{transform:scale(1)}}`}</style>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {requests.map(r => {
                      const sc       = statusColor[r.status] || statusColor.pending;
                      const reqUser  = r.user || {};
                      const initials = (reqUser.name || 'U').split(' ').map(n => n[0]).join('');
                      const time     = r.requestedAt
                        ? new Date(r.requestedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                        : 'Recently';

                      return (
                        <div key={r._id} style={{
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 'var(--r-lg)', padding: '1.25rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: '1rem', flexWrap: 'wrap',
                          borderLeft: `4px solid ${
                            r.status === 'accepted' ? 'var(--success)'
                            : r.status === 'rejected' ? 'var(--danger)'
                            : 'var(--accent)'
                          }`,
                          // Highlight new pending requests
                          boxShadow: r.status === 'pending' ? '0 0 0 2px rgba(26,86,219,0.08)' : 'none',
                        }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: '50%',
                              background: 'var(--brand-light)', color: 'var(--brand)',
                              fontFamily: 'var(--font-display)', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                              overflow: 'hidden',
                            }}>
                              {reqUser.avatar && reqUser.avatar.startsWith('http')
                                ? <img src={reqUser.avatar} alt={reqUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : initials
                              }
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{reqUser.name || 'User'}</div>
                              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{r.topic}</div>
                              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} />{time}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--success)' }}>
                              ₹{r.amount}
                            </div>
                            {r.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  onClick={() => handleRequest(r._id, 'accepted')}
                                  style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: 99, padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <CheckCircle size={13} /> Accept
                                </button>
                                <button
                                  onClick={() => handleRequest(r._id, 'rejected')}
                                  style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: 99, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <XCircle size={13} /> Decline
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 99, background: sc.bg, color: sc.color }}>
                                {r.status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── History Tab ── */}
            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)' }}>No sessions yet</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Completed sessions will appear here</div>
                  </div>
                ) : sessions.map(s => {
                  const sessionUser = s.user || {};
                  const date = s.completedAt
                    ? new Date(s.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'N/A';
                  return (
                    <div key={s._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.topic}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                          {sessionUser.name || 'User'} · {date} {s.duration ? `· ${s.duration} min` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--success)' }}>
                          +₹{s.amount}
                        </div>
                        {s.userRating && (
                          <div style={{ fontSize: 12, color: '#F59E0B' }}>{'★'.repeat(s.userRating)}</div>
                        )}
                        <span style={{ fontSize: 11, background: 'var(--success-light)', color: 'var(--success)', padding: '3px 10px', borderRadius: 99 }}>
                          Completed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Earnings Tab ── */}
            {activeTab === 'earnings' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: '1.5rem' }}>
                  {[
                    { label: 'This Month',      val: `₹${(stats?.monthEarnings || 0).toLocaleString()}`,                                                                 sub: 'Current month'          },
                    { label: 'All Time',         val: `₹${(stats?.totalEarned   || 0).toLocaleString()}`,                                                                 sub: `${stats?.totalSessions || 0} sessions` },
                    { label: 'Avg per Session',  val: stats?.totalSessions ? `₹${Math.round((stats?.totalEarned || 0) / stats.totalSessions)}` : '₹0',                   sub: 'Per session avg'        },
                    { label: 'Rating',           val: `${stats?.rating || 0}★`,                                                                                           sub: `${stats?.reviewCount || 0} reviews`    },
                  ].map(e => (
                    <div key={e.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{e.label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--brand)', marginBottom: 4 }}>{e.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.5rem' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: '1.2rem' }}>Earnings this week</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'flex-end', height: 80 }}>
                    {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                      <div key={i} style={{ width: 28, height: `${h}%`, background: 'var(--brand)', borderRadius: '4px 4px 0 0', opacity: 0.2 + i * 0.1 }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <span key={d} style={{ fontSize: 10, color: 'var(--text3)', width: 28, textAlign: 'center' }}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </>
        )}

      </div>
    </div>
  );
}