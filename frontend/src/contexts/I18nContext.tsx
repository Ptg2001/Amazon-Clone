import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'es' | 'fr' | 'de' | 'hi';

type Dictionary = Record<string, string>;

const dictionaries: Record<Lang, Dictionary> = {
  en: {
    searchPlaceholder: 'Search NexaCart',
    signIn: 'Sign in',
    orders: 'Orders',
    cart: 'Cart',
    language: 'EN',
  },
  es: {
    searchPlaceholder: 'Buscar en NexaCart',
    signIn: 'Iniciar sesión',
    orders: 'Pedidos',
    cart: 'Carrito',
    language: 'ES',
  },
  fr: {
    searchPlaceholder: 'Rechercher sur NexaCart',
    signIn: 'Se connecter',
    orders: 'Commandes',
    cart: 'Panier',
    language: 'FR',
  },
  de: {
    searchPlaceholder: 'Auf NexaCart suchen',
    signIn: 'Anmelden',
    orders: 'Bestellungen',
    cart: 'Warenkorb',
    language: 'DE',
  },
  hi: {
    searchPlaceholder: 'NexaCart पर खोजें',
    signIn: 'साइन इन',
    orders: 'ऑर्डर',
    cart: 'कार्ट',
    language: 'HI',
  },
};

type I18nValue = {
  lang: Lang;
  t: (key: string) => string;
  setLang: (l: Lang) => void;
  available: { code: Lang; label: string }[];
};

const I18nContext = createContext<I18nValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string) => (dictionaries[lang] && dictionaries[lang][key]) || dictionaries.en[key] || key;

  const available = useMemo(() => [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
    { code: 'hi', label: 'HI' },
  ] as { code: Lang; label: string }[], []);

  const value: I18nValue = { lang, t, setLang, available };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};



