import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Wallet, Loader } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import ExpertCard from '../components/expert/ExpertCard';
import { CATEGORIES } from '../data/mockData';
import { expertAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Color map for categories ─────────────────────────────────
const categoryColors = {
  dev:        { color: '#3B82F6', bg: '#EFF6FF' },
  design:     { color: '#EC4899', bg: '#FDF2F8' },
  blockchain: { color: '#8B5CF6', bg: '#F5F3FF' },
  dsa:        { color: '#10B981', bg: '#ECFDF5' },
  system:     { color: '#F59E0B', bg: '#FFFBEB' },
  ai:         { color: '#06B6D4', bg: '#ECFEFF' },
  other:      { color: '#6B7280', bg: '#F9FAFB' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const location  = useLocation();
  const queryParam = new URLSearchParams(location.search).get('q') || '';

  const [experts,        setExperts]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort,           setSort]           = useState('rating');
  const [onlineOnly,     setOnlineOnly]     = useState(false);
  const [total,          setTotal]          = useState(0);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const { data } = await expertAPI.getAll({
        category: activeCategory === 'all' ? '' : activeCategory,
        search,
        sort,
        online: onlineOnly ? 'true' : '',
      });
      const enriched = (data.experts || []).map(e => ({
        ...e,
        id:     e._id,
        online: e.isOnline,
        color:  categoryColors[e.category]?.color || '#3B82F6',
        bg:     categoryColors[e.category]?.bg    || '#EFF6FF',
      }));
      console.log('Experts loaded:', enriched.map(e => e._id)); // debug line
      setExperts(enriched);
      setTotal(data.total || enriched.length);
    } catch (err) {
      toast.error('Failed to load experts');
      setExperts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExperts(); }, [activeCategory, sort, onlineOnly]);

  const handleSearch = () => fetchExperts();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
              Good morning, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
              Find the perfect expert for your next session
            </p>
          </div>
          <div style={{
            background: 'var(--brand-light)', border: '1px solid var(--border3)',
            borderRadius: 'var(--r-md)', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Wallet size={16} color="var(--brand)" />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Wallet Balance</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--brand)', fontSize: 16 }}>
                ₹{user?.wallet?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={16} color="var(--text3)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder='Search experts... e.g. "Find top Node.js experts"'
            style={{
              width: '100%', padding: '13px 140px 13px 46px',
              border: '1.5px solid var(--border)', borderRadius: 99,
              background: 'var(--surface)', fontSize: 14, color: 'var(--text)',
              boxShadow: 'var(--shadow)', transition: 'all .2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--brand)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={handleSearch}
            style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--brand)', color: 'white', border: 'none',
              borderRadius: 99, padding: '9px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
            Search
          </button>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
              whiteSpace: 'nowrap', padding: '7px 16px', borderRadius: 99,
              border: '1.5px solid', cursor: 'pointer', transition: 'all .2s',
              borderColor: activeCategory === c.id ? 'var(--brand)' : 'var(--border)',
              background:  activeCategory === c.id ? 'var(--brand)' : 'var(--surface)',
              color:       activeCategory === c.id ? 'white' : 'var(--text2)',
              fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            <strong style={{ color: 'var(--text)' }}>{total}</strong> experts found
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
              <div
                onClick={() => setOnlineOnly(v => !v)}
                style={{
                  width: 36, height: 20, borderRadius: 99, transition: 'all .2s', cursor: 'pointer',
                  background: onlineOnly ? 'var(--success)' : 'var(--border2)', position: 'relative',
                }}>
                <div style={{
                  position: 'absolute', top: 2,
                  left: onlineOnly ? 18 : 2,
                  width: 16, height: 16,
                  background: 'white', borderRadius: '50%', transition: 'all .2s',
                }} />
              </div>
              Online only
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 12px' }}>
              <SlidersHorizontal size={13} color="var(--text3)" />
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: 'none', background: 'none', fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>
                <option value="rating">Highest Rated</option>
                <option value="sessions">Most Sessions</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Experts Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text3)' }}>
            <Loader size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: 14 }}>Loading experts...</div>
          </div>
        ) : experts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 16 }}>
            {experts.map(e => <ExpertCard key={e._id} expert={e} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>No experts found</div>
            <div style={{ fontSize: 14 }}>Try a different search term or category</div>
          </div>
        )}

      </div>
    </div>
  );
}