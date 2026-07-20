import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import { CURRENCIES, DEFAULT_CURRENCY } from '../config/currencies';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    const stored = localStorage.getItem('currency');
    if (stored) {
      const match = CURRENCIES.find(c => c.currency === stored);
      if (match) return match;
    }
    return DEFAULT_CURRENCY;
  });

  // If the user has never picked a currency, default it from their detected country
  useEffect(() => {
    if (localStorage.getItem('currency')) return;

    API.get('/geo/country')
      .then(res => {
        const match = CURRENCIES.find(c => c.code === res.data.countryCode);
        if (match) setCurrencyState(match);
      })
      .catch(() => {});
  }, []);

  const setCurrency = (currencyCode) => {
    const match = CURRENCIES.find(c => c.currency === currencyCode);
    if (!match) return;
    setCurrencyState(match);
    localStorage.setItem('currency', match.currency);
  };

  const convert = (kesAmount) => (Number(kesAmount) || 0) * currency.rate;

  const formatPrice = (kesAmount) => {
    const converted = Math.round(convert(kesAmount));
    return `${currency.symbol} ${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencies: CURRENCIES, setCurrency, convert, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
};
