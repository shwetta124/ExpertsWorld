import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Settings, Clock, LogOut, Star, Shield, LayoutDashboard, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'var(--surface)', borderBottom: '1px solid var(--border)',
    height: 'var(--nav-h)', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 1.5rem', gap: '1rem',
  },
  logo: {
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px',
    color: 'var(--brand)', letterSpacing: '-0.5px', display: 'flex',
    alignItems: 'center', gap: '6px', textDecoration: 'none',
  },
  logoSpan: { color: 'var(--text)' },
  logoIcon: {
    width: 28, height: 28, background: 'var(--brand)',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  actions: { display: 'flex', alignItems: 'center', gap: '10px' },
  notifBtn: {
    position: 'relative', width: 38, height: 38, borderRadius: '50%',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all .2s',
  },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'var(--brand-light)', border: '1px solid var(--border3)',
    borderRadius: 40, padding: '4px 12px 4px 4px', cursor: 'pointer',
    transition: 'all .2s',
  },
  avatarCircle: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'var(--brand)', color: 'white',
    fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarName: { fontSize: 13, fontWeight: 500, color: 'var(--brand)' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)', padding: '8px',
    minWidth: 210, boxShadow: 'var(--shadow-md)',
    zIndex: 200,
  },
  dropUser: {
    padding: '10px 12px', borderBottom: '1px solid var(--border)',
    marginBottom: 6,
  },
  dropUserName:  { fontWeight: 600, fontSize: 14, color: 'var(--text)' },
  dropUserEmail: { fontSize: 12, color: 'var(--text3)', marginTop: 2 },
  dropItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 'var(--r-sm)',
    fontSize: 13, color: 'var(--text2)',
    cursor: 'pointer', transition: 'all .15s',
    width: '100%', background: 'none', border: 'none',
    textAlign: 'left', textDecoration: 'none',
  },
};

// ── Notification type config ─────────────────────────────────
const notifConfig = {
  new_request:       { icon: '🔔', color: 'var(--brand-light)',   border: 'var(--brand)'   },
  request_response:  { icon: '📣', color: 'var(--success-light)', border: 'var(--success)' },
  session_completed: { icon: '⭐', color: 'var(--accent-light)',  border: 'var(--accent)'  },
  default:           { icon: '📌', color: 'var(--surface2)',      border: 'var(--border)'  },
};

