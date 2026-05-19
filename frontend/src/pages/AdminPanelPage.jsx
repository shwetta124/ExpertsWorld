import { useState, useEffect } from 'react';
import { Shield, Users, CheckCircle, XCircle, Eye, TrendingUp, Activity, AlertCircle, Loader } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { adminAPI } from '../services/api';
import { EXPERTS } from '../data/mockData';
import toast from 'react-hot-toast';

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
        <div style={{ width: 42, height: 42, background: color + '22', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {sub && <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500 }}>{sub}</span>}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</div>
    </div>
  );
}

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats,     setStats]     = useState(null);
  const [pending,   setPending]   = useState([]);
  const [allExperts, setAllExperts] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getPending(),
        ]);
        setStats(statsRes.data.stats);
        setPending(pendingRes.data.experts || []);
        // Use seed experts for display table (real data)
        setAllExperts(EXPERTS);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveExpert(id);
      setPending(prev => prev.filter(e => e._id !== id));
      toast.success('✅ Expert approved and notified!');
    } catch (err) {
      toast.error('Failed to approve expert');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectExpert(id);
      setPending(prev => prev.filter(e => e._id !== id));
      toast.error('❌ Expert application rejected');
    } catch (err) {
      toast.error('Failed to reject expert');
    }
  };

  const tabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: 99, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: 'none', transition: 'all .2s',
    background: activeTab === tab ? 'var(--brand)' : 'transparent',
    color:      activeTab === tab ? 'white' : 'var(--text2)',
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <div style={{ width: 44, height: 44, background: 'var(--brand)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>Admin Panel</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Manage users, experts, and platform activity</p>
          </div>
          {pending.length > 0 && (
            <div style={{ marginLeft: 'auto', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 99, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#92400E', fontWeight: 500 }}>
              <AlertCircle size={14} /> {pending.length} pending approvals
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Loader size={28} color="var(--brand)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading admin data...</div>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: '2rem' }}>
              <StatCard icon={<Users     size={18} color="var(--brand)" />} label="Total Users"        value={(stats?.totalUsers     || 0).toLocaleString()} color="var(--brand)"  sub="↑ Active" />
              <StatCard icon={<Shield    size={18} color="#8B5CF6" />}      label="Total Experts"      value={(stats?.totalExperts    || 0).toLocaleString()} color="#8B5CF6" />
              <StatCard icon={<Activity  size={18} color="#10B981" />}      label="Total Sessions"     value={(stats?.totalSessions   || 0).toLocaleString()} color="#10B981" />
              <StatCard icon={<TrendingUp size={18} color="#F59E0B" />}     label="Pending Approvals"  value={stats?.pendingExperts   || 0}                   color="#F59E0B" />
              <StatCard icon={<CheckCircle size={18} color="#06B6D4" />}    label="Total Revenue"      value={`₹${((stats?.totalRevenue || 0) / 100000).toFixed(1)}L`} color="#06B6D4" sub="Platform" />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', borderRadius: 99, padding: 4, width: 'fit-content', marginBottom: '1.5rem' }}>
              {[
                ['overview',  'Overview'],
                ['approvals', `Approvals (${pending.length})`],
                ['experts',   'All Experts'],
                ['users',     'Users'],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)} style={tabStyle(id)}>{label}</button>
              ))}
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Activity feed */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: '1rem' }}>Recent Activity</h3>
                  {[
                    { icon: '🟢', text: 'New expert application received',         time: '2 min ago',  color: 'var(--success-light)' },
                    { icon: '💳', text: 'Payment: ₹899 for System Design session', time: '8 min ago',  color: 'var(--brand-light)'   },
                    { icon: '⭐', text: 'New 5-star review submitted',             time: '12 min ago', color: 'var(--accent-light)'  },
                    { icon: '👤', text: 'New user registered',                     time: '18 min ago', color: 'var(--surface2)'      },
                    { icon: '✅', text: 'Session completed successfully',           time: '25 min ago', color: 'var(--success-light)' },
                    { icon: '🔔', text: 'Expert went offline',                     time: '32 min ago', color: 'var(--surface2)'      },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, padding: '8px 10px', background: a.color, borderRadius: 'var(--r-sm)' }}>
                      <span style={{ fontSize: 14 }}>{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{a.text}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category breakdown */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: '1rem' }}>Sessions by Category</h3>
                  {[
                    { cat: 'Development',   count: 7420, pct: 39, color: '#3B82F6' },
                    { cat: 'DSA & CP',      count: 4810, pct: 25, color: '#10B981' },
                    { cat: 'System Design', count: 2840, pct: 15, color: '#F59E0B' },
                    { cat: 'Design',        count: 1920, pct: 10, color: '#EC4899' },
                    { cat: 'AI / ML',       count: 1100, pct: 6,  color: '#06B6D4' },
                    { cat: 'Blockchain',    count: 834,  pct: 4,  color: '#8B5CF6' },
                  ].map(c => (
                    <div key={c.cat} style={{ marginBottom: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{c.cat}</span>
                        <span style={{ color: 'var(--text3)' }}>{c.count.toLocaleString()} ({c.pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 99 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Approvals Tab ── */}
            {activeTab === 'approvals' && (
              <div>
                {pending.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)' }}>All caught up!</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>No pending expert applications.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pending.map(e => {
                      const user = e.user || {};
                      const initials = (user.name || e.name || 'EX').split(' ').map(n => n[0]).join('');
                      return (
                        <div key={e._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            <div style={{ width: 48, height: 48, background: 'var(--brand-light)', color: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name || e.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{e.role} · {e.experience} experience</div>
                              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 10, background: 'var(--surface2)', color: 'var(--text3)', padding: '2px 8px', borderRadius: 99 }}>
                                  Applied {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'recently'}
                                </span>
                                <span style={{ fontSize: 10, background: 'var(--success-light)', color: 'var(--success)', padding: '2px 8px', borderRadius: 99 }}>
                                  ✓ Application submitted
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', color: 'var(--text2)', border: 'none', borderRadius: 99, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>
                              <Eye size={12} /> Review
                            </button>
                            <button onClick={() => handleApprove(e._id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--success)', color: 'white', border: 'none', borderRadius: 99, padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => handleReject(e._id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: 99, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── All Experts Tab ── */}
            {activeTab === 'experts' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                      {['Expert', 'Role', 'Sessions', 'Rating', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text2)', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allExperts.map((e, i) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: e.bg, color: e.color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {e.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500 }}>{e.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.location}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{e.role}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{e.sessions}</td>
                        <td style={{ padding: '12px 16px', color: '#F59E0B', fontWeight: 600 }}>{e.rating}★</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: e.online ? 'var(--success-light)' : 'var(--surface3)', color: e.online ? 'var(--success)' : 'var(--text3)', fontWeight: 500 }}>
                            {e.online ? '🟢 Online' : '⚫ Offline'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'var(--surface3)', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>View</button>
                            <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'var(--danger-light)', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>Suspend</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Users Tab ── */}
            {activeTab === 'users' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Email', 'Joined', 'Sessions', 'Spent', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text2)', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Rohit Verma',   email: 'rohit@example.com', joined: 'Jan 2024', sessions: 12, spent: 6800  },
                      { name: 'Aisha Khan',    email: 'aisha@example.com', joined: 'Feb 2024', sessions: 8,  spent: 4400  },
                      { name: 'Siddharth Rao', email: 'sid@example.com',   joined: 'Feb 2024', sessions: 5,  spent: 2995  },
                      { name: 'Divya Patel',   email: 'divya@example.com', joined: 'Mar 2024', sessions: 3,  spent: 1497  },
                      { name: 'Aryan Gupta',   email: 'aryan@example.com', joined: 'Mar 2024', sessions: 15, spent: 9350  },
                    ].map((u, i) => (
                      <tr key={u.email} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-light)', color: 'var(--brand)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {u.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span style={{ fontWeight: 500 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text3)' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{u.joined}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.sessions}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--success)', fontWeight: 600 }}>₹{u.spent.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'var(--surface3)', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>View</button>
                            <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'var(--danger-light)', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>Ban</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </>
        )}

      </div>
    </div>
  );
}