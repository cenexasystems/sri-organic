"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguageStore } from "@/store/store";

type ConcernKey = "rice" | "oils" | "spices" | "wellness";

const CONCERNS_EN = {
  rice: {
    title: "Heirloom Rice Varieties",
    desc: "Ancient grains cultivated for maximum nutrition and authentic taste.",
    ingredients: [
      { name: "Black Kavuni", percent: "40", desc: "Antioxidants", color: "#451a03" }, 
      { name: "Mapillai Samba", percent: "30", desc: "Strength", color: "#9a3412" }, 
      { name: "Thooyamalli", percent: "20", desc: "Immunity", color: "#d97706" }, 
      { name: "Kullakar", percent: "10", desc: "Vitality", color: "#b45309" } 
    ]
  },
  oils: {
    title: "Wood Pressed Oils",
    desc: "Slow-extracted using traditional wooden cold-press methods.",
    ingredients: [
      { name: "Groundnut Oil", percent: "45", desc: "Cooking", color: "#d97706" },
      { name: "Sesame Oil", percent: "30", desc: "Heart Health", color: "#111111" },
      { name: "Coconut Oil", percent: "15", desc: "Skin & Hair", color: "#fcd34d" },
      { name: "Castor Oil", percent: "10", desc: "Therapeutic", color: "#78350f" }
    ]
  },
  spices: {
    title: "Organic Spices",
    desc: "Sun-dried and hand-pounded for intense aroma and clinical purity.",
    ingredients: [
      { name: "Turmeric", percent: "40", desc: "Curcumin", color: "#f59e0b" },
      { name: "Black Pepper", percent: "30", desc: "Bioenhancer", color: "#1e293b" },
      { name: "Cardamom", percent: "20", desc: "Aroma", color: "#10b981" },
      { name: "Clove", percent: "10", desc: "Antimicrobial", color: "#92400e" }
    ]
  },
  wellness: {
    title: "Daily Wellness",
    desc: "Botanical blends to fortify natural defenses and sustain energy.",
    ingredients: [
      { name: "Ashwagandha", percent: "40", desc: "Adaptogen", color: "#b45309" },
      { name: "Moringa", percent: "30", desc: "Superfood", color: "#15803d" },
      { name: "Amla", percent: "20", desc: "Vitamin C", color: "#65a30d" },
      { name: "Tulsi", percent: "10", desc: "Resilience", color: "#059669" }
    ]
  }
};

const CONCERNS_TA = {
  rice: {
    title: "பாரம்பரிய நெல் வகைகள்",
    desc: "அதிகபட்ச ஊட்டச்சத்து மற்றும் உண்மையான சுவைக்காக வளர்க்கப்படும் பழங்கால தானியங்கள்.",
    ingredients: [
      { name: "கருப்பு கவுனி", percent: "40", desc: "ஆக்ஸிஜனேற்றிகள்", color: "#451a03" }, 
      { name: "மாப்பிள்ளை சம்பா", percent: "30", desc: "வலிமை", color: "#9a3412" }, 
      { name: "தூயமல்லி", percent: "20", desc: "நோய் எதிர்ப்பு சக்தி", color: "#d97706" }, 
      { name: "குள்ளக்கார்", percent: "10", desc: "ஆற்றல்", color: "#b45309" } 
    ]
  },
  oils: {
    title: "மரச்செக்கு எண்ணெய்கள்",
    desc: "பாரம்பரிய மரச்செக்கு முறைகளைப் பயன்படுத்தி மெதுவாகப் பிரித்தெடுக்கப்பட்டது.",
    ingredients: [
      { name: "கடலை எண்ணெய்", percent: "45", desc: "சமையல்", color: "#d97706" },
      { name: "நல்லெண்ணெய்", percent: "30", desc: "இதய ஆரோக்கியம்", color: "#111111" },
      { name: "தேங்காய் எண்ணெய்", percent: "15", desc: "சருமம் & முடி", color: "#fcd34d" },
      { name: "விளக்கெண்ணெய்", percent: "10", desc: "சிகிச்சை", color: "#78350f" }
    ]
  },
  spices: {
    title: "ஆர்கானிக் மசாலாக்கள்",
    desc: "தீவிர நறுமணம் மற்றும் மருத்துவ தூய்மைக்காக வெயிலில் உலர்த்தப்பட்டு கையால் இடிக்கப்பட்டது.",
    ingredients: [
      { name: "மஞ்சள்", percent: "40", desc: "குர்குமின்", color: "#f59e0b" },
      { name: "மிளகு", percent: "30", desc: "உயிர் மேம்படுத்தி", color: "#1e293b" },
      { name: "ஏலக்காய்", percent: "20", desc: "நறுமணம்", color: "#10b981" },
      { name: "கிராம்பு", percent: "10", desc: "ஆண்டிமைக்ரோபியல்", color: "#92400e" }
    ]
  },
  wellness: {
    title: "தினசரி ஆரோக்கியம்",
    desc: "இயற்கையான பாதுகாப்புகளை பலப்படுத்த மற்றும் ஆற்றலைத் தக்கவைக்க தாவரவியல் கலவைகள்.",
    ingredients: [
      { name: "அஸ்வகந்தா", percent: "40", desc: "அடாப்டோஜென்", color: "#b45309" },
      { name: "முருங்கை", percent: "30", desc: "சூப்பர்ஃபுட்", color: "#15803d" },
      { name: "நெல்லிக்காய்", percent: "20", desc: "வைட்டமின் சி", color: "#65a30d" },
      { name: "துளசி", percent: "10", desc: "மீளுருவாக்கம்", color: "#059669" }
    ]
  }
};

