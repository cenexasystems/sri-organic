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

const accordionClass = 'rounded-[22px] border border-[#ead7b7]/60 bg-white px-4 py-3 shadow-sm';

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
    if (nextQty <= 0) {
      removeItem(product.id);
      setMobileQty(0);
      return;
    }
    const pack = mobilePack ?? getCompactPackOptions(product)[0] ?? null;
    const unit = pack?.label ?? product.unitLabel;
    if (mobileQty <= 0) {
      addItem(product, nextQty, unit);
    } else {
      updateQuantity(product.id, nextQty);
    }
    setMobileQty(nextQty);
  };

  const handleMobilePackChange = (option: { quantity: number; unit: string; label: string; price: number }) => {
    if (option.label === mobilePack?.label) return;
    const currentQty = mobileQty;
    setMobilePack(option);
    if (currentQty > 0) {
      removeItem(product.id);
      addItem(product, currentQty, option.label);
    }
  };

  const heroImage = getProductImage(product.name, product.category, product.imageUrl, 'detail');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2c392a]/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative bg-[#fbfaf6] w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-3xl shadow-2xl overflow-y-auto z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-white/95 border border-[#ead7b7]/60 hover:border-[#7daa8f] flex items-center justify-center text-[#2c392a] hover:text-[#7daa8f] shadow-md transition-all duration-300 z-40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Action Bar (Mobile Only) */}
            <div className="lg:hidden sticky top-0 z-30 border-b border-white/60 bg-[#fbfaf6]/92 px-4 py-3 backdrop-blur sm:px-6">
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-full border border-[#ead7b7]/60 bg-white px-3 py-2 text-[11px] font-black text-[#2c392a] shadow-sm"
                >
                  <X size={14} /> Close
                </button>
                <button
                  type="button"
                  onClick={() => void toggle(product)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-black shadow-sm ${
                    favorite ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-[#ead7b7]/60 bg-white text-[#5f6d59]'
                  }`}
                  aria-label={favorite ? 'Remove from favourites' : 'Add to favourites'}
                >
                  <Heart size={14} className={favorite ? 'fill-rose-500 text-rose-500' : 'text-current'} />
                  {favorite ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row h-full">
              {/* Image Section */}
              <div className="w-full lg:w-1/2 p-4 pt-4 sm:p-6 lg:p-8 shrink-0">
                <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-gradient-to-b from-[#f2ede2] via-white to-[#edf3ea] shadow-[0_24px_60px_rgba(45,60,35,0.14)] h-full">
                  <div className="absolute left-4 top-4 z-10 rounded-full bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#5f6d59] shadow-sm backdrop-blur">
                    Premium focus
                  </div>
                  <div className="relative aspect-[4/5] min-h-[40svh] sm:aspect-[16/13] h-full">
                    <img
                      src={heroImage}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      onError={onImgError}
                      className="h-full w-full object-contain p-6 sm:p-10 mix-blend-multiply"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_56%)]" />
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 lg:pl-0 flex flex-col gap-6">
                
                {/* Header info */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7daa8f]">{t('cat.' + product.category)}</p>
                  <h1 className="text-[1.8rem] leading-tight font-black text-[#2c392a] sm:text-4xl">{displayName}</h1>
                  {product.nameTa && <p className="text-base font-bold text-[#5f6d59] ta-text sm:text-lg">{product.nameTa}</p>}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#2c392a] shadow-sm ring-1 ring-[#ead7b7]/50">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {(product.rating || 4.7).toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ed] px-3 py-1.5 text-[11px] font-black text-[#5f6d59] shadow-sm ring-1 ring-[#ead7b7]/45">
                      <span className="text-[#7daa8f]">{formatCurrency(basePrice)}</span>
                      {hasDiscount && <span className="text-[#b0a89a] line-through">{formatCurrency(product.price)}</span>}
                    </span>
                    {discount > 0 && <span className="rounded-full bg-[#2c392a] px-3 py-1.5 text-[11px] font-black text-white">{discount}% OFF</span>}
                  </div>
                </div>

                {/* Pack Selection Desktop */}
                <div className="hidden lg:block rounded-[24px] bg-white/95 p-4 shadow-sm ring-1 ring-[#ead7b7]/55">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7daa8f]">Pack size</p>
                      <p className="mt-1 text-[11px] font-bold text-[#95a28f]">{selectedPackOption?.label ?? product.unitLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#7daa8f]">Price</p>
                      <p className="text-lg font-black text-[#2c392a]">{formatCurrency(lineTotal)}</p>
                    </div>
                  </div>

                  {getCompactPackOptions(product).length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                      {getCompactPackOptions(product).map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setSelectedPackOption(option)}
                          className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-black transition-colors ${
                            selectedPackOption?.label === option.label
                              ? 'border-[#2c392a] bg-[#2c392a] text-white'
                              : 'border-[#ead7b7]/70 bg-[#f7f4ed] text-[#5f6d59]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordions */}
                <div className="grid gap-2.5">
                  <details className={accordionClass} open>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[#2c392a]">
                      <span>Description</span>
                      <ChevronDown size={16} className="text-[#7daa8f] transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-[#5f6d59]">{displayDesc || 'Carefully selected herbal product made for daily use.'}</p>
                  </details>

                  <details className={accordionClass}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[#2c392a]">
                      <span>Benefits & care</span>
                      <ChevronDown size={16} className="text-[#7daa8f] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-3 space-y-2 text-sm leading-relaxed text-[#5f6d59]">
                      <p className="whitespace-pre-line">{displayBen || 'Traditional Siddha preparation for daily household use.'}</p>
                      <p>{buildUsageNote(product)}</p>
                    </div>
                  </details>
                </div>

                {/* Add to Cart Sticky Footer */}
                <div className="sticky bottom-0 mt-auto pt-6 pb-2 bg-[#fbfaf6]">
                  <div className="flex items-center gap-3">
                    <div className="min-w-[80px] hidden lg:block">
                      <p className="text-[11px] font-bold text-[#7daa8f]">Total</p>
                      <p className="text-xl font-black leading-tight text-[#2c392a]">{formatCurrency(lineTotal)}</p>
                    </div>
                    <button
                      onClick={handleAdd}
                      className="flex-1 rounded-2xl bg-[#2c392a] hover:bg-[#1a2318] transition-colors py-4 text-sm font-black text-white shadow-[0_16px_30px_rgba(44,57,42,0.28)]"
                      type="button"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <ShoppingCart size={18} /> Add to Cart
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
