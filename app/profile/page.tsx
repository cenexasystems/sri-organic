"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { LogOut, Package, User, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  
  // Simulated orders since we don't have a real backend order fetcher yet
  const mockOrders = [
    {
      id: "ORD-8924-XT",
      date: "Oct 12, 2026",
      status: "Delivered",
      total: "₹360",
      items: [
        { name: "Herbal Hair Oil", qty: 1, size: "100ml" },
        { name: "Shikakai Powder", qty: 1, size: "100g" }
      ]
    },
    {
      id: "ORD-9431-PQ",
      date: "Nov 02, 2026",
      status: "Processing",
      total: "₹500",
      items: [
        { name: "Herbal Hair Oil", qty: 1, size: "250ml" }
      ]
    }
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
              <h2 className="text-2xl font-bold text-[#111111] tracking-tight">{user.user_metadata?.full_name || "Valued Customer"}</h2>
              <p className="text-sm font-medium text-stone-500 mt-1">{user.email}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-between w-full p-4 rounded-2xl bg-stone-50 text-[#111111] font-bold text-sm tracking-wider">
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-[#D4AF37]" /> Order History
                </div>
                <ChevronRight size={16} className="text-stone-400" />
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-rose-50 text-rose-500 font-bold text-sm tracking-wider transition-colors group mt-4"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="text-rose-400 group-hover:text-rose-500" /> Sign Out
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content - Order History */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-[#111111] tracking-tight mb-2">Order History</h1>
            <p className="text-stone-500">Track your past purchases and current shipments.</p>
          </div>

          <div className="flex flex-col gap-6">
            {mockOrders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-stone-100">
                  <div>
                    <h3 className="text-lg font-bold text-[#111111]">{order.id}</h3>
                    <p className="text-xs font-bold text-stone-400 tracking-widest uppercase mt-1">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'Delivered' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Delivered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                        <Clock size={12} /> Processing
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm font-medium">
                      <div className="flex items-center gap-2 text-[#111111]">
                        <span className="text-stone-400">{item.qty}x</span> {item.name} <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full text-stone-500">{item.size}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-stone-100">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">Total Amount</span>
                  <span className="text-xl font-black text-[#111111]">{order.total}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center pt-8">
            <Link href="/products" className="inline-flex items-center text-sm font-bold text-[#D4AF37] hover:text-[#111111] transition-colors">
              Continue Shopping <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
