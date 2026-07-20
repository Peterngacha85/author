// Static KES-based conversion table for DISPLAY purposes only.
// Real charges always happen in KES (via M-Pesa or Paystack) regardless of
// the currency shown here. Rates are approximate — update periodically.
export const CURRENCIES = [
  { country: 'Kenya',          code: 'KE', currency: 'KES', symbol: 'KSh',  flag: '🇰🇪', rate: 1 },
  { country: 'Tanzania',       code: 'TZ', currency: 'TZS', symbol: 'TSh',  flag: '🇹🇿', rate: 20.2 },
  { country: 'Uganda',         code: 'UG', currency: 'UGX', symbol: 'USh',  flag: '🇺🇬', rate: 28.7 },
  { country: 'Nigeria',        code: 'NG', currency: 'NGN', symbol: '₦',    flag: '🇳🇬', rate: 12.0 },
  { country: 'Ghana',          code: 'GH', currency: 'GHS', symbol: 'GH₵',  flag: '🇬🇭', rate: 0.12 },
  { country: 'South Africa',   code: 'ZA', currency: 'ZAR', symbol: 'R',    flag: '🇿🇦', rate: 0.14 },
  { country: 'United States',  code: 'US', currency: 'USD', symbol: '$',    flag: '🇺🇸', rate: 0.0077 },
  { country: 'United Kingdom', code: 'GB', currency: 'GBP', symbol: '£',    flag: '🇬🇧', rate: 0.0061 },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // Kenya / KES
