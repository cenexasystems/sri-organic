"use client";

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, Minus, Plus, ShoppingCart, Star, X } from 'lucide-react';
import { useCartStore, useFavStore, Product } from '@/store/store';
import { useLangStore } from '@/store/langStore';
import {
  calculateLineTotal,
  formatCurrency,
} from '@/lib/retail';
import { getProductImage, onImgError } from '@/lib/productImages';

const getCompactPackOptions = (product: Product) => {
  if (product.predefinedOptions.length > 0) return product.predefinedOptions;
  if (product.unitType === 'weight') {
    return [
      { quantity: 100, unit: 'g', label: '100g', price: product.price },
      { quantity: 250, unit: 'g', label: '250g', price: product.price * 2.5 },
      { quantity: 500, unit: 'g', label: '500g', price: product.price * 5 },
    ];
  }
  if (product.unitType === 'volume') {
    return [
      { quantity: 500, unit: 'ml', label: '500ml', price: product.price },
      { quantity: 1000, unit: 'ml', label: '1L', price: product.price * 2 },
    ];
  }
  return [];
};

const buildUsageNote = (product: Product) => {
  if (product.unitType === 'weight' || product.unitType === 'volume') {
    return 'Use as per traditional practice. Store in a cool, dry place away from moisture.';
  }
  return 'Use as per traditional practice. Store in a clean, dry place.';
};