export default function CustomFormula() {
  const { language } = useLanguageStore();
  const [active, setActive] = useState<ConcernKey>("rice");
  const concerns = language === 'ta' ? CONCERNS_TA : CONCERNS_EN;
  const current = concerns[active];

  return (
    <section className="py-16 md:py-32 px-6 md:px-16 bg-white border-y border-stone-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-64 -top-64 w-[800px] h-[800px] bg-[#FAF9F5] rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          
          {/* Left Side: Navigation */}
          <div className="w-full lg:w-1/3 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-[1px] bg-[#D4AF37]"></div>
              <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase">{language === 'ta' ? 'எங்கள் சலுகைகள்' : 'Our Offerings'}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight mb-12">
              {language === 'ta' ? 'உங்களுக்காக தொகுக்கப்பட்டது.' : 'Curated for You.'}
            </h2>
            
            <div className="flex flex-col gap-2">
              {(Object.entries(concerns) as [ConcernKey, typeof current][]).map(([key, data]) => {
                const isActive = active === key;
                return (
                  <button 
                    key={key}
                    onClick={() => setActive(key as ConcernKey)}
                    className={`text-left px-6 py-5 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
                      isActive 
                        ? 'bg-[#111111] text-white shadow-xl shadow-black/5 scale-[1.02]' 
                        : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-[#111111]'
                    }`}
                  >
                    <span className="font-bold tracking-wide">{data.title}</span>
                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'translate-x-0 opacity-100 text-[#D4AF37]' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Visual Data Diagram & Legend */}
          <div className="w-full lg:w-2/3 bg-white rounded-[40px] p-8 md:p-12 border border-stone-200 shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
            <div className="h-full flex flex-col md:flex-row items-center gap-12">

                {/* Visual Diagram: Concentric Rings */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-xl">
                    {current.ingredients.map((ing, i) => {
                      const radius = 42 - (i * 9); // Rings get smaller towards center
                      const circumference = 2 * Math.PI * radius;
                      const percent = parseInt(ing.percent);
                      const dashLength = (percent / 100) * circumference;

                      return (
                        <g key={i}>
                          {/* Background Track */}
                          <circle 
                            cx="50" cy="50" r={radius} 
                            fill="none" 
                            stroke="#f5f5f4" 
                            strokeWidth="6" 
                          />
                          {/* Animated Foreground Ring */}
                          <motion.circle 
                            key={`${active}-${i}`}
                            cx="50" cy="50" r={radius} 
                            fill="none" 
                            stroke={ing.color} 
                            strokeWidth="6" 
                            strokeLinecap="round"
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: `${dashLength} ${circumference}` }}
                            transition={{ duration: 1.2, delay: i * 0.15, ease: "easeOut" }}
                          />
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.div 
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ duration: 1 }}
                      className="bg-[#111111] w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white"
                    >
                      <Sparkles className="w-4 h-4 text-[#D4AF37] mb-1" />
                      <span className="text-[8px] font-bold tracking-[0.2em] text-white">100%</span>
                      <span className="text-[7px] font-bold tracking-widest text-[#D4AF37] uppercase">{language === 'ta' ? 'சுத்தமானது' : 'Pure'}</span>
                    </motion.div>
                  </div>
                </div>

                {/* Legend / Breakdown */}
                <div className="flex-1 w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl font-bold text-[#111111] mb-2">{current.title}</h3>
                      <p className="text-sm text-stone-500 mb-8 border-b border-stone-100 pb-6 leading-relaxed">
                        {current.desc}
                      </p>
                      
                      <div className="space-y-4">
                        {current.ingredients.map((ing, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                            className="flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: ing.color }} />
                              <div>
                                <p className="text-sm font-bold text-[#111111] group-hover:text-[#D4AF37] transition-colors">{ing.name}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{ing.desc}</p>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-[#111111] bg-stone-50 px-3 py-1 rounded-lg">
                              {ing.percent}%
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
