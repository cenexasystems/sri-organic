import { create } from 'zustand';

interface LangState {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.search_placeholder': 'Search products, remedies...',
    'products.title': 'Our Products',
    'products.sub': 'Authentic herbal preparations for your daily wellbeing',
    'products.clear': 'Clear Filters',
    'products.none': 'No Products Found',
    'products.sort.default': 'Sort by: Featured',
    'products.sort.price_low': 'Price: Low to High',
    'products.sort.price_high': 'Price: High to Low',
    'products.sort.rating': 'Top Rated',
    'cat.title': 'Categories',
    'cat.view_all': 'All Categories',
    'remedy.title': 'Health Concerns',
    'cat.Hair Care': 'Hair Care',
    'cat.Food & Nutrition': 'Food & Nutrition',
    'cat.Skin Care': 'Skin Care',
  },
};

export const useLangStore = create<LangState>((set, get) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
  t: (key) => {
    const lang = get().lang;
    const translation = translations[lang]?.[key];
    if (translation) return translation;
    
    if (key.startsWith('cat.')) return key.replace('cat.', '');
    if (key.startsWith('remedy.')) return key.replace('remedy.', '');
    
    return key;
  },
}));
