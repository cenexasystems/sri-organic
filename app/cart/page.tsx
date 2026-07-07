"use client";

import { useState } from "react";
import { useCartStore } from "@/store/store";
import { getProductImage, onImgError } from "@/lib/productImages";
import { formatCurrency } from "@/lib/retail";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: ""
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const subtotal = items.reduce((total, item) => {
    // Find the specific predefined option to get the correct price
    const option = item.product.predefinedOptions?.find(opt => opt.label === item.unit);
    const itemPrice = option ? option.price : item.product.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  const discountAmount = appliedCoupon ? subtotal * 0.1 : 0; // Flat 10% discount for valid coupon
  const total = subtotal - discountAmount;

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length <= 10) {
      setFormData({ ...formData, mobile: val });
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toLowerCase() === "organic10") {
      setAppliedCoupon(couponCode);
    } else {
      alert("Invalid Coupon Code (Hint: try ORGANIC10)");
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = () => {
    if (!formData.name || formData.mobile.length !== 10 || !formData.address) {
      alert("Please fill in your Name, a valid 10-digit Mobile Number, and Address.");
      return;
    }
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    // Proceed to checkout logic (e.g. API call)
    alert("Order Placed Successfully!");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase">Checkout</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight">Your Cart.</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] shadow-sm border border-stone-200">
            <h3 className="text-2xl font-bold text-[#111111] mb-4">Your cart is empty</h3>
            <p className="text-stone-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/#products" className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-[#D4AF37] transition-colors">
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            
            {/* Left Side: Items & Form */}
            <div className="w-full lg:w-2/3 flex flex-col gap-12">
              
              {/* Delivery Details Form */}
              <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-stone-200">
                <h2 className="text-xl font-bold text-[#111111] mb-8 pb-4 border-b border-stone-100">Delivery Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-stone-500">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your name" 
                      className="px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-stone-500">Mobile Number</label>
                    <input 
                      type="text" 
                      value={formData.mobile}
                      onChange={handleMobileChange}
                      placeholder="10-digit number" 
                      className="px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-stone-500">Delivery Address</label>
                    <textarea 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Enter your full address" 
                      rows={3}
                      className="px-5 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none font-medium"
                    />
                  </div>
                </div>
              </div>
              
              {/* Cart Items List */}
              <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-stone-200">
                <h2 className="text-xl font-bold text-[#111111] mb-8 pb-4 border-b border-stone-100">Review Items</h2>
                <div className="flex flex-col gap-6">
                  <AnimatePresence>
                    {items.map((item) => {
                      const option = item.product.predefinedOptions?.find(opt => opt.label === item.unit);
                      const itemPrice = option ? option.price : item.product.price;
                      const heroImage = getProductImage(item.product.name, item.product.category, item.product.imageUrl, 'thumb');

                      return (
                        <motion.div 
                          key={`${item.product.id}-${item.unit}`}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl border border-stone-100 hover:border-[#D4AF37] transition-colors bg-stone-50/50"
                        >
                          <div className="w-24 h-24 shrink-0 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm">
                            <img src={heroImage} alt={item.product.name} onError={onImgError} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-1">{item.product.category}</p>
                            <h4 className="text-lg font-bold text-[#111111] leading-tight">{item.product.name}</h4>
                            <p className="text-xs text-stone-500 font-medium mt-1">Size: {item.unit}</p>
                            <div className="mt-3 text-lg font-black text-[#111111]">
                              {formatCurrency(itemPrice)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-3 bg-white rounded-full border border-stone-200 p-1">
                              <button 
                                onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeItem(item.product.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-full text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Right Side: Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-[#111111] p-8 rounded-[40px] shadow-2xl text-white sticky top-32">
                <h2 className="text-2xl font-bold tracking-tight mb-8">Order Summary</h2>
                
                {/* Coupon Code */}
                <div className="flex flex-col gap-3 mb-8 pb-8 border-b border-white/10">
                  <label className="text-xs font-bold tracking-widest uppercase text-[#D4AF37]">Coupon Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code" 
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#D4AF37] text-white uppercase"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="px-6 py-3 bg-white text-[#111111] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#D4AF37] hover:text-white transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-emerald-400 text-xs font-bold">✓ Coupon '{appliedCoupon}' applied successfully!</p>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between items-center text-sm font-medium text-white/70">
                    <span>Subtotal</span>
                    <span className="text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-sm font-medium text-emerald-400">
                      <span>Discount (10%)</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start text-sm">
                    <span className="font-medium text-white/70">Delivery</span>
                    <span className="text-red-500 font-bold text-right max-w-[150px] leading-snug">Calculated based on Address</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-end mb-10 pt-6 border-t border-white/10">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">Total</span>
                  <span className="text-4xl font-black">{formatCurrency(total)}</span>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  className="w-full py-5 rounded-2xl bg-[#D4AF37] text-[#111111] text-sm font-black uppercase tracking-widest hover:bg-white transition-colors shadow-xl"
                >
                  Proceed to Checkout
                </button>
                
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
