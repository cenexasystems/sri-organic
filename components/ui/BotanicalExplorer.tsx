"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Sparkles, ShieldCheck, Leaf } from "lucide-react";

interface Hotspot {
  id: number;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  description: string;
  icon: React.ElementType;
}

const hotspots: Hotspot[] = [
  {
    id: 1,
    x: 35,
    y: 25,
    title: "Rich Antioxidants",
    description: "Our black rice varieties contain high levels of anthocyanins, naturally protecting your cells.",
    icon: Sparkles
  },
  {
    id: 2,
    x: 65,
    y: 45,
    title: "Zero Chemicals",
    description: "Cultivated strictly using regenerative farming, absolutely no synthetic fertilizers are used.",
    icon: ShieldCheck
  },
  {
    id: 3,
    x: 40,
    y: 75,
    title: "Vital Nutrients",
    description: "Stone ground and cold-pressed to ensure heat doesn't destroy the natural enzymes.",
    icon: Leaf
  }
];

export default function BotanicalExplorer() {
  const [activeSpot, setActiveSpot] = useState<number | null>(null);

  return (
    <section className="py-32 px-8 md:px-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        
        {/* Text */}
        <div className="w-full md:w-1/3 order-1 md:order-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-[1px] bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase">Interactive</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight mb-8 leading-[1.1]">
            Explore the Anatomy of Purity.
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed mb-8">
            Every grain, leaf, and drop we produce is dense with native nutrients. Interact with the hotspots to uncover the clinical benefits preserved in our harvest.
          </p>
          <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase text-[#111111]">
            <span className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center animate-pulse">
              <Plus size={14} />
            </span>
            Click hotspots to explore
          </div>
        </div>

        {/* Image with Hotspots */}
        <div className="w-full md:w-2/3 relative order-2 md:order-1">
          <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[40px] overflow-hidden bg-stone-100 shadow-2xl">
            {/* Base Image */}
            <img 
              src="/traditional_black_rice_1783344030589.png" 
              alt="Organic Spices and Grains" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-500" style={{ opacity: activeSpot ? 0.6 : 0.2 }} />

            {/* Hotspots */}
            {hotspots.map((spot) => (
              <div 
                key={spot.id} 
                className="absolute z-10"
                style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {/* Hotspot Button */}
                <button
                  onClick={() => setActiveSpot(activeSpot === spot.id ? null : spot.id)}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    activeSpot === spot.id 
                      ? 'bg-white text-[#111111] scale-110 shadow-lg' 
                      : 'bg-[#111111]/80 text-white hover:bg-[#D4AF37] hover:text-white backdrop-blur-md border border-white/20'
                  }`}
                >
                  <motion.div
                    animate={{ rotate: activeSpot === spot.id ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </motion.div>
                  
                  {/* Ripple effect when inactive */}
                  {activeSpot !== spot.id && (
                    <span className="absolute inset-0 rounded-full border border-white animate-ping opacity-30"></span>
                  )}
                </button>

                {/* Hotspot Tooltip */}
                <AnimatePresence>
                  {activeSpot === spot.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute top-14 left-1/2 -translate-x-1/2 w-[280px] bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-stone-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#D4AF37]">
                          <spot.icon size={16} />
                        </div>
                        <h4 className="font-bold text-[#111111]">{spot.title}</h4>
                      </div>
                      <p className="text-sm text-stone-500 leading-relaxed">
                        {spot.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
