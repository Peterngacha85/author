import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function CurrencySelector({ style }) {
  const { currency, currencies, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const pick = (currencyCode) => {
    setCurrency(currencyCode);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Select currency"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.4rem 0.6rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          cursor: 'pointer'
        }}
      >
        <img src={currency.flag} alt="" width={20} height={15} style={{ borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }} />
        {currency.currency}
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.4rem)',
            right: 0,
            minWidth: '13rem',
            maxHeight: '18rem',
            overflowY: 'auto',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            zIndex: 200,
            padding: '0.4rem'
          }}
        >
          {currencies.map(c => (
            <button
              key={c.currency}
              type="button"
              role="option"
              aria-selected={c.currency === currency.currency}
              onClick={() => pick(c.currency)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                background: c.currency === currency.currency ? 'var(--bg-base)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.6rem',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <img src={c.flag} alt="" width={20} height={15} style={{ borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{c.country}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{c.currency}</span>
            </button>
          ))}
          <div style={{
            marginTop: '0.3rem',
            padding: '0.5rem 0.6rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4
          }}>
            Prices convert for reference only — you're always charged in <strong>KES</strong> at checkout.
          </div>
        </div>
      )}
    </div>
  );
}
