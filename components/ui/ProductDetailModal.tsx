"use client";

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, Minus, Plus, ShoppingCart, Star, X } from 'lucide-react';
import { useCartStore, useFavStore, Product, useLanguageStore } from '@/store/store';
import {
  calculateLineTotal,
  formatCurrency,
} from '@/lib/retail';
import { getProductImage, onImgError } from '@/lib/productImages';
import { toast } from 'react-hot-toast';
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
  const { language } = useLanguageStore();
  const { toggle, isFav } = useFavStore();
  
  const [selectedPackOption, setSelectedPackOption] = useState<{ quantity: number; unit: string; label: string; price: number; isAvailable?: boolean } | null>(null);
  const [qty, setQty] = useState(1);
  const [mobileQty, setMobileQty] = useState(0);
  const [mobilePack, setMobilePack] = useState<{ quantity: number; unit: string; label: string; price: number; isAvailable?: boolean } | null>(null);
  
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
    setQty(1);
    setMobileQty(0);
    setMobilePack(packOpts[0] ?? null);
  }, [product, isOpen]);

  if (!product) return null;

  const displayName = language === 'ta' && product?.nameTa ? product.nameTa : product?.name ?? '';
  const displayDesc = language === 'ta' && product?.descriptionTa ? product.descriptionTa : product?.description ?? '';
  const displayBen = language === 'ta' && product?.benefitsTa ? product.benefitsTa : product?.benefits ?? '';

  const basePrice = product.offerPrice && product.offerPrice < product.price ? product.offerPrice : product.price;
  const currentPrice = selectedPackOption?.price ?? basePrice;
  const lineTotal = currentPrice;
  const hasDiscount = !!(product.offerPrice && product.offerPrice < product.price);
  const discount = hasDiscount
    ? Math.round(((product.price - product.offerPrice!) / product.price) * 100)
    : 0;

  const favorite = isFav(product.id);
  const handleAdd = () => {
    addItem(product, qty, selectedPackOption?.label ?? product.unitLabel);
    onClose();
    toast((t) => (
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold">{qty}x {selectedPackOption?.label ?? product.unitLabel} {product.name} added to cart!</span>
        <a href="/cart" className="text-[#D4AF37] text-xs font-black uppercase tracking-widest hover:underline" onClick={() => toast.dismiss(t.id)}>
          Go to Cart
        </a>
      </div>
    ), { duration: 4500 });
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

  const handleMobilePackChange = (option: { quantity: number; unit: string; label: string; price: number; isAvailable?: boolean }) => {
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
        <div data-lenis-prevent="true" className="fixed inset-0 z-[110] flex items-start md:items-center justify-center p-0 md:p-6 overflow-y-auto overscroll-contain">
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
            data-lenis-prevent="true"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative bg-[#FAF9F5] w-full max-w-4xl h-[100dvh] md:h-[90vh] md:rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden z-10 flex flex-col"
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
                  <X size={14} /> {language === 'ta' ? 'மூடு' : 'Close'}
                </button>
              </div>
            </div>

            <div data-lenis-prevent="true" className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Image Section */}
              <div className="w-full md:w-1/2 shrink-0 bg-stone-100 border-r border-stone-200 relative aspect-square md:aspect-auto md:h-full">
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-stone-200 flex flex-col gap-1 shadow-sm z-10">
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">{product.category}</span>
                </div>
                <img
                  src={heroImage}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  onError={onImgError}
                  className="absolute inset-0 h-full w-full object-contain md:object-cover mix-blend-multiply drop-shadow-xl"
                />
              </div>

              {/* Details Section */}
              <div data-lenis-prevent="true" className="w-full md:w-1/2 px-5 pt-5 pb-0 md:px-12 md:pt-12 md:pb-0 flex flex-col gap-6 md:gap-10 relative bg-white md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* Header info */}
                <div className="space-y-2 md:space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-4xl leading-[1.1] font-bold text-[#111111] tracking-tight">{displayName}</h1>
                    {product.nameTa && <p className="text-sm md:text-lg font-medium text-stone-400 ta-text mt-1">{product.nameTa}</p>}
                  </div>

                  <div className="flex flex-wrap items-end gap-3 pt-2 md:pt-4">
                    <span className="text-2xl md:text-3xl font-bold text-[#111111] leading-none">{formatCurrency(currentPrice)}</span>
                    {hasDiscount && <span className="text-stone-400 line-through text-base md:text-lg pb-1">{formatCurrency(product.price)}</span>}
                    {discount > 0 && <span className="ml-2 rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest pb-1">{discount}% OFF</span>}
                  </div>
                </div>

                {/* Pack Selection Desktop */}
                <div className="border-t border-stone-100 pt-4 md:pt-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400 mb-3 md:mb-4">{language === 'ta' ? 'அளவைத் தேர்ந்தெடுக்கவும்' : 'Select Quantity'}</p>
                  {getCompactPackOptions(product).length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {getCompactPackOptions(product).map((option) => {
                        const isOutOfStock = option.isAvailable === false;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => setSelectedPackOption(option)}
                            className={`relative overflow-hidden rounded-full px-6 py-2.5 text-xs font-bold tracking-wider transition-all ${
                              isOutOfStock
                                ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-60'
                                : selectedPackOption?.label === option.label
                                ? 'border-[#111111] bg-[#111111] text-white shadow-xl'
                                : 'border border-stone-200 bg-white text-[#111111] hover:border-[#D4AF37]'
                            }`}
                          >
                            {option.label}
                            {isOutOfStock && <div className="absolute inset-0 pointer-events-none"><div className="w-[120%] h-[1px] bg-stone-400/50 absolute top-1/2 left-[-10%] -rotate-12"></div></div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordions (Clean Style) */}
                <div className="border-t border-stone-100 pt-4 grid">
                  <details className="group border-b border-stone-100 py-5" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs tracking-widest uppercase font-bold text-[#111111]">
                      <span>{language === 'ta' ? 'விளக்கம்' : 'Description'}</span>
                      <ChevronDown size={14} className="text-[#D4AF37] transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-stone-500 font-medium">{displayDesc || (language === 'ta' ? 'தினசரி ஆரோக்கியத்திற்காக கவனமாக தேர்ந்தெடுக்கப்பட்ட தாவரவியல் தயாரிப்பு.' : 'Carefully selected botanical product made for daily wellness.')}</p>
                  </details>

                  <details className="group border-b border-stone-100 py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs tracking-widest uppercase font-bold text-[#111111]">
                      <span>{language === 'ta' ? 'நன்மைகள் & கவனிப்பு' : 'Benefits & Care'}</span>
                      <ChevronDown size={14} className="text-[#D4AF37] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-4 space-y-3 text-sm leading-relaxed text-stone-500 font-medium">
                      <p className="whitespace-pre-line">{displayBen || (language === 'ta' ? 'தினசரி வீட்டு உபயோகத்திற்கான பாரம்பரிய சித்த தயாரிப்பு.' : 'Traditional Siddha preparation for daily household use.')}</p>
                      <p>{buildUsageNote(product)}</p>
                    </div>
                  </details>
                </div>

                {/* Add to Cart Footer */}
                <div className="mt-auto sticky bottom-0 z-20 bg-white pt-4 pb-8 -mx-5 px-5 border-t border-stone-100 md:pb-12 md:-mx-12 md:px-12 flex flex-col gap-4 shadow-[0_-10px_20px_rgba(255,255,255,1)]">
                  
                  {/* Selected pack info */}
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                       {selectedPackOption?.label ?? product.unitLabel} 
                       {qty > 1 && <span className="normal-case tracking-normal text-[10px] text-stone-400 ml-2">({formatCurrency(currentPrice)} each)</span>}
                     </span>
                     <span className="text-lg font-black text-[#111111]">{formatCurrency(currentPrice * qty)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-between border border-stone-200 rounded-full px-3 py-1.5 w-1/3 bg-stone-50">
                      <button 
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-[#111111]"
                      >
                        <Minus size={14} strokeWidth={2.5} />
                      </button>
                      <span className="font-bold text-sm text-center">{qty}</span>
                      <button 
                        onClick={() => setQty(qty + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-[#111111]"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    </div>

                    <button
                      onClick={handleAdd}
                      disabled={selectedPackOption?.isAvailable === false}
                      className={`flex-1 rounded-full transition-colors py-3.5 text-xs tracking-widest uppercase font-bold text-white flex items-center justify-center gap-2 shadow-xl ${
                        selectedPackOption?.isAvailable === false 
                          ? 'bg-stone-400 cursor-not-allowed opacity-80 shadow-none' 
                          : 'bg-[#111111] hover:bg-[#D4AF37] shadow-black/10'
                      }`}
                      type="button"
                    >
                      <ShoppingCart size={14} /> {selectedPackOption?.isAvailable === false ? (language === 'ta' ? 'கையிருப்பில் இல்லை' : 'Out of Stock') : (language === 'ta' ? 'கார்ட்டில் சேர்' : 'Add to Cart')}
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
