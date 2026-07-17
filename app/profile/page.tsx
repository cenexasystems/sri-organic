"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { useLanguageStore } from '@/store/store';
import { fetchOrdersByEmail } from '@/lib/db';
import type { Order } from '@/lib/db';
import { LogOut, Package, User, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const { language } = useLanguageStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.email) {
      fetchOrdersByEmail(user.email)
        .then(data => {
          setOrders(data);
          setOrdersLoading(false);
        })
        .catch(err => {
          console.error("Failed to load orders:", err);
          setOrdersLoading(false);
        });
    }
  }, [user?.email]);

  if (loading || !user) {
    return <div className="min-h-screen bg-[#FAF9F5]" />;
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] pt-24 md:pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col lg:flex-row gap-12">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-200 sticky top-32">
            <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-stone-100">
              <div className="w-20 h-20 rounded-full bg-stone-100 border-4 border-white shadow-md flex items-center justify-center mb-4">
                <User size={32} className="text-stone-400" />
              </div>
              <h2 className="text-2xl font-bold text-[#111111] tracking-tight">{user.user_metadata?.full_name || (language === 'ta' ? 'மதிப்பிற்குரிய வாடிக்கையாளர்' : 'Valued Customer')}</h2>
              <p className="text-sm font-medium text-stone-500 mt-1">{user.email}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-between w-full p-4 rounded-2xl bg-stone-50 text-[#111111] font-bold text-sm tracking-wider">
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-[#D4AF37]" /> {language === 'ta' ? 'ஆர்டர் வரலாறு' : 'Order History'}
                </div>
                <ChevronRight size={16} className="text-stone-400" />
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-rose-50 text-rose-500 font-bold text-sm tracking-wider transition-colors group mt-4"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="text-rose-400 group-hover:text-rose-500" /> {language === 'ta' ? 'வெளியேறு' : 'Sign Out'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content - Order History */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-[#111111] tracking-tight mb-2">{language === 'ta' ? 'ஆர்டர் வரலாறு' : 'Order History'}</h1>
            <p className="text-stone-500">{language === 'ta' ? 'உங்கள் கடந்த கால வாங்குதல்கள் மற்றும் தற்போதைய ஏற்றுமதிகளைக் கண்காணிக்கவும்.' : 'Track your past purchases and current shipments.'}</p>
          </div>

          <div className="flex flex-col gap-6">
            {ordersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-stone-200">
                <p className="text-stone-500 font-medium">{language === 'ta' ? 'ஆர்டர்கள் எதுவும் கிடைக்கவில்லை.' : 'No orders found.'}</p>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id}
                  style={{ opacity: 1, transform: 'translateY(0)' }}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-stone-100">
                    <div>
                      <h3 className="text-lg font-bold text-[#111111]">{order.id}</h3>
                      <p className="text-xs font-bold text-stone-400 tracking-widest uppercase mt-1">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={12} /> {language === 'ta' ? 'முடிந்தது' : 'Completed'}
                        </span>
                      ) : order.status === 'Cancelled' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                          <Clock size={12} /> {language === 'ta' ? 'ரத்து செய்யப்பட்டது' : 'Cancelled'}
                        </span>
                      ) : order.status === 'Processing' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                          <Clock size={12} /> {language === 'ta' ? 'செயலாக்கத்தில்' : 'Processing'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                          <Clock size={12} /> {order.status === 'Pending' && language === 'ta' ? 'நிலுவையில்' : order.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-stone-50 p-3 sm:p-4 rounded-xl border border-stone-100 transition-colors hover:bg-stone-100/50">
                        <div className="flex items-center gap-3 md:gap-4 text-[#111111]">
                          <span className="flex items-center justify-center bg-white border border-stone-200 rounded-lg w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-black text-stone-600 shadow-sm shrink-0">{item.quantity}x</span>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm sm:text-base leading-tight">{item.name}</span>
                            <span className="text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-widest mt-0.5">{item.size}</span>
                          </div>
                        </div>
                        <div className="text-sm sm:text-base font-black text-[#111111] shrink-0 ml-2">
                          {item.price ? `₹${(item.price * item.quantity).toLocaleString('en-IN')}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-stone-100">
                    <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">{language === 'ta' ? 'மொத்த தொகை' : 'Total Amount'}</span>
                    <span className="text-xl font-black text-[#111111]">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center pt-8">
            <Link href="/products" className="inline-flex items-center text-sm font-bold text-[#D4AF37] hover:text-[#111111] transition-colors">
              {language === 'ta' ? 'தொடர்ந்து வாங்க' : 'Continue Shopping'} <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