const accordionClass = 'rounded-[22px] border border-[#e5e7eb]/60 bg-white px-4 py-3 shadow-sm';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { t, lang } = useLangStore();
  const { toggle, isFav } = useFavStore();
  
  const [selectedPackOption, setSelectedPackOption] = useState<{ quantity: number; unit: string; label: string; price: number } | null>(null);
  const [mobileQty, setMobileQty] = useState(0);
  const [mobilePack, setMobilePack] = useState<{ quantity: number; unit: string; label: string; price: number } | null>(null);
  
  // Fake related products for now (UI demonstration)
  const relatedProducts: Product[] = [];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);


  useEffect(() => {
    if (!product) return;
    const packOpts = getCompactPackOptions(product);
    setSelectedPackOption(packOpts[0] ?? null);
    setMobileQty(0);
    setMobilePack(packOpts[0] ?? null);
  }, [product, isOpen]);

  if (!product) return null;

  const displayName = lang === 'ta' && product?.nameTa ? product.nameTa : product?.name ?? '';
  const displayDesc = lang === 'ta' && product?.descriptionTa ? product.descriptionTa : product?.description ?? '';
  const displayBen = lang === 'ta' && product?.benefitsTa ? product.benefitsTa : product?.benefits ?? '';

  const basePrice = product.offerPrice && product.offerPrice < product.price ? product.offerPrice : product.price;
  const currentPrice = selectedPackOption?.price ?? basePrice;
  const lineTotal = currentPrice;
  const hasDiscount = !!(product.offerPrice && product.offerPrice < product.price);
  const discount = hasDiscount
    ? Math.round(((product.price - product.offerPrice!) / product.price) * 100)
    : 0;

  const favorite = isFav(product.id);
  const handleAdd = () => {
    addItem(product, 1, selectedPackOption?.label ?? product.unitLabel);
    onClose();
  };

  const handleMobileAdd = () => {
    const pack = mobilePack ?? getCompactPackOptions(product)[0] ?? null;
    addItem(product, 1, pack?.label ?? product.unitLabel);
    setMobileQty(1);
  };

  const handleMobileChangeQty = (nextQty: number) => {
    const pack = mobilePack ?? getCompactPackOptions(product)[0] ?? null;
    const unit = pack?.label ?? product.unitLabel;
    if (nextQty <= 0) {
      removeItem(product.id, unit);
      setMobileQty(0);
      return;
    }
    if (mobileQty <= 0) {
      addItem(product, nextQty, unit);
    } else {
      updateQuantity(product.id, unit, nextQty);
    }
    setMobileQty(nextQty);
  };

  const handleMobilePackChange = (option: { quantity: number; unit: string; label: string; price: number }) => {
    if (option.label === mobilePack?.label) return;
    const currentQty = mobileQty;
    const currentUnit = mobilePack?.label ?? getCompactPackOptions(product)[0]?.label ?? product.unitLabel;
    setMobilePack(option);
    if (currentQty > 0) {
      removeItem(product.id, currentUnit);
      addItem(product, currentQty, option.label);
    }
  };

  const heroImage = getProductImage(product.name, product.category, product.imageUrl, 'detail');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-start md:items-center justify-center p-0 md:p-6 overflow-y-auto overscroll-contain">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#111111]/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative bg-[#FAF9F5] w-full max-w-4xl min-h-[100dvh] md:min-h-0 h-auto md:max-h-[90vh] md:rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-visible md:overflow-hidden z-10 flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="hidden md:flex absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-white/95 border border-[#e5e7eb]/60 hover:border-[#D4AF37] items-center justify-center text-[#111111] hover:text-[#D4AF37] shadow-md transition-all duration-300 z-40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Action Bar (Mobile Only) */}
            <div className="md:hidden sticky top-0 z-30 border-b border-white/60 bg-[#FAF9F5]/92 px-4 py-3 backdrop-blur sm:px-6 shrink-0">
              <div className="mx-auto flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb]/60 bg-white px-3 py-2 text-[11px] font-black text-[#111111] shadow-sm"
                >
                  <X size={14} /> Close
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row flex-none md:flex-1 md:min-h-0 overflow-y-visible md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Image Section */}
              <div className="w-full md:w-1/2 shrink-0 bg-stone-100 border-r border-stone-200 relative aspect-square md:aspect-auto md:min-h-0">
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-stone-200 flex flex-col gap-1 shadow-sm z-10">
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">{product.category}</span>
                </div>
                <img
                  src={heroImage}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  onError={onImgError}
                  className="absolute inset-0 h-full w-full object-cover mix-blend-multiply drop-shadow-xl"
                />
              </div>

              {/* Details Section */}
              <div className="w-full md:w-1/2 px-8 pt-8 pb-0 md:px-12 md:pt-12 md:pb-0 flex flex-col gap-10 relative bg-white">
                
                {/* Header info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">{t('cat.' + product.category)}</p>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-2 py-1 text-[10px] font-black text-[#111111]">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      {(product.rating || 4.7).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl leading-[1.1] font-bold text-[#111111] tracking-tight">{displayName}</h1>
                    {product.nameTa && <p className="text-lg font-medium text-stone-400 ta-text mt-2">{product.nameTa}</p>}
                  </div>

                  <div className="flex flex-wrap items-end gap-3 pt-4">
                    <span className="text-3xl font-bold text-[#111111] leading-none">{formatCurrency(currentPrice)}</span>
                    {hasDiscount && <span className="text-stone-400 line-through text-lg pb-1">{formatCurrency(product.price)}</span>}
                    {discount > 0 && <span className="ml-2 rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest pb-1">{discount}% OFF</span>}
                  </div>
                </div>

                {/* Pack Selection Desktop */}
                <div className="border-t border-stone-100 pt-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400 mb-4">Select Quantity</p>
                  {getCompactPackOptions(product).length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {getCompactPackOptions(product).map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setSelectedPackOption(option)}
                          className={`rounded-full px-6 py-2.5 text-xs font-bold tracking-wider transition-all ${
                            selectedPackOption?.label === option.label
                              ? 'border-[#111111] bg-[#111111] text-white shadow-xl'
                              : 'border border-stone-200 bg-white text-[#111111] hover:border-[#D4AF37]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordions (Clean Style) */}
                <div className="border-t border-stone-100 pt-4 grid">
                  <details className="group border-b border-stone-100 py-5" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs tracking-widest uppercase font-bold text-[#111111]">
                      <span>Description</span>
                      <ChevronDown size={14} className="text-[#D4AF37] transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-stone-500 font-medium">{displayDesc || 'Carefully selected botanical product made for daily wellness.'}</p>
                  </details>

                  <details className="group border-b border-stone-100 py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs tracking-widest uppercase font-bold text-[#111111]">
                      <span>Benefits & Care</span>
                      <ChevronDown size={14} className="text-[#D4AF37] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-4 space-y-3 text-sm leading-relaxed text-stone-500 font-medium">
                      <p className="whitespace-pre-line">{displayBen || 'Traditional Siddha preparation for daily household use.'}</p>
                      <p>{buildUsageNote(product)}</p>
                    </div>
                  </details>
                </div>

                {/* Add to Cart Footer */}
                <div className="mt-auto sticky bottom-0 z-20 bg-white pt-4 pb-8 -mx-8 px-8 border-t border-stone-100 md:pb-12 md:-mx-12 md:px-12 flex gap-4">
                  <button
                    onClick={handleAdd}
                    className="flex-1 rounded-full bg-[#111111] hover:bg-[#D4AF37] transition-colors py-4 text-xs tracking-widest uppercase font-bold text-white flex items-center justify-center gap-3 shadow-xl shadow-black/10"
                    type="button"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
