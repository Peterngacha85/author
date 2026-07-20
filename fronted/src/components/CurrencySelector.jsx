import { useCurrency } from '../context/CurrencyContext';

export default function CurrencySelector({ style }) {
  const { currency, currencies, setCurrency } = useCurrency();

  return (
    <select
      value={currency.currency}
      onChange={(e) => setCurrency(e.target.value)}
      aria-label="Select currency"
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.4rem 0.5rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        cursor: 'pointer',
        ...style
      }}
    >
      {currencies.map(c => (
        <option key={c.currency} value={c.currency}>
          {c.flag} {c.currency}
        </option>
      ))}
    </select>
  );
}
