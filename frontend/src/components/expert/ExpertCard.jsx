import { useNavigate } from 'react-router-dom';

function Stars({ rating }) {
  const full  = Math.floor(rating || 0);
  const empty = 5 - full;
  return (
    <span style={{ color: '#F59E0B', fontSize: 11, letterSpacing: 1 }}>
      {'★'.repeat(full)}{'☆'.repeat(empty)}
    </span>
  );
}

export default function ExpertCard({ expert }) {
  const navigate = useNavigate();

  
  const id       = expert._id || expert.id;
  const initials = expert.name?.split(' ').map(n => n[0]).join('') || 'EX';
  const isOnline = expert.isOnline || expert.online || false;
  const color    = expert.color || '#3B82F6';
  const bg       = expert.bg    || '#EFF6FF';
  const reviews  = Array.isArray(expert.reviews)
    ? expert.reviews.length
    : (expert.reviews || 0);

  return (
    <div
      onClick={() => navigate(`/expert/${id}`)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '1.2rem',
        cursor: 'pointer',
        transition: 'all .25s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform   = 'translateY(-4px)';
        e.currentTarget.style.boxShadow   = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = 'translateY(0)';
        e.currentTarget.style.boxShadow   = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Color stripe top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: color, opacity: 0.7,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '0.8rem', alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: bg, color,
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${color}33`,
            overflow: 'hidden',
          }}>
            {expert.avatar
              ? <img src={expert.avatar} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
            }
          </div>
          {isOnline && (
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 11, height: 11,
              background: '#10B981', borderRadius: '50%',
              border: '2px solid var(--surface)',
            }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {expert.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {expert.role}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Stars rating={expert.rating} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{expert.rating}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>({reviews})</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: '0.8rem' }}>
        {(expert.tags || []).slice(0, 3).map(t => (
          <span key={t} style={{
            fontSize: 10, background: 'var(--surface2)', color: 'var(--text2)',
            padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)',
          }}>
            {t}
          </span>
        ))}
      </div>

      {/* Experience */}
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: '0.9rem', display: 'flex', gap: 10 }}>
        <span>🕐 {expert.experience}</span>
        <span>•</span>
        <span>{expert.sessions} sessions</span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
            ₹{expert.price}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>/session</span>
        </div>
        <button
          style={{
            background: color, color: 'white', border: 'none',
            borderRadius: 99, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            transition: 'all .2s',
          }}
          onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.stopPropagation(); e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Connect
        </button>
      </div>
    </div>
  );
}