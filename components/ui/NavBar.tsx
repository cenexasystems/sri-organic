"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from '@/lib/useAuth';
import { useCartStore, useLanguageStore } from '@/store/store';

export default function NavBar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.length;
  const { language, toggleLanguage } = useLanguageStore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { user } = useAuth();
  const isLoggedIn = !!user;

  if (pathname.startsWith('/admin') || pathname.startsWith('/invoice') || pathname.startsWith('/login')) {
    return null;
  }

  const navLinksEn = [
    { name: "ABOUT US", href: "/#about" },
    { name: "THE HARVEST", href: "/#products" },
    { name: "OUR PROCESS", href: "/#process" },
  ];

  const navLinksTa = [
    { name: "எங்களை பற்றி", href: "/#about" },
    { name: "அறுவடை", href: "/#products" },
    { name: "நமது செயல்முறை", href: "/#process" },
  ];

  const navLinks = language === 'ta' ? navLinksTa : navLinksEn;

  const isHome = pathname === "/";
  const navClasses = 
    isHome && !isScrolled 
      ? "bg-transparent py-4 md:py-6 border-b border-transparent text-white"
      : "bg-white/95 backdrop-blur-xl border-b border-[#111111]/5 py-2 md:py-3 shadow-sm text-[#111111]";

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${navClasses}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex justify-between items-center min-h-[60px] md:min-h-[80px] relative w-full">
        
        {/* Left Links */}
        <div className="hidden lg:flex items-center space-x-10 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname === '/' && link.name === 'SHOP ALL'); 
            return (
              <Link
                key={link.name}
                href={link.href}
                className="group relative text-[10px] whitespace-nowrap font-bold tracking-[0.15em] transition-opacity hover:opacity-100"
                style={{ opacity: isActive ? 1 : 0.8 }}
              >
                {link.name}
                {isActive && (
                  <span className={`absolute -bottom-2 left-0 right-0 h-[2px] rounded-full shadow-sm ${isHome && !isScrolled ? 'bg-white' : 'bg-[#111111]'}`}></span>
                )}
                <span className={`absolute -bottom-2 left-0 right-0 h-[2px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ${isHome && !isScrolled ? 'bg-white' : 'bg-[#111111]'} ${isActive ? 'hidden' : ''}`}></span>
              </Link>
            );
          })}
        </div>

        {/* Center Logo */}
        <div className="absolute left-6 lg:left-1/2 lg:-translate-x-1/2 py-1 z-10">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Sri Dasarathi" className="h-12 md:h-14 w-auto object-contain mix-blend-multiply drop-shadow-sm" />
          </Link>
        </div>

        {/* Right Icons */}
        <div className="hidden lg:flex items-center justify-end space-x-10 flex-1">
          <Link href="/products" className="hover:opacity-70 transition-opacity flex items-center">
            <span className="text-[10px] font-bold tracking-[0.15em] whitespace-nowrap">{language === 'ta' ? 'தயாரிப்புகள்' : 'PRODUCTS'}</span>
          </Link>
          <Link href="/cart" className="relative hover:opacity-70 transition-opacity flex items-center gap-2">
            <div className="relative">
              <ShoppingCart size={18} strokeWidth={2} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#D4AF37] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-widest hidden lg:block">{language === 'ta' ? 'கார்ட்' : 'CART'}</span>
          </Link>
          <Link href={isLoggedIn ? "/profile" : "/login"} className="hover:opacity-70 transition-opacity flex items-center gap-2">
            <User size={18} strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-widest hidden lg:block">{isLoggedIn ? (language === 'ta' ? 'சுயவிவரம்' : 'PROFILE') : (language === 'ta' ? 'உள்நுழை' : 'LOGIN')}</span>
          </Link>
          <button onClick={toggleLanguage} className="hover:opacity-70 transition-opacity flex items-center font-bold text-[10px] tracking-widest border border-current px-2 py-1 rounded ml-2">
            {language === 'en' ? 'தமிழ்' : 'EN'}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex flex-1 justify-end relative z-50">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="hover:opacity-70 transition-opacity p-2 -mr-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#111111]/95 backdrop-blur-xl absolute top-full left-0 right-0 border-t border-white/10 overflow-hidden shadow-2xl origin-top z-50"
          >
            <div className="px-8 py-8 flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white text-xs font-bold tracking-[0.2em] uppercase"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px w-full bg-white/10 my-2"></div>
              
              <Link href={isLoggedIn ? "/profile" : "/login"} className="text-white text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <User size={16} /> {isLoggedIn ? (language === 'ta' ? 'சுயவிவரம்' : 'PROFILE') : (language === 'ta' ? 'உள்நுழை' : 'MEMBER LOGIN')}
              </Link>
              <Link href="/cart" className="text-white text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <ShoppingCart size={16} /> {language === 'ta' ? 'கார்ட்' : 'CART'} {mounted ? `(${cartCount})` : '(0)'}
              </Link>
              <button onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }} className="text-white text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-3 w-max px-3 py-1.5 border border-white/20 rounded mt-2">
                {language === 'en' ? 'SWITCH TO தமிழ்' : 'SWITCH TO ENGLISH'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
