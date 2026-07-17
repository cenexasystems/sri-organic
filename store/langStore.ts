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
    'cat.Rice': 'Rice Varieties',
    'cat.Oils': 'Cooking Oils',
    'cat.Dals & Grains': 'Dals & Grains',
    'cat.Spices & Nuts': 'Spices & Nuts',
    'cat.Pooja Items': 'Pooja Items',
    'cat.Ghee & Honey': 'Ghee & Honey',
  },
  ta: {
    'nav.search_placeholder': 'தயாரிப்புகள், வைத்தியங்களைத் தேடுங்கள்...',
    'products.title': 'எங்கள் தயாரிப்புகள்',
    'products.sub': 'உங்கள் அன்றாட நல்வாழ்வுக்கான உண்மையான மூலிகை தயாரிப்புகள்',
    'products.clear': 'வடிப்பான்களை அழிக்கவும்',
    'products.none': 'தயாரிப்புகள் எதுவும் கிடைக்கவில்லை',
    'products.sort.default': 'வரிசைப்படுத்து: சிறப்பம்சமாக',
    'products.sort.price_low': 'விலை: குறைந்த முதல் அதிகம்',
    'products.sort.price_high': 'விலை: அதிக முதல் குறைவு',
    'products.sort.rating': 'சிறந்த மதிப்பீடு',
    'cat.title': 'பிரிவுகள்',
    'cat.view_all': 'அனைத்து பிரிவுகளும்',
    'remedy.title': 'சுகாதார கவலைகள்',
    'cat.Hair Care': 'முடி பராமரிப்பு',
    'cat.Food & Nutrition': 'உணவு & ஊட்டச்சத்து',
    'cat.Skin Care': 'சரும பராமரிப்பு',
    'cat.Rice': 'அரிசி வகைகள்',
    'cat.Oils': 'சமையல் எண்ணெய்கள்',
    'cat.Dals & Grains': 'பருப்பு & தானியங்கள்',
    'cat.Spices & Nuts': 'மசாலா & கொட்டைகள்',
    'cat.Pooja Items': 'பூஜை பொருட்கள்',
    'cat.Ghee & Honey': 'நெய் & தேன்',
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