export default function Navbar() {
  const { user, logout }                          = useAuth();
  const { unreadCount, notifications, markAllRead } = useSocket() || {};
  const navigate                                  = useNavigate();
  const [dropOpen,   setDropOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const dropRef  = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setDropOpen(false);
  };

  const handleNotifOpen = () => {
    setNotifOpen(v => !v);
    setDropOpen(false);
    if (!notifOpen && markAllRead) markAllRead();
  };

  // Format time
  const formatTime = (time) => {
    if (!time) return '';
    const d = new Date(time);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)   return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  const count = unreadCount || 0;
  const notifs = notifications || [];

  return (
    <nav style={styles.nav}>

      {/* Logo */}
      <Link to={user ? '/dashboard' : '/'} style={styles.logo}>
        <div style={styles.logoIcon}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        Experts<span style={styles.logoSpan}>World</span>
      </Link>

      <div style={styles.actions}>

        {/* ── Notification Bell ── */}
        {user && (
          <div style={{ position: 'relative' }} ref={notifRef}>
            <div style={styles.notifBtn} onClick={handleNotifOpen}>
              <Bell size={16} color="var(--text2)" />
              {count > 0 && (
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#EF4444', color: 'white',
                  borderRadius: '50%', width: 18, height: 18,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--surface)',
                }}>
                  {count > 9 ? '9+' : count}
                </div>
              )}
            </div>

            {/* Notification dropdown */}
            {notifOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)', width: 310,
                boxShadow: 'var(--shadow-md)', zIndex: 200, overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    Notifications
                    {count > 0 && (
                      <span style={{
                        marginLeft: 8, background: '#EF4444', color: 'white',
                        borderRadius: 99, padding: '1px 7px', fontSize: 11,
                      }}>{count}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setNotifOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    <X size={14} />
                  </button>
                </div>

                {/* Notification list */}
                {notifs.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>No notifications yet</div>
                    <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 4 }}>
                      You'll see session requests and updates here
                    </div>
                  </div>
                ) : (
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notifs.slice(0, 15).map(n => {
                      const cfg = notifConfig[n.type] || notifConfig.default;
                      return (
                        <div key={n.id} style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border)',
                          background: n.read ? 'var(--surface)' : cfg.color,
                          borderLeft: `3px solid ${n.read ? 'transparent' : cfg.border}`,
                          transition: 'all .2s',
                          cursor: 'pointer',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                          onMouseLeave={e => e.currentTarget.style.background = n.read ? 'var(--surface)' : cfg.color}
                        >
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{cfg.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: 'var(--text)', lineHeight: 1.4 }}>
                                {n.message}
                              </div>
                              {n.data?.topic && (
                                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                                  📋 {n.data.topic}
                                </div>
                              )}
                              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                                {formatTime(n.time)}
                              </div>
                            </div>
                            {!n.read && (
                              <div style={{ width: 7, height: 7, background: 'var(--brand)', borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                {notifs.length > 0 && (
                  <div style={{
                    padding: '10px 16px', borderTop: '1px solid var(--border)',
                    textAlign: 'center',
                  }}>
                    <button
                      onClick={() => { navigate('/history'); setNotifOpen(false); }}
                      style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      View all session history →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Avatar + Dropdown ── */}
        {user ? (
          <div style={{ position: 'relative' }} ref={dropRef}>
            <div style={styles.avatarBtn} onClick={() => { setDropOpen(v => !v); setNotifOpen(false); }}>
              <div style={styles.avatarCircle}>
                {user.avatar && user.avatar.startsWith('http')
                  ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user.avatar || user.name?.charAt(0)?.toUpperCase()
                }
              </div>
              <span style={styles.avatarName}>{user.name?.split(' ')[0]}</span>
              <ChevronDown size={14} color="var(--brand)" />
            </div>

            {dropOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropUser}>
                  <div style={styles.dropUserName}>{user.name}</div>
                  <div style={styles.dropUserEmail}>{user.email}</div>
                </div>

                <Link to="/profile" style={styles.dropItem} onClick={() => setDropOpen(false)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <Settings size={14} /> Profile & Settings
                </Link>

                <Link to="/history" style={styles.dropItem} onClick={() => setDropOpen(false)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <Clock size={14} /> Session History
                </Link>

                {(user.role === 'expert' || user.role === 'admin') && (
                  <Link to="/expert-dashboard" style={styles.dropItem} onClick={() => setDropOpen(false)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <LayoutDashboard size={14} /> Expert Dashboard
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin" style={styles.dropItem} onClick={() => setDropOpen(false)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <Shield size={14} /> Admin Panel
                  </Link>
                )}

                {!user.isExpert && user.role !== 'expert' && user.role !== 'admin' && (
                  <Link to="/become-expert" style={{ ...styles.dropItem, color: 'var(--accent-dark)' }}
                    onClick={() => setDropOpen(false)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <Star size={14} /> Become an Expert
                  </Link>
                )}

                <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6 }}>
                  <button style={{ ...styles.dropItem, color: '#EF4444' }} onClick={handleLogout}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" style={{
              padding: '8px 18px', borderRadius: 40, fontSize: 13, fontWeight: 500,
              border: '1.5px solid var(--border2)', color: 'var(--text)',
              background: 'var(--surface)', transition: 'all .2s',
            }}>Log in</Link>
            <Link to="/signup" style={{
              padding: '8px 18px', borderRadius: 40, fontSize: 13, fontWeight: 500,
              background: 'var(--brand)', color: 'white', transition: 'all .2s',
            }}>Sign up</Link>
          </div>
        )}

      </div>
    </nav>
  );
}