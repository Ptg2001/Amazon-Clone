// Country detection and management service
const COUNTRY_DATA = {
  'US': { name: 'United States', flag: '🇺🇸', currency: 'USD' },
  'IN': { name: 'India', flag: '🇮🇳', currency: 'INR' },
  'GB': { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  'CA': { name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
  'AU': { name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  'DE': { name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
  'FR': { name: 'France', flag: '🇫🇷', currency: 'EUR' },
  'IT': { name: 'Italy', flag: '🇮🇹', currency: 'EUR' },
  'ES': { name: 'Spain', flag: '🇪🇸', currency: 'EUR' },
  'JP': { name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
  'CN': { name: 'China', flag: '🇨🇳', currency: 'CNY' },
  'BR': { name: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
  'MX': { name: 'Mexico', flag: '🇲🇽', currency: 'MXN' },
  'SG': { name: 'Singapore', flag: '🇸🇬', currency: 'SGD' },
  'AE': { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
  'SA': { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
  'ZA': { name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' },
  'NG': { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  'EG': { name: 'Egypt', flag: '🇪🇬', currency: 'EGP' },
  'KE': { name: 'Kenya', flag: '🇰🇪', currency: 'KES' },
  'PK': { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR' },
  'BD': { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT' },
  'TH': { name: 'Thailand', flag: '🇹🇭', currency: 'THB' },
  'ID': { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR' },
  'MY': { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR' },
  'PH': { name: 'Philippines', flag: '🇵🇭', currency: 'PHP' },
  'VN': { name: 'Vietnam', flag: '🇻🇳', currency: 'VND' },
  'KR': { name: 'South Korea', flag: '🇰🇷', currency: 'KRW' },
  'TW': { name: 'Taiwan', flag: '🇹🇼', currency: 'TWD' },
  'HK': { name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD' },
  'NL': { name: 'Netherlands', flag: '🇳🇱', currency: 'EUR' },
  'BE': { name: 'Belgium', flag: '🇧🇪', currency: 'EUR' },
  'CH': { name: 'Switzerland', flag: '🇨🇭', currency: 'CHF' },
  'AT': { name: 'Austria', flag: '🇦🇹', currency: 'EUR' },
  'SE': { name: 'Sweden', flag: '🇸🇪', currency: 'SEK' },
  'NO': { name: 'Norway', flag: '🇳🇴', currency: 'NOK' },
  'DK': { name: 'Denmark', flag: '🇩🇰', currency: 'DKK' },
  'FI': { name: 'Finland', flag: '🇫🇮', currency: 'EUR' },
  'PL': { name: 'Poland', flag: '🇵🇱', currency: 'PLN' },
  'RU': { name: 'Russia', flag: '🇷🇺', currency: 'RUB' },
  'TR': { name: 'Turkey', flag: '🇹🇷', currency: 'TRY' },
  'IL': { name: 'Israel', flag: '🇮🇱', currency: 'ILS' },
  'AR': { name: 'Argentina', flag: '🇦🇷', currency: 'ARS' },
  'CL': { name: 'Chile', flag: '🇨🇱', currency: 'CLP' },
  'CO': { name: 'Colombia', flag: '🇨🇴', currency: 'COP' },
  'PE': { name: 'Peru', flag: '🇵🇪', currency: 'PEN' },
  'VE': { name: 'Venezuela', flag: '🇻🇪', currency: 'VES' },
  'NZ': { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD' },
  'IE': { name: 'Ireland', flag: '🇮🇪', currency: 'EUR' },
  'PT': { name: 'Portugal', flag: '🇵🇹', currency: 'EUR' },
  'GR': { name: 'Greece', flag: '🇬🇷', currency: 'EUR' },
  'CZ': { name: 'Czech Republic', flag: '🇨🇿', currency: 'CZK' },
  'HU': { name: 'Hungary', flag: '🇭🇺', currency: 'HUF' },
  'RO': { name: 'Romania', flag: '🇷🇴', currency: 'RON' },
  'BG': { name: 'Bulgaria', flag: '🇧🇬', currency: 'BGN' },
  'HR': { name: 'Croatia', flag: '🇭🇷', currency: 'HRK' },
  'SI': { name: 'Slovenia', flag: '🇸🇮', currency: 'EUR' },
  'SK': { name: 'Slovakia', flag: '🇸🇰', currency: 'EUR' },
  'LT': { name: 'Lithuania', flag: '🇱🇹', currency: 'EUR' },
  'LV': { name: 'Latvia', flag: '🇱🇻', currency: 'EUR' },
  'EE': { name: 'Estonia', flag: '🇪🇪', currency: 'EUR' },
  'LU': { name: 'Luxembourg', flag: '🇱🇺', currency: 'EUR' },
  'MT': { name: 'Malta', flag: '🇲🇹', currency: 'EUR' },
  'CY': { name: 'Cyprus', flag: '🇨🇾', currency: 'EUR' },
};

class CountryService {
  constructor() {
    this.currentCountry = null;
    this.detectionPromise = null;
    // FX rates cache from backend (USD base)
    this.fxUSDTo = {
      USD: 1,
      // populated at runtime
    } as Record<string, number>;
  }

  // Detect user's country using IP geolocation
  async detectCountry() {
    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    this.detectionPromise = this._performDetection();
    return this.detectionPromise;
  }

  async _performDetection() {
    try {
      // Try server-side geo first (avoids CORS, uses server IP pass-through)
      const res = await fetch('/api/users/geo', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        const code = json?.data?.countryCode;
        if (code && COUNTRY_DATA[code]) {
          this.currentCountry = { code, ...COUNTRY_DATA[code] } as any;
          this._saveToStorage();
          return this.currentCountry;
        }
      }
      // Fallback to browser-based detection
      return this._detectFromBrowser();
    } catch (error) {
      console.error('Country detection failed:', error);
      return this._detectFromBrowser();
    }
  }

  // Fallback method using browser language
  _detectFromBrowser() {
    const language = navigator.language || navigator.userLanguage;
    const countryCode = language.split('-')[1]?.toUpperCase();
    
    if (countryCode && COUNTRY_DATA[countryCode]) {
      this.currentCountry = {
        code: countryCode,
        ...COUNTRY_DATA[countryCode]
      };
    } else {
      // Default to US if detection fails
      this.currentCountry = {
        code: 'US',
        ...COUNTRY_DATA['US']
      };
    }
    
    this._saveToStorage();
    return this.currentCountry;
  }

  // Get current country
  getCurrentCountry() {
    if (this.currentCountry) {
      return this.currentCountry;
    }

    // Try to load from storage first
    const stored = this._loadFromStorage();
    if (stored) {
      this.currentCountry = stored;
      return this.currentCountry;
    }

    // Return default if nothing is available
    return {
      code: 'US',
      ...COUNTRY_DATA['US']
    };
  }

  // Set country manually
  setCountry(countryCode) {
    if (COUNTRY_DATA[countryCode.toUpperCase()]) {
      this.currentCountry = {
        code: countryCode.toUpperCase(),
        ...COUNTRY_DATA[countryCode.toUpperCase()]
      };
      this._saveToStorage();
      return this.currentCountry;
    }
    throw new Error(`Country code ${countryCode} not supported`);
  }

  // Get all available countries
  getAllCountries() {
    return Object.entries(COUNTRY_DATA).map(([code, data]) => ({
      code,
      ...data
    }));
  }

  // Get country by code
  getCountryByCode(code) {
    if (COUNTRY_DATA[code.toUpperCase()]) {
      return {
        code: code.toUpperCase(),
        ...COUNTRY_DATA[code.toUpperCase()]
      };
    }
    return null;
  }

  // Save to localStorage
  _saveToStorage() {
    try {
      localStorage.setItem('amazon-clone-country', JSON.stringify(this.currentCountry));
    } catch (error) {
      console.warn('Failed to save country to localStorage:', error);
    }
  }

  // Load from localStorage
  _loadFromStorage() {
    try {
      const stored = localStorage.getItem('amazon-clone-country');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.code && COUNTRY_DATA[parsed.code]) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load country from localStorage:', error);
    }
    return null;
  }

  // Format delivery text
  getDeliveryText() {
    const country = this.getCurrentCountry();
    return `Deliver to ${country.name}`;
  }

  // Get currency symbol
  getCurrencySymbol() {
    const country = this.getCurrentCountry();
    const currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'INR': '₹',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RON': 'lei',
      'BGN': 'лв',
      'HRK': 'kn',
      'RUB': '₽',
      'TRY': '₺',
      'ILS': '₪',
      'ARS': '$',
      'CLP': '$',
      'COP': '$',
      'PEN': 'S/',
      'VES': 'Bs',
      'BRL': 'R$',
      'MXN': '$',
      'SGD': 'S$',
      'HKD': 'HK$',
      'TWD': 'NT$',
      'KRW': '₩',
      'THB': '฿',
      'IDR': 'Rp',
      'MYR': 'RM',
      'PHP': '₱',
      'VND': '₫',
      'AED': 'د.إ',
      'SAR': 'ر.س',
      'ZAR': 'R',
      'NGN': '₦',
      'EGP': '£',
      'KES': 'KSh',
      'PKR': '₨',
      'BDT': '৳',
      'NZD': 'NZ$'
    };
    return currencySymbols[country.currency] || '$';
  }

  // Get active currency code
  getCurrencyCode() {
    return this.getCurrentCountry().currency || 'USD';
  }

  // Convert a USD amount to the active currency (approximate)
  convertFromUSD(amountUSD: number): number {
    const code = this.getCurrencyCode();
    const rate = this.fxUSDTo[code] || 1;
    return (amountUSD || 0) * rate;
  }

  // Format a USD amount in the active locale currency
  formatPrice(amountUSD: number): string {
    const code = this.getCurrencyCode();
    const locale = this._guessLocaleFromCode(code);
    const converted = this.convertFromUSD(amountUSD || 0);
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(converted);
    } catch {
      const symbol = this.getCurrencySymbol();
      return `${symbol}${converted.toFixed(2)}`;
    }
  }

  // Format a local-currency amount (no conversion, only formatting)
  formatLocalCurrency(amountLocal: number): string {
    const code = this.getCurrencyCode();
    const locale = this._guessLocaleFromCode(code);
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(amountLocal || 0);
    } catch {
      const symbol = this.getCurrencySymbol();
      const v = typeof amountLocal === 'number' ? amountLocal : 0;
      return `${symbol}${(v).toFixed(2)}`;
    }
  }

  _guessLocaleFromCode(code: string): string {
    // Very rough mapping
    const map: Record<string, string> = {
      INR: 'en-IN',
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      CAD: 'en-CA',
      AUD: 'en-AU',
      JPY: 'ja-JP',
      CNY: 'zh-CN',
      AED: 'ar-AE',
      SAR: 'ar-SA',
      BRL: 'pt-BR',
      MXN: 'es-MX',
      SGD: 'en-SG',
      HKD: 'zh-HK',
      TWD: 'zh-TW',
      KRW: 'ko-KR',
      THB: 'th-TH',
      IDR: 'id-ID',
      MYR: 'ms-MY',
      PHP: 'en-PH',
      VND: 'vi-VN',
      ZAR: 'en-ZA',
      NGN: 'en-NG',
    };
    return map[code] || 'en-US';
  }

  async refreshFxRates(): Promise<void> {
    try {
      const res = await fetch('/api/users/fx-rates', { credentials: 'include' });
      if (!res.ok) throw new Error('FX endpoint failed');
      const json = await res.json();
      const rates = json?.data?.rates || {};
      if (rates && typeof rates === 'object') {
        this.fxUSDTo = { ...this.fxUSDTo, ...rates };
        try { localStorage.setItem('fx_usd_rates', JSON.stringify({ ts: Date.now(), rates })); } catch {}
      }
    } catch (e) {
      // Load from cache if available
      try {
        const raw = localStorage.getItem('fx_usd_rates');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.rates) this.fxUSDTo = { ...this.fxUSDTo, ...parsed.rates };
        }
      } catch {}
    }
  }
}

// Create singleton instance
const countryService = new CountryService();

export default countryService;
