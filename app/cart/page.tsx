"use client";

import { useState } from "react";
import { useCartStore } from "@/store/store";
import { getProductImage, onImgError } from "@/lib/productImages";
import { formatCurrency } from "@/lib/retail";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { insertOrder } from "@/lib/db";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/useAuth";

import { useEffect } from "react";

export default function CartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
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

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!formData.name.trim() || formData.mobile.length !== 10 || !formData.address.trim()) {
      alert("Please fill in your Name, a valid 10-digit Mobile Number, and Address.");
      return;
    }
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsCheckingOut(true);

    // Generate Order ID
    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Save to Database
      await insertOrder({
        id: orderId,
        customerName: formData.name.trim(),
        customerPhone: formData.mobile.trim(),
        customerEmail: user?.email || '',
        customerAddress: formData.address.trim(),
        source: 'ONLINE',
        items: items.map(i => {
          const opt = i.product.predefinedOptions?.find(o => o.label === i.unit);
          return {
            productId: i.product.id,
            name: i.product.name,
            size: i.unit,
            quantity: i.quantity,
            price: opt ? opt.price : i.product.price
          };
        }),
        subtotal: subtotal,
        totalPrice: total,
        status: 'Pending',
        couponCode: appliedCoupon || undefined,
        couponDiscount: appliedCoupon ? discountAmount : 0,
        manualDiscount: 0,
        deliveryCharge: 0,
        cashReceived: 0,
        changeReturned: 0,
        createdAt: new Date().toISOString()
      });

      // 2. Build WhatsApp Message
      const eSparkle = String.fromCodePoint(0x2728);
      const eBell = String.fromCodePoint(0x1F514);
      const ePerson = String.fromCodePoint(0x1F464);
      const ePhone = String.fromCodePoint(0x1F4DE);
      const eMobile = String.fromCodePoint(0x1F4F1);
      const ePin = String.fromCodePoint(0x1F4CD);
      const eCart = String.fromCodePoint(0x1F6D2);
      const ePackage = String.fromCodePoint(0x1F4E6);
      const eTag = String.fromCodePoint(0x1F516);
      const eCheck = String.fromCodePoint(0x2705);
      const eDollar = String.fromCodePoint(0x1F4B5);
      const eMoney = String.fromCodePoint(0x1F4B0);
      const eTruck = String.fromCodePoint(0x1F69A);
      const eTicket = String.fromCodePoint(0x1F3AB);
      
      let message = `${eSparkle} *New Order Inquiry (${orderId})* ${eBell}\n\n`;
      
      message += `${ePerson} *Customer Details:*\n`;
      message += `• ${ePhone} Name: ${formData.name.trim()}\n`;
      message += `• ${eMobile} Phone: ${formData.mobile.trim()}\n`;
      message += `• ${ePin} Delivery Address: ${formData.address.trim()}\n\n`;

      message += `${eCart} *Items:*\n\n`;
      
      items.forEach((item, index) => {
        const option = item.product.predefinedOptions?.find(opt => opt.label === item.unit);
        const itemPrice = option ? option.price : item.product.price;
        const subPrice = itemPrice * item.quantity;
        
        message += `${ePackage} *${index + 1}. ${item.product.name}*\n`;
        message += `• ${eTag} Category: ${item.product.category}\n`;
        message += `• 📏 Size: ${item.unit}\n`;
        message += `• Qty: ${item.quantity}\n`;
        message += `• ${eDollar} *Subtotal:* ₹${subPrice.toLocaleString('en-IN')}\n\n`;
      });

      message += `*Billing Summary:*\n`;
      message += `${eDollar} *Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
      if (appliedCoupon) {
        message += `${eTicket} *Coupon Applied (${appliedCoupon}):* -₹${discountAmount.toLocaleString('en-IN')}\n`;
      }
      message += `${eMoney} *Total Amount:* ₹${total.toLocaleString('en-IN')}\n\n`;
      
      message += `${eTruck} *Delivery Details:* Delivery charges may apply based on location.\n`;
      message += `${ePhone} *GPay Number:* 7904199050\n\n`;
      message += `Please let me know the delivery details and next steps! ${eSparkle}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917904199050';
      const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${encodedMessage}`;

      // 3. Clear cart & redirect
      clearCart();
      window.open(whatsappUrl, '_blank');
      router.push('/profile');

    } catch (err) {
      console.error("Failed to place order", err);
      alert("There was an issue placing your order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center pt-24 md:pt-32">
        <div className="text-[#D4AF37] text-sm tracking-widest uppercase font-bold animate-pulse">Loading Cart...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase">Checkout</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight">Your Cart.</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-stone-200">
            <h3 className="text-2xl font-bold text-[#111111] mb-4">Your cart is empty</h3>
            <p className="text-stone-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-[#D4AF37] transition-colors">
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            
            {/* Left Side: Items & Form */}
            <div className="w-full lg:w-2/3 flex flex-col gap-12">
              
              {/* Delivery Details Form */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200">
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
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200">
                <h2 className="text-xl font-bold text-[#111111] mb-8 pb-4 border-b border-stone-100">Review Items</h2>
                <div className="flex flex-col gap-6">
                  <AnimatePresence>
                    {items.map((item) => {
                      const option = item.product.predefinedOptions?.find(opt => opt.label === item.unit);
                      const itemPrice = option ? option.price : item.product.price;
                      const heroImage = getProductImage(item.product.name, item.product.category, item.product.imageUrl, 'tile');

                      return (
                          <motion.div 
                            key={`${item.product.id}-${item.unit}`}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-stone-100 bg-stone-50/50"
                          >
                            <div className="flex flex-row items-center gap-4 flex-1">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm">
                                <img src={heroImage} alt={item.product.name} onError={onImgError} className="w-full h-full object-contain mix-blend-multiply" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-1">{item.product.category}</p>
                                <h4 className="text-base sm:text-lg font-bold text-[#111111] leading-tight">{item.product.name}</h4>
                                <p className="text-xs text-stone-500 font-medium mt-1">Size: {item.unit}</p>
                                <div className="mt-2 sm:mt-3 text-base sm:text-lg font-black text-[#111111]">
                                  {formatCurrency(itemPrice)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-stone-200">
                              <div className="flex items-center gap-3 bg-white rounded-full border border-stone-200 p-1">
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.unit, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.unit, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeItem(item.product.id, item.unit)}
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
              <div className="bg-[#111111] p-6 md:p-8 rounded-3xl shadow-2xl text-white sticky top-32">
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
                  disabled={isCheckingOut}
                  className="w-full py-5 rounded-2xl bg-[#25D366] text-white text-sm font-black uppercase tracking-widest hover:bg-[#128C7E] transition-colors shadow-xl flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isCheckingOut ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Order via WhatsApp
                    </>
                  )}
                </button>
                
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
