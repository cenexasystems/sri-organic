"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowRight, Leaf, ShieldCheck, Sprout, Droplets, ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import CustomFormula from "@/components/ui/CustomFormula";
import { useProductStore, type Product, useLanguageStore } from "@/store/store";
import ProductDetailModal from "@/components/ui/ProductDetailModal";
import ProductCard from "@/components/ui/ProductCard";

const defaultReviews = [
  { name: "Priya S.", text: "The quality of the black rice is unparalleled. You can literally taste the authenticity and care in every grain.", stars: 5 },
  { name: "Karthik M.", text: "I've completely switched to their cold-pressed oils. The difference in my family's health and food taste is remarkable.", stars: 5 },
  { name: "Anita R.", text: "Finally, a brand that stays true to its roots. The organic spices are as pure as what my grandmother used.", stars: 5 },
  { name: "Rahul D.", text: "The custom wellness blends have transformed my morning routine. Pure botanical magic.", stars: 5 },
  { name: "Meera T.", text: "Regenerative farming makes such a huge difference. You can feel the vitality in their turmeric.", stars: 5 }
];

export default function Home() {
  const router = useRouter();
  const { products, fetchProducts, loading } = useProductStore();
  const { language } = useLanguageStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [localReviews, setLocalReviews] = useState(defaultReviews);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", text: "", stars: 5 });

  useEffect(() => {
    void fetchProducts();
    const savedReviews = localStorage.getItem("sri_organic_reviews");
    if (savedReviews) {
      try {
        setLocalReviews(JSON.parse(savedReviews));
      } catch (e) {}
    }
  }, [fetchProducts]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;
    const updatedReviews = [newReview, ...localReviews];
    setLocalReviews(updatedReviews);
    localStorage.setItem("sri_organic_reviews", JSON.stringify(updatedReviews));
    setIsReviewModalOpen(false);
    setNewReview({ name: "", text: "", stars: 5 });
  };

  const featuredProducts = products.filter(p => p.isActive).slice(0, 4);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityText = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 font-sans selection:bg-emerald-200">
      <main>
        {/* Full Screen Hero Section */}
        <section ref={heroRef} className="relative h-screen w-full flex items-end justify-center overflow-hidden pb-12 pt-32 bg-black">
          {/* Background Video with Parallax */}
          <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 h-[120%] -top-[10%]">
            <video 
              src="/bg2.webm" 
              autoPlay 
              muted 
              loop 
              playsInline
              className="object-cover w-full h-full opacity-80"
            />
            {/* Dark gradient overlay to ensure text is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </motion.div>

          {/* EST 1992 absolute right */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
            <span className="text-white/80 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              EST. 1992
            </span>
          </div>

          <motion.div 
            style={{ opacity: opacityText }}
            className="w-full max-w-7xl mx-auto px-8 md:px-16 relative z-20 flex flex-col xl:flex-row xl:items-end justify-between gap-12"
          >
            {/* Left side: Heading */}
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-[1px] bg-[#F3D78E]"></div>
                <span className="text-[#F3D78E] text-[10px] font-bold tracking-[0.2em] uppercase">{language === 'ta' ? 'நேர்மையை வளர்ப்பது' : 'Cultivating Integrity'}</span>
              </div>
              <h1 className="text-[12vw] sm:text-5xl md:text-8xl lg:text-[7rem] font-bold text-white leading-[1.05] tracking-tight">
                {language === 'ta' ? (
                  <>ஸ்ரீ ஆர்கானிக் <br />புதிய பரிணாமம்.</>
                ) : (
                  <>Sri Organic <br />Reimagined.</>
                )}
              </h1>
            </div>

            {/* Right side: Description and Button */}
            <div className="flex-1 max-w-md text-left xl:text-right flex flex-col items-start xl:items-end gap-8 pb-4">
              <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed">
                {language === 'ta' 
                  ? 'விவசாயத்தின் தூய்மையான வடிவத்தை கண்டறியுங்கள். நமது பாரம்பரிய தானியங்கள் சமரசம் இல்லாத தரத்துடன் வளர்க்கப்படுகின்றன, பழமையான சுவைகளையும் அத்தியாவசிய ஊட்டச்சத்துக்களையும் பாதுகாக்கிறது.'
                  : 'Discover the purest expression of agriculture. Our heirloom grains are grown with uncompromising standards, preserving ancient flavors and vital nutrients.'}
              </p>
              <Link 
                href="/products" 
                className="bg-white text-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#FAF9F5] transition-colors shadow-lg self-start xl:self-end"
              >
                {language === 'ta' ? 'அறுவடையை ஆராயுங்கள்' : 'Explore The Harvest'}
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Trust Banner Marquee */}
        <section className="w-full bg-[#111111] py-4 overflow-hidden border-t border-white/10 flex relative z-20">
          <motion.div 
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex shrink-0">
                {(language === 'ta' ? 
                  ["யு.எஸ்.டி.ஏ ஆர்கானிக்", "மரச் செக்கு", "இரசாயனம் இல்லாதவை", "கைகளால் அறுவடை", "மீளுருவாக்க விவசாயம்", "மருத்துவ மூலிகைகள்"] 
                  : ["USDA ORGANIC", "WOOD PRESSED", "ZERO CHEMICALS", "HAND HARVESTED", "REGENERATIVE FARMING", "CLINICAL BOTANICALS"]
                ).map((text, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] px-8">{text}</span>
                    <span className="text-white/20 text-xs">✦</span>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-32 px-6 md:px-16 bg-[#FAF9F5] relative rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24">
            {/* Left: Text Content */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-[1px] bg-[#D4AF37]"></div>
                <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase">{language === 'ta' ? 'எங்கள் பாரம்பரியம்' : 'Our Heritage'}</span>
              </div>
              <h2 className="text-3xl md:text-6xl font-bold text-[#111111] tracking-tight mb-8 break-words max-w-full">{language === 'ta' ? 'எங்களை பற்றி.' : 'About Us.'}</h2>
              <p className="text-stone-600 text-lg leading-relaxed mb-6">
                {language === 'ta' 
                  ? 'ஸ்ரீ ஆர்கானிக் பாரம்பரிய விவசாய நடைமுறைகள் மீதான ஆழ்ந்த மரியாதையிலிருந்து பிறந்தது. மூன்று தசாப்தங்களுக்கும் மேலாக, பாரம்பரிய அரிசி, மரச்செக்கு எண்ணெய்கள் மற்றும் மசாலாப் பொருட்களை பயிரிட உள்ளூர் விவசாயிகளுடன் நாங்கள் கூட்டு சேர்ந்துள்ளோம்.'
                  : 'Sri Organic was born from a deep respect for traditional agricultural practices. For over three decades, we have partnered with local farmers to cultivate heirloom varieties of rice, cold-pressed oils, and spices.'}
              </p>
              <p className="text-stone-600 text-lg leading-relaxed mb-12">
                {language === 'ta'
                  ? 'மண்ணை சிதைப்பதை விட, அதை வளர்ப்பதே மீளுருவாக்க விவசாயத்திற்கான எங்கள் அர்ப்பணிப்பு. ஒவ்வொரு தயாரிப்பும் தூய்மைக்கான சான்றாகும், செயற்கை இரசாயனங்கள் அல்லது நவீன குறுக்குவழிகள் இல்லாமல் வடிவமைக்கப்பட்டுள்ளது.'
                  : 'Our commitment is to regenerative farming—nourishing the soil rather than depleting it. Every product is a testament to purity, crafted without synthetic chemicals or modern shortcuts.'}
              </p>
              <div className="flex gap-12 border-t border-stone-200 pt-10">
                <div>
                  <h4 className="text-4xl font-bold text-[#111111] mb-2">30+</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{language === 'ta' ? 'வருட பாரம்பரியம்' : 'Years of Legacy'}</p>
                </div>
                <div>
                  <h4 className="text-4xl font-bold text-[#111111] mb-2">100%</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{language === 'ta' ? 'ஆர்கானிக் சான்றிதழ்' : 'Organic Certified'}</p>
                </div>
              </div>
            </div>

            {/* Right: Animated Image */}
            <div className="w-full md:w-1/2 relative flex justify-center items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, type: "spring", stiffness: 50 }}
                className="w-full aspect-[4/5] relative rounded-[40px] overflow-hidden shadow-2xl"
              >
                <Image 
                  src="/organic_groceries_1783344052624.png" 
                  alt="Sri Organic Heritage" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-[2000ms] ease-out"
                />
                <div className="absolute inset-0 bg-black/10" />
                
                {/* Floating Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl max-w-[200px]"
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#D4AF37] mb-1">Authentic</p>
                  <p className="text-sm font-bold text-[#111111]">100% Organic certified harvesting</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive Formula Builder */}
        <CustomFormula />

        {/* New Product Showcase */}
        <section id="products" className="py-16 md:py-32 px-6 md:px-16 bg-white relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-[1px] bg-[#D4AF37]"></div>
                  <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase">{language === 'ta' ? 'தொகுப்பு' : 'The Collection'}</span>
                </div>
                <h2 className="text-3xl md:text-6xl font-bold text-[#111111] tracking-tight break-words max-w-full">{language === 'ta' ? 'தயாரிப்புகள்.' : 'Products.'}</h2>
              </div>
              <Link href="/products" className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#111111] hover:text-[#D4AF37] transition-colors pb-2 border-b border-[#111111] hover:border-[#D4AF37]">
                {language === 'ta' ? 'முழு அறுவடையைக் காண்க' : 'View Full Harvest'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent animate-spin rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {featuredProducts.map((p, idx) => (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex flex-col h-full"
                  >
                     <ProductCard 
                       product={p} 
                       onClick={(p) => {
                         setSelectedProduct(p);
                         setIsModalOpen(true);
                       }} 
                     />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-16 md:py-32 px-6 md:px-16 bg-[#FAF9F5] relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16 md:mb-24">
              <div className="w-8 h-[1px] bg-[#D4AF37] mb-6"></div>
              <h2 className="text-3xl md:text-5xl font-bold text-[#111111] tracking-tight mb-4">{language === 'ta' ? 'புகைப்படத்தொகுப்பு.' : 'Gallery.'}</h2>
              <p className="text-stone-500 max-w-lg text-sm">{language === 'ta' ? 'எங்கள் பாரம்பரியம், பண்ணைகள் மற்றும் உண்மையான செயல்முறைகளின் பார்வைகள்.' : 'Glimpses of our heritage, farms, and authentic processes.'}</p>
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {[
                "WhatsApp Image 2026-07-14 13.40.35.jpeg",
                "WhatsAp2026-07-14 at 13.40.36.jpeg",
                "WhatsApp Image 2026-07-14 at 13.40.34.jpeg",
                "WhatsApp Image 2026-13.40.38.jpeg",
                "Image 2026-07-14 at 13.40.36.jpeg",
                "WhatsApp 2026-07-14 at 13.40.34.jpeg",
                "WhatsApp Image 202607-14 at 13.40.35.jpeg",
                "WhatsApp Image-07-14 at 13.40.36.jpeg",
                "age 2026-07-14 at 13.40.35.jpeg"
              ].map((imgSrc, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (idx % 3) * 0.15 }}
                  className="break-inside-avoid rounded-3xl overflow-hidden shadow-sm hover:shadow-xl group relative cursor-pointer"
                  onClick={() => setFullscreenImage(imgSrc)}
                >
                  <img 
                    src={`/gallery/${imgSrc}`} 
                    alt={`Gallery image ${idx + 1}`} 
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white font-bold tracking-widest uppercase text-xs transition-opacity duration-500">View</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Process Section */}
        <section id="process" className="py-16 md:py-32 px-6 md:px-16 bg-[#111111] text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16 md:mb-24">
              <div className="w-8 h-[1px] bg-[#D4AF37] mb-6"></div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{language === 'ta' ? 'மண்ணிலிருந்து ஆத்மாவுக்கு.' : 'From Soil to Soul.'}</h2>
              <p className="text-white/60 max-w-lg text-sm">{language === 'ta' ? 'எங்கள் தாவரவியல்களின் பயணம், அதிகபட்ச மருத்துவ செயல்திறன் மற்றும் தூய்மையை உறுதி செய்ய ஒவ்வொரு படியிலும் பாதுகாக்கப்படுகிறது.' : 'The journey of our botanicals, preserved at every step to ensure maximum clinical efficacy and purity.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-white/10 z-0"></div>

              {(language === 'ta' ? [
                { step: "01", title: "மீளுருவாக்க அறுவடை", desc: "தாவரவியல் வீரியத்தின் உச்சத்தில் உள்ளூர் விவசாயிகளால் கைப்படத் தேர்ந்தெடுக்கப்பட்டது." },
                { step: "02", title: "சூரிய உலர்த்துதல்", desc: "அத்தியாவசிய எண்ணெய்களைப் பாதுகாக்க இயற்கையாக வெயிலில் உலர்த்தப்படுகிறது." },
                { step: "03", title: "குளிர் பிரித்தெடுத்தல்", desc: "வெப்பப் பயன்பாடு இல்லாத பாரம்பரிய மரச்செக்கு முறைகள்." },
                { step: "04", title: "மருத்துவ பாட்டிலில் அடைத்தல்", desc: "முழுமையான புத்துணர்ச்சியைப் பராமரிக்க புற ஊதா பாதுகாக்கப்பட்ட கண்ணாடியில் சீல் வைக்கப்பட்டுள்ளது." }
              ] : [
                { step: "01", title: "Regenerative Harvest", desc: "Hand-picked by local farmers at the peak of botanical potency." },
                { step: "02", title: "Sun Curing", desc: "Naturally dried under the sun to preserve vital essential oils." },
                { step: "03", title: "Cold Extraction", desc: "Traditional wood-pressing methods with zero heat application." },
                { step: "04", title: "Clinical Bottling", desc: "Sealed in UV-protected glass to maintain absolute freshness." }
              ]).map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className="w-24 h-24 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center mb-8 shadow-2xl group-hover:border-[#D4AF37] transition-colors duration-500">
                    <span className="text-2xl font-bold text-[#D4AF37]">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed px-4">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications / Stats Banner */}
        <section className="py-12 md:py-20 px-6 md:px-16 bg-[#111111] border-y border-white/10 text-white relative z-20">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-12 md:gap-y-0 gap-x-4 md:gap-x-12 text-center md:divide-x divide-white/10">
            <div className="flex flex-col items-center justify-center space-y-4 px-4">
              <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
              <h4 className="text-3xl font-black">100%</h4>
              <p className="text-xs tracking-widest text-white/50 uppercase font-bold">{language === 'ta' ? 'ஆர்கானிக் சான்றிதழ்' : 'Organic Certified'}</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 px-4">
              <Leaf className="w-8 h-8 text-[#D4AF37]" />
              <h4 className="text-3xl font-black">Zero</h4>
              <p className="text-xs tracking-widest text-white/50 uppercase font-bold">{language === 'ta' ? 'இரசாயன சேர்க்கைகள்' : 'Chemical Additives'}</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 px-4">
              <Sprout className="w-8 h-8 text-[#D4AF37]" />
              <h4 className="text-3xl font-black">50+</h4>
              <p className="text-xs tracking-widest text-white/50 uppercase font-bold">{language === 'ta' ? 'கூட்டாளர் பண்ணைகள்' : 'Partner Farms'}</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 px-4">
              <Droplets className="w-8 h-8 text-[#D4AF37]" />
              <h4 className="text-3xl font-black">Pure</h4>
              <p className="text-xs tracking-widest text-white/50 uppercase font-bold">{language === 'ta' ? 'மரச்செக்கு பிரித்தெடுத்தல்' : 'Wood Extraction'}</p>
            </div>
          </div>
        </section>

        {/* Reviews Section - Moving Marquee */}
        <section id="reviews" className="py-16 md:py-32 bg-white text-[#111111] overflow-hidden relative border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-16 md:mb-24 gap-6">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-8 h-[1px] bg-[#D4AF37] mb-6"></div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{language === 'ta' ? 'விமர்சனங்கள்.' : 'Reviews.'}</h2>
                <p className="text-stone-500 mt-4 max-w-lg text-sm">{language === 'ta' ? 'தங்கள் உண்மையான ஆர்கானிக் அனுபவத்தைப் பற்றி எங்கள் சமூகம் என்ன சொல்கிறது என்பதைக் கேளுங்கள்.' : 'Hear what our community says about their authentic organic experience.'}</p>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-[#111111] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors shadow-lg"
              >
                {language === 'ta' ? 'விமர்சனம் சேர்' : 'Add Review'}
              </button>
            </div>
          </div>
            
          <div className="w-full flex relative pb-8">
            {/* Left and right gradient masks for smooth fade */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            <motion.div 
              className="flex gap-8 whitespace-nowrap pl-8"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 30, repeat: Infinity }}
            >
              {/* Duplicate the array to create a seamless infinite loop */}
              {[...Array(2)].map((_, groupIndex) => (
                <div key={groupIndex} className="flex gap-8 shrink-0">
                  {localReviews.map((review, i) => (
                    <div 
                      key={i}
                      className="w-[280px] md:w-[350px] p-8 md:p-10 border border-stone-200 hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 bg-white whitespace-normal rounded-2xl"
                    >
                      <div className="flex gap-1 text-[#D4AF37] mb-8">
                        {[...Array(review.stars || 5)].map((_, star) => <span key={star}>★</span>)}
                      </div>
                      <p className="text-base leading-relaxed text-stone-600 mb-8 font-light italic">
                        "{review.text}"
                      </p>
                      <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37]">- {review.name}</p>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Map / Location Section */}
        <section className="py-16 md:py-32 px-6 md:px-16 bg-[#FAF9F5]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/3">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-[1px] bg-[#D4AF37]"></div>
                <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase">{language === 'ta' ? 'எங்களை அணுகவும்' : 'Visit Us'}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight mb-8">{language === 'ta' ? 'வரைபடம்.' : 'Map.'}</h2>
              <p className="text-stone-500 text-lg leading-relaxed mb-10">
                {language === 'ta' ? 'எங்கள் முதன்மை கடை மற்றும் முக்கிய அறுவடை விநியோக மையம் தமிழ்நாட்டின் மையப்பகுதியில் அமைந்துள்ளது. தூய்மையை நேரில் அனுபவிக்க எங்களை சந்திக்கவும்.' : 'Our flagship store and main harvesting distribution center is located in the heart of Tamil Nadu. Come visit us to experience the purity firsthand.'}
              </p>
              <div className="space-y-4 text-sm font-bold text-[#111111] leading-relaxed">
                <p className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-1"/> 
                  <span>47, Ambal Nagar, Andarkuppam, Nedumbarappakkam Road,<br/> Velammal School 9th gate opposite,<br/> Ponneri - 601 204.</span>
                </p>
                <p className="flex items-start gap-3"><span className="w-4 text-center text-[#D4AF37] mt-0.5">📞</span> <span>9894609057<br/>7094501036</span></p>
                <p className="text-[#D4AF37] pt-4 border-t border-stone-200 mt-4 block">{language === 'ta' ? 'திறந்திருக்கும் நேரம் திங்கள்-சனி: காலை 9 - இரவு 7' : 'Open Mon-Sat: 9am - 7pm'}</p>
              </div>
            </div>
            
            <div className="w-full md:w-2/3 aspect-square md:aspect-[21/9] bg-white relative overflow-hidden rounded-[40px] shadow-xl border border-stone-200 group">
               <iframe 
                 src="https://maps.google.com/maps?q=Andarkuppam,Ponneri,Tamil+Nadu,601204&t=m&z=16&ie=UTF8&iwloc=&output=embed" 
                 className="absolute inset-0 w-full h-full border-0"
                 allowFullScreen
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               ></iframe>
               
               {/* Center Marker / Button */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <a 
                   href="https://www.google.com/maps/search/?api=1&query=Andarkuppam+Ponneri+Tamil+Nadu+601204" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="pointer-events-auto bg-white px-6 py-3.5 rounded-full text-[#111111] font-bold text-[15px] tracking-wide flex items-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all hover:scale-105 active:scale-95 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-stone-100"
                 >
                   <MapPin className="w-5 h-5 text-red-500" />
                   {language === 'ta' ? 'வரைபடத்தில் திற' : 'Open in Map'}
                 </a>
               </div>
            </div>
          </div>
        </section>

        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Add Review Modal */}
        <AnimatePresence>
          {isReviewModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setIsReviewModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-lg shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  type="button"
                  className="absolute top-6 right-6 text-stone-400 hover:text-black transition-colors"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <h3 className="text-3xl font-bold text-[#111111] mb-2 tracking-tight">{language === 'ta' ? 'விமர்சனம் சேர்.' : 'Add a Review.'}</h3>
                <p className="text-stone-500 mb-8 text-sm">{language === 'ta' ? 'எங்கள் உண்மையான ஆர்கானிக் தயாரிப்புகளுடன் உங்கள் அனுபவத்தைப் பகிர்ந்து கொள்ளுங்கள்.' : 'Share your experience with our authentic organic products.'}</p>

                <form onSubmit={handleAddReview} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">{language === 'ta' ? 'உங்கள் பெயர்' : 'Your Name'}</label>
                    <input 
                      type="text"
                      required
                      value={newReview.name}
                      onChange={e => setNewReview({...newReview, name: e.target.value})}
                      className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      placeholder={language === 'ta' ? "உ.ம். ஜான் டி." : "e.g. John D."}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">{language === 'ta' ? 'மதிப்பீடு' : 'Rating'}</label>
                    <div className="flex gap-2 text-2xl text-stone-300">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button"
                          onClick={() => setNewReview({...newReview, stars: star})}
                          className={`hover:text-[#D4AF37] transition-colors focus:outline-none ${newReview.stars >= star ? 'text-[#D4AF37]' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">{language === 'ta' ? 'உங்கள் அனுபவம்' : 'Your Experience'}</label>
                    <textarea 
                      required
                      value={newReview.text}
                      onChange={e => setNewReview({...newReview, text: e.target.value})}
                      rows={4}
                      className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
                      placeholder={language === 'ta' ? "நீங்கள் என்ன நினைக்கிறீர்கள் என்று சொல்லுங்கள்..." : "Tell us what you think..."}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#111111] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] transition-colors shadow-lg mt-4"
                  >
                    {language === 'ta' ? 'விமர்சனத்தை சமர்ப்பிக்கவும்' : 'Submit Review'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {fullscreenImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
              onClick={() => setFullscreenImage(null)}
            >
              <button 
                className="absolute top-6 right-6 text-white bg-black/50 hover:bg-white/20 p-2 rounded-full transition-colors z-10"
                onClick={() => setFullscreenImage(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={`/gallery/${fullscreenImage}`}
                alt="Fullscreen gallery"
                className="max-w-full max-h-full object-contain rounded-xl relative z-0 shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
