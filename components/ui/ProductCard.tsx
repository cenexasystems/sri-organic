import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Product, useLanguageStore } from '@/store/store';
import { formatCurrency } from '@/lib/retail';
import { getProductImage, onImgError } from '@/lib/productImages';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { language } = useLanguageStore();
  const lowestPrice = product.predefinedOptions.length > 0 
    ? Math.min(...product.predefinedOptions.map(o => o.price))
    : product.price;
  
  const displayName = language === 'ta' && product.nameTa ? product.nameTa : product.name;
  const secondaryName = language === 'ta' ? product.name : product.nameTa;

  return (
    <div
      onClick={() => onClick(product)}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#e5e7eb]/40 hover:border-[#111111]/40 hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-[#FAF9F5] flex items-center justify-center p-6 border-b border-[#e5e7eb]/20">
        <Image
          src={getProductImage(product.name, product.category, product.imageUrl, 'tile')}
          alt={product.name}
          onError={onImgError}
          width={400}
          height={400}
          className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-[#e5e7eb]/50 shadow-sm w-fit">
            <span className="text-[9px] font-black uppercase text-[#78716c] tracking-wider">
              {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow space-y-3 bg-white">
        <div className="space-y-1">
          <h3 className="font-black text-base text-[#111111] group-hover:text-[#D4AF37] transition-colors leading-tight line-clamp-2">
            {displayName}
          </h3>
          {secondaryName && (
            <p className="text-xs font-bold text-[#78716c] opacity-80">{secondaryName}</p>
          )}
        </div>

        {/* Pricing and Action */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-[#e5e7eb]/30">
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-[#95A28F] uppercase tracking-wider block">
              {language === 'ta' ? 'ஆரம்ப விலை' : 'Starting at'}
            </span>
            <span className="text-lg font-black text-[#111111] block">
              {formatCurrency(lowestPrice)}
            </span>
          </div>

          <button className="shrink-0 w-8 h-8 rounded-full bg-[#f7f4ed] group-hover:bg-[#111111] text-[#111111] group-hover:text-white flex items-center justify-center transition-all">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
