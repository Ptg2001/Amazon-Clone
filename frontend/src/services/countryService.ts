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
      // Disable external IP geolocation to avoid CORS/429 issues; use browser locale/localStorage only
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
}

// Create singleton instance
const countryService = new CountryService();

export default countryService;
