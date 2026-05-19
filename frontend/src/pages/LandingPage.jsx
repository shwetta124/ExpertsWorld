import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Star, Shield, Zap, Users, Video, MessageSquare } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { EXPERTS, CATEGORIES } from '../data/mockData';

function StatCard({ num, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--brand)' }}>{num}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function HowStep({ num, title, desc, icon }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48, background: 'rgba(255,255,255,0.15)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem', fontSize: 22,
      }}>{icon}</div>
      <div style={{
        width: 24, height: 24, background: 'white', color: 'var(--brand)',
        borderRadius: '50%', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 0.6rem',
      }}>{num}</div>
      <div style={{ fontWeight: 600, color: 'white', fontSize: 14, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function ExpertCardSmall({ expert }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/expert/${expert.id}`)} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: '1.1rem', cursor: 'pointer',
      transition: 'all .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = expert.color; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: expert.bg, color: expert.color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {expert.name.split(' ').map(n => n[0]).join('')}
          </div>
          {expert.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, background: '#10B981', borderRadius: '50%', border: '2px solid var(--surface)' }} />}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{expert.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{expert.role}</div>
          <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 2 }}>{'★'.repeat(Math.floor(expert.rating))} <span style={{ color: 'var(--text3)' }}>({expert.rating})</span></div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>₹{expert.price}<span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)', fontWeight: 400 }}>/session</span></span>
        <button style={{ background: expert.color, color: 'white', border: 'none', borderRadius: 99, padding: '5px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Connect</button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/dashboard?q=${encodeURIComponent(search)}`);
  };

  const chips = ['Top MERN Developers', 'Blockchain Experts', 'DSA Interview Prep', 'UI/UX Designers', 'System Design'];

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section style={{ padding: '4rem 2rem 3rem', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--accent-light)', color: '#92400E',
          fontSize: 12, fontWeight: 500, padding: '5px 14px',
          borderRadius: 99, marginBottom: '1.5rem',
          border: '1px solid #FCD34D',
        }}>
          <Star size={11} fill="#92400E" /> Trusted by 12,000+ users across India
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,6vw,56px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '1rem', lineHeight: 1.1 }}>
          Connect with <span style={{ color: 'var(--brand)' }}>top experts</span><br />in minutes, not days
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 2.5rem' }}>
          Get instant access to verified professionals for live video, audio & chat consultations — from dev to design to strategy.
        </p>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 580, margin: '0 auto 1rem' }}>
          <Search size={18} color="var(--text3)" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder='Search experts with AI... e.g. "Top React devs"'
            style={{
              width: '100%', padding: '14px 150px 14px 50px',
              borderRadius: 99, border: '2px solid var(--border2)',
              background: 'var(--surface)', fontSize: 14, color: 'var(--text)',
              boxShadow: 'var(--shadow)', transition: 'all .25s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = 'var(--shadow-brand)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'var(--shadow)'; }}
          />
          <button onClick={handleSearch} style={{
            position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
            background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 99,
            padding: '9px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}>
            AI Search
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {chips.map(c => (
            <span key={c} onClick={() => { setSearch(c); navigate(`/dashboard?q=${encodeURIComponent(c)}`); }} style={{
              background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 99,
              padding: '5px 14px', fontSize: 12, color: 'var(--text2)', cursor: 'pointer', transition: 'all .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}
            >{c}</span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', padding: '1.5rem 2rem 2.5rem', flexWrap: 'wrap' }}>
        <StatCard num="2,400+" label="Verified Experts" />
        <StatCard num="18K+" label="Sessions Done" />
        <StatCard num="4.9★" label="Avg. Rating" />
        <StatCard num="₹299+" label="Starting Price" />
      </div>

      {/* HOW IT WORKS */}
      <div style={{
        background: 'var(--brand)', borderRadius: 'var(--r-xl)',
        margin: '0 2rem 3rem', maxWidth: 1060, marginLeft: 'auto', marginRight: 'auto',
        padding: '2.5rem 2rem',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
          How ExpertsWorld works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 24 }}>
          <HowStep num="1" icon="🔍" title="Search & Match" desc="Use AI search to find the perfect expert for your specific need" />
          <HowStep num="2" icon="💳" title="Pay Securely" desc="Payment held in escrow via Razorpay — released after session" />
          <HowStep num="3" icon="🎥" title="Live Session" desc="Video, audio, chat & screen sharing — all in one place" />
          <HowStep num="4" icon="⭐" title="Rate & Review" desc="Leave honest feedback to help the community grow" />
        </div>
      </div>

      {/* FEATURED EXPERTS */}
      <div style={{ padding: '0 2rem 3rem', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Featured Experts</h2>
          <Link to="/dashboard" style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {EXPERTS.slice(0, 4).map(e => <ExpertCardSmall key={e.id} expert={e} />)}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: 'var(--surface2)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
            Everything you need for a great session
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
            {[
              { icon: <Video size={22} color="var(--brand)" />, title: 'HD Video Call', desc: 'Crystal-clear video with WebRTC — no plugins needed' },
              { icon: <MessageSquare size={22} color="#10B981" />, title: 'Live Chat', desc: 'Real-time messaging with file & code sharing built in' },
              { icon: <Shield size={22} color="#8B5CF6" />, title: 'Escrow Payments', desc: 'Your money is safe until session completes successfully' },
              { icon: <Zap size={22} color="#F59E0B" />, title: 'Instant Connect', desc: 'Go from search to live session in under 3 minutes' },
              { icon: <Users size={22} color="#EC4899" />, title: 'Verified Experts', desc: 'Every expert manually reviewed by our admin team' },
              { icon: <Star size={22} color="#EF4444" />, title: 'Rating System', desc: 'Transparent 5-star reviews for full accountability' },
            ].map(f => (
              <div key={f.title} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '1.25rem', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '0.8rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: '1rem' }}>
          Ready to get expert help?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: '2rem' }}>Join 12,000+ learners who got unstuck faster with ExpertsWorld.</p>
        <Link to="/signup" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--brand)', color: 'white', padding: '14px 32px',
          borderRadius: 99, fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
          textDecoration: 'none', transition: 'all .2s',
        }}>
          Get started for free <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}