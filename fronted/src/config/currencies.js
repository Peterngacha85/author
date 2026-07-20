// Static KES-based conversion table for DISPLAY purposes only.
// Real charges always happen in KES (via M-Pesa or Paystack) regardless of
// the currency shown here. Limited to Paystack's fully-supported merchant
// countries (Nigeria, Ghana, Kenya, South Africa, Côte d'Ivoire) as of 2026.
// Rates are approximate — update periodically.

import keFlag from 'flag-icons/flags/4x3/ke.svg';
import ngFlag from 'flag-icons/flags/4x3/ng.svg';
import ghFlag from 'flag-icons/flags/4x3/gh.svg';
import zaFlag from 'flag-icons/flags/4x3/za.svg';
import ciFlag from 'flag-icons/flags/4x3/ci.svg';

export const CURRENCIES = [
  { country: 'Kenya',        code: 'KE', currency: 'KES', symbol: 'KSh', rate: 1,    flag: keFlag },
  { country: 'Nigeria',      code: 'NG', currency: 'NGN', symbol: '₦',   rate: 12.0, flag: ngFlag },
  { country: 'Ghana',        code: 'GH', currency: 'GHS', symbol: 'GH₵', rate: 0.12, flag: ghFlag },
  { country: 'South Africa', code: 'ZA', currency: 'ZAR', symbol: 'R',   rate: 0.14, flag: zaFlag },
  { country: "Côte d'Ivoire", code: 'CI', currency: 'XOF', symbol: 'CFA', rate: 4.6, flag: ciFlag },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // Kenya / KES
