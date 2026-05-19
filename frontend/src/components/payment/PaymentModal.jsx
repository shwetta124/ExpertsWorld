import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Shield, CheckCircle, Loader, CreditCard, Video } from 'lucide-react';
import { sessionAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';


const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id  = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentModal({ expert, onClose, onSuccess }) {
  const { emit }   = useSocket() || {};
  const navigate   = useNavigate();

  const [step,      setStep]      = useState('confirm'); // confirm | processing | success
  const [topic,     setTopic]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState(null);  // ← store session ID after payment

  
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePay = async () => {
    if (!topic.trim()) {
      toast.error('Please describe what you need help with');
      return;
    }

    setLoading(true);

    try {
      
      const { data } = await sessionAPI.createOrder(expert._id || expert.id);
      setLoading(false);

      // Step 2 — Open Razorpay checkout
      const options = {
        key:         data.keyId,
        amount:      data.order.amount,
        currency:    data.order.currency,
        name:        'ExpertsWorld',
        description: `Session with ${expert.name}`,
        order_id:    data.order.id,
        prefill: {
          name:  '',
          email: '',
        },
        theme: {
          color: '#1A56DB',
        },
        handler: async (response) => {
          
          setStep('processing');
          try {
            const verifyRes = await sessionAPI.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              expertId:            expert._id || expert.id,
              topic,
            });

            
            const newSessionId = verifyRes.data.sessionId;
            setSessionId(newSessionId);

            setStep('success');

           
            if (emit) {
              emit('payment_done', {
                expertId: expert._id || expert.id,
                topic,
              });
            }

          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
            setStep('confirm');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled', { icon: '⚠️' });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Failed to initiate payment';
      toast.error(msg);
    }
  };

 
  const handleJoinCall = () => {
    const channel = sessionId || `session-${Date.now()}`;
    onSuccess?.();
    onClose();
    navigate(`/video/${sessionId}/${channel}`);
  };

 
  const handleOpenChat = () => {
    onSuccess?.();
    onClose();
    navigate(`/chat/${sessionId}`);
  };

  const overlay = {
    position: 'fixed', inset: 0,
    background: 'rgba(10,18,40,0.7)',
    zIndex: 1000, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '1rem', backdropFilter: 'blur(4px)',
  };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--r-xl)',
        width: '100%', maxWidth: 440, overflow: 'hidden',
        animation: 'slideUp .3s ease',
      }}>

        {/* Header */}
        <div style={{ background: expert.color || 'var(--brand)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Session with</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>
              {expert.name}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{expert.role}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>

          {/* ── Confirm Step ── */}
          {step === 'confirm' && (
            <>
              {/* Amount */}
              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-md)', padding: '1rem 1.25rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Session fee</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--brand)' }}>
                  ₹{expert.price}
                </div>
              </div>

              {/* Topic input */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                  What do you need help with? *
                </label>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder={`e.g. "Help me debug my React app" or "Explain system design concepts"`}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
                    background: 'var(--surface2)', fontSize: 13, color: 'var(--text)',
                    resize: 'vertical', minHeight: 80, fontFamily: 'var(--font-body)',
                    transition: 'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Trust features */}
              <div style={{ marginBottom: '1.2rem' }}>
                {[
                  'Escrow-protected payment — released only after session',
                  "100% refund if expert doesn't respond in 10 minutes",
                  'Secure payment powered by Razorpay',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <Shield size={13} color="var(--success)" />
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={loading || !topic.trim()}
                style={{
                  width: '100%',
                  background: loading || !topic.trim() ? 'var(--border2)' : 'var(--brand)',
                  color: 'white', border: 'none', borderRadius: 99,
                  padding: '14px', fontFamily: 'var(--font-display)',
                  fontSize: 15, fontWeight: 700,
                  cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all .2s',
                }}>
                {loading
                  ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Creating order...</>
                  : <><CreditCard size={16} />Pay ₹{expert.price} via Razorpay</>
                }
              </button>

              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>
                🔒 256-bit SSL encrypted · Test mode active
              </div>
            </>
          )}

          {/* ── Processing Step ── */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Loader size={40} color="var(--brand)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Verifying Payment
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1.5rem' }}>
                Confirming your payment with Razorpay...
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, background: 'var(--brand)', borderRadius: '50%', animation: `bounce 1.2s ease ${i * 0.2}s infinite` }} />
                ))}
                <style>{`@keyframes bounce{0%,80%,100%{transform:scale(.6)}40%{transform:scale(1)}}`}</style>
              </div>
            </div>
          )}

          {/* ── Success Step ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: 72, height: 72, background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle size={32} color="var(--success)" />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                Payment Successful! 🎉
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1.2rem' }}>
                Notifying <strong>{expert.name}</strong>. Please wait for them to accept...
              </div>

              {/* ── Payment confirmed badge ── */}
              <div style={{ background: 'var(--success-light)', borderRadius: 'var(--r-md)', padding: '12px 16px', fontSize: 13, color: 'var(--success)', marginBottom: '1.5rem' }}>
                ✅ Payment of ₹{expert.price} confirmed
              </div>

              {/* ── Action buttons ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Join Video Call */}
                <button
                  onClick={handleJoinCall}
                  style={{
                    width: '100%', background: 'var(--brand)',
                    color: 'white', border: 'none', borderRadius: 99,
                    padding: '13px', fontFamily: 'var(--font-display)',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Video size={16} /> Join Video Call Now
                </button>

                {/* Open Chat */}
                <button
                  onClick={handleOpenChat}
                  style={{
                    width: '100%', background: 'none',
                    color: 'var(--brand)', border: '1.5px solid var(--brand)',
                    borderRadius: 99, padding: '11px',
                    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', transition: 'all .2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  💬 Open Chat Instead
                </button>

                {/* Wait for expert */}
                <button
                  onClick={() => { onSuccess?.(); onClose(); toast.success('Waiting for expert to accept...'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', padding: '4px' }}
                >
                  Wait for expert to accept first
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}