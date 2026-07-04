import { create } from 'zustand';
import { fetchProducts as dbFetchProducts, Product as DbProduct } from '@/lib/db';

export interface Product {
  id: string;
  name: string;
  nameTa?: string;
  description: string;
  descriptionTa?: string;
  benefits: string;
  benefitsTa?: string;
  category: string;
  remedy: string[];
  price: number;
  offerPrice?: number;
  rating: number;
  isActive: boolean;
  unitType: 'weight' | 'volume' | 'unit';
  unitLabel: string;
  imageUrl: string;
  predefinedOptions: { quantity: number; unit: string; label: string; price: number }[];
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'herbal-hair-oil',
    name: 'Herbal Hair Oil',
    nameTa: 'மூலிகை கூந்தல் எண்ணெய்',
    category: 'Hair Care',
    price: 220,
    offerPrice: 220,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1608248593842-83b6f0010903?auto=format&fit=crop&q=80',
    description: 'A pure, organic herbal hair oil that controls premature greying, boosts volume, and reduces dandruff.',
    isActive: true,
    benefits: 'Controls premature greying\nBoosts volume and hair growth\nProtects from UV Rays\nReduces dandruff',
    remedy: ['Hair Fall', 'Dandruff', 'Premature Greying'],
    unitType: 'volume',
    unitLabel: 'ml',
    predefinedOptions: [
      { quantity: 100, unit: 'ml', label: '100ml', price: 220 },
      { quantity: 250, unit: 'ml', label: '250ml', price: 500 }
    ]
  },
  {
    id: 'shikakai-powder',
    name: 'Shikakai Powder',
    nameTa: 'சிகைக்காய் பொடி',
    category: 'Hair Care',
    price: 140,
    offerPrice: 140,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1616766468449-36471801ccbe?auto=format&fit=crop&q=80',
    description: '100% botanical hair wash powder that strengthens roots and prevents hair loss naturally.',
    isActive: true,
    benefits: 'Strengthens hair root and healthy scalp\nPrevents hair loss\nActs as anti-dandruff agent',
    remedy: ['Hair Fall', 'Dandruff'],
    unitType: 'weight',
    unitLabel: 'g',
    predefinedOptions: [
      { quantity: 100, unit: 'g', label: '100g', price: 140 }
    ]
  },
  {
    id: 'multi-millet-mix',
    name: 'Multi Millet Mix',
    nameTa: 'சத்து மாவு',
    category: 'Food & Nutrition',
    price: 220,
    offerPrice: 220,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80',
    description: 'Nutritious health mix made of 40+ ancient grains, millets, and dry fruits.',
    isActive: true,
    benefits: '100% Nutritious 40+ Ancient Grains\nRich in Fiber\nHigh Protein',
    remedy: ['Immunity', 'Digestion', 'Energy'],
    unitType: 'weight',
    unitLabel: 'g',
    predefinedOptions: [
      { quantity: 250, unit: 'g', label: '250g', price: 220 },
      { quantity: 500, unit: 'g', label: '500g', price: 420 }
    ]
  }
];


export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const dbProducts = await dbFetchProducts();
      let mapped: Product[] = dbProducts.map((p) => {
        // Map db sizes to predefined options
        const predefinedOptions = p.sizes.map((s) => ({
          quantity: parseInt(s.size.replace(/[^0-9]/g, '')) || 1,
          unit: s.size.replace(/[0-9]/g, '').trim().toLowerCase() || 'unit',
          label: s.size,
          price: s.price,
        }));

        // Determine unit type
        let unitType: 'weight' | 'volume' | 'unit' = 'unit';
        let unitLabel = 'unit';
        if (predefinedOptions.length > 0) {
          const u = predefinedOptions[0].unit;
          if (['g', 'kg', 'gm'].includes(u)) {
            unitType = 'weight';
            unitLabel = 'g';
          } else if (['ml', 'l'].includes(u)) {
            unitType = 'volume';
            unitLabel = 'ml';
          }
        }

        return {
          id: p.id,
          name: p.name,
          nameTa: p.tamilName,
          description: p.description,
          benefits: p.benefits ? p.benefits.join('\n') : '',
          category: p.category,
          remedy: p.herbs ? p.herbs.split(',').map((h) => h.trim()) : [],
          price: p.sizes && p.sizes.length > 0 ? Math.min(...p.sizes.map(s => s.price)) : 0,
          offerPrice: p.sizes && p.sizes.length > 0 ? Math.min(...p.sizes.map(s => s.price)) : 0, // no offers yet
          rating: 4.8,
          isActive: p.isAvailable ?? true,
          unitType,
          unitLabel,
          imageUrl: p.image || '',
          predefinedOptions,
        };
      });
      
      if (mapped.length === 0) {
        mapped = MOCK_PRODUCTS;
      }
      
      set({ products: mapped, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch', loading: false });
    }
  },
}));

interface VariantStore {
  variantsMap: Record<string, any[]>;
}

export const useVariantStore = create<VariantStore>(() => ({
  variantsMap: {},
}));

interface CartItem {
  product: Product;
  quantity: number;
  unit: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, unit: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (product, quantity, unit) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity, unit }] };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    })),
}));

interface FavStore {
  favorites: string[];
  toggle: (product: Product) => void;
  isFav: (productId: string) => boolean;
}

export const useFavStore = create<FavStore>((set, get) => ({
  favorites: [],
  toggle: (product) => {
    const isFav = get().favorites.includes(product.id);
    if (isFav) {
      set((state) => ({ favorites: state.favorites.filter((id) => id !== product.id) }));
    } else {
      set((state) => ({ favorites: [...state.favorites, product.id] }));
    }
  },
  isFav: (productId) => get().favorites.includes(productId),
}));
