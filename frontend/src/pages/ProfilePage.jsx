import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, Save, Loader,
  Moon, Sun, Bell, Shield, Wallet,
  Star, LogOut, User, Mail, Phone, MapPin,
} from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate                        = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { darkMode, toggleDarkMode }    = useTheme();
  const fileInputRef                    = useRef(null);

  const [saving,    setSaving]    = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatar,    setAvatar]    = useState(user?.avatar || '');
  const [form, setForm] = useState({
    name:     user?.name     || '',
    bio:      user?.bio      || '',
    location: user?.location || '',
    phone:    user?.phone    || '',
  });

  // ── Notification toggles ──────────────────────────────────
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(true);
  const [notif4, setNotif4] = useState(false);

  const notifications = [
    { label: 'Session requests',   sub: 'Get notified when an expert accepts',   value: notif1, set: setNotif1 },
    { label: 'Payment updates',    sub: 'Receipts and payment confirmations',     value: notif2, set: setNotif2 },
    { label: 'New messages',       sub: 'In-session chat notifications',          value: notif3, set: setNotif3 },
    { label: 'Promotional emails', sub: 'Tips, offers and platform updates',      value: notif4, set: setNotif4 },
  ];

  // ── Handle photo upload ───────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setAvatar(base64);
      toast.success('Photo selected! Click Save to update.');
    };
    reader.readAsDataURL(file);
  };

  // ── Save profile ──────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ ...form, avatar });
    setSaving(false);
    if (result.success) toast.success('Profile updated!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: 99, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: 'none', transition: 'all .2s',
    background: activeTab === tab ? 'var(--brand)' : 'transparent',
    color:      activeTab === tab ? 'white' : 'var(--text2)',
  });

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
    background: 'var(--surface2)', fontSize: 14, color: 'var(--text)',
    fontFamily: 'var(--font-body)', transition: 'border-color .2s',
  };

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 99, cursor: 'pointer',
        background: value ? 'var(--brand)' : 'var(--border2)',
        position: 'relative', transition: 'all .25s', flexShrink: 0,
      }}>
      <div style={{
        position: 'absolute', top: 2,
        left: value ? 22 : 2,
        width: 20, height: 20,
        background: 'white', borderRadius: '50%',
        transition: 'all .25s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }} />
    </div>
  );

  // ── Display avatar ────────────────────────────────────────
  const AvatarDisplay = ({ size = 72, fontSize = 24 }) => {
    const src = avatar || user?.avatar;
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden' }}>
        {src && (src.startsWith('http') || src.startsWith('data:'))
          ? <img src={src} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : user?.name?.charAt(0)?.toUpperCase() || 'U'
        }
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoChange}
      />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Profile header card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--brand)', padding: '2rem', display: 'flex', alignItems: 'flex-end', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <AvatarDisplay />
              {/* Camera button — CLICKABLE */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'white', border: '2px solid var(--brand)',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all .2s',
                }}
                title="Change profile photo"
              >
                <Camera size={13} color="var(--brand)" />
              </button>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{user?.email}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, textTransform: 'capitalize' }}>
                {user?.role} account
              </div>
              {avatar !== user?.avatar && (
                <div style={{ fontSize: 11, color: '#FCD34D', marginTop: 4 }}>
                  📸 New photo selected — save to apply
                </div>
              )}
            </div>
          </div>

          {/* Wallet */}
          <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wallet size={16} color="var(--brand)" />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Wallet Balance</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--brand)', fontSize: 18 }}>
                ₹{user?.wallet?.toLocaleString() || 0}
              </div>
            </div>
            <button style={{ marginLeft: 'auto', background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--border3)', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              Add Money
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', borderRadius: 99, padding: 4, width: 'fit-content', marginBottom: '1.5rem' }}>
          {[['profile', 'Profile'], ['settings', 'Settings'], ['security', 'Security']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={tabStyle(id)}>{label}</button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginBottom: '1.2rem' }}>Edit Profile</h3>

            {/* Photo change section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface2)', borderRadius: 'var(--r-md)' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(avatar || user?.avatar) && ((avatar || user?.avatar).startsWith('http') || (avatar || user?.avatar).startsWith('data:'))
                    ? <img src={avatar || user?.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--brand)' }}>{user?.name?.charAt(0)}</span>
                  }
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Profile Photo</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>JPG, PNG up to 2MB</div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '6px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Camera size={12} /> Change Photo
                </button>
              </div>
              {avatar !== (user?.avatar || '') && (
                <button
                  onClick={() => setAvatar(user?.avatar || '')}
                  style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: 99, padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}>
                  Remove
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Name */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <User size={13} /> Full Name
                </label>
                <input type="text" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* Email (read only) */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Mail size={13} /> Email
                </label>
                <input type="email" value={user?.email || ''} disabled
                  style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Email cannot be changed</div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Phone size={13} /> Phone Number
                </label>
                <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* Location */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <MapPin size={13} /> Location
                </label>
                <input type="text" placeholder="City, State" value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* Bio */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Bio</label>
                <textarea value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell experts about yourself..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} style={{
              marginTop: '1.2rem', background: 'var(--brand)', color: 'white', border: 'none',
              borderRadius: 99, padding: '11px 28px', fontFamily: 'var(--font-display)',
              fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.8 : 1,
            }}>
              {saving
                ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Saving...</>
                : <><Save size={14} />Save Changes</>
              }
            </button>
          </div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Dark Mode */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: darkMode ? '#1A2744' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {darkMode ? <Moon size={18} color="#60A5FA" /> : <Sun size={18} color="#F59E0B" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Dark Mode</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                    </div>
                  </div>
                </div>
                <Toggle value={darkMode} onChange={toggleDarkMode} />
              </div>
            </div>

            {/* Notifications */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={15} /> Notification Preferences
              </h3>
              {notifications.map((n, i) => (
                <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < notifications.length - 1 ? '0.8rem' : 0, marginBottom: i < notifications.length - 1 ? '0.8rem' : 0, borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{n.sub}</div>
                  </div>
                  <Toggle value={n.value} onChange={n.set} />
                </div>
              ))}
            </div>

            {/* Become Expert */}
            {user?.role !== 'expert' && user?.role !== 'admin' && (
              <div onClick={() => navigate('/become-expert')} style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #6366F1 100%)', borderRadius: 'var(--r-lg)', padding: '1.25rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Become an Expert</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Share your knowledge and earn money</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 18, color: 'white' }}>→</div>
                </div>
              </div>
            )}

            {/* Logout */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1rem 1.25rem' }}>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', color: 'var(--danger)', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                <LogOut size={16} /> Log out of account
              </button>
            </div>

          </div>
        )}

        {/* ── Security Tab ── */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={15} /> Security Settings
              </h3>
              {[
                { label: 'Email verified',  value: user?.isEmailVerified ? '✅ Verified' : '❌ Not verified', color: user?.isEmailVerified ? 'var(--success)' : 'var(--danger)' },
                { label: 'Login method',    value: user?.googleId ? 'Google OAuth' : 'Email + Password',      color: 'var(--text2)'   },
                { label: 'Account role',    value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1), color: 'var(--brand)'   },
                { label: 'Member since',    value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently', color: 'var(--text2)' },
              ].map((item, i) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Change password */}
            {!user?.googleId && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: '1rem' }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                    <div key={label}>
                      <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 5, display: 'block' }}>{label}</label>
                      <input type="password" placeholder="••••••••"
                        style={{ ...inputStyle }}
                        onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  ))}
                  <button style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}