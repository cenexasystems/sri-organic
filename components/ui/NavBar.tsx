"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function NavBar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "OUR STORY", href: "/story" },
    { name: "THE HARVEST", href: "/harvest" },
    { name: "SHOP ALL", href: "/products" },
    { name: "JOURNAL", href: "/journal" },
  ];

  const isHome = pathname === "/";
  const navClasses = 
    isHome && !isScrolled 
      ? "bg-transparent py-4 md:py-6 border-b border-transparent text-white"
      : "bg-white/95 backdrop-blur-xl border-b border-[#111111]/5 py-2 md:py-3 shadow-sm text-[#111111]";

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${navClasses}`}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 flex justify-between items-center">
        
        {/* Left Links */}
        <div className="hidden md:flex items-center space-x-10 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname === '/' && link.name === 'SHOP ALL'); 
            return (
              <Link
                key={link.name}
                href={link.href}
                className="group relative text-[10px] font-bold tracking-[0.15em] transition-opacity hover:opacity-100"
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
        <div className="flex-1 flex justify-center py-1">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Sri Dasarathi" className="h-12 md:h-14 w-auto object-contain mix-blend-multiply drop-shadow-sm" />
          </Link>
        </div>

        {/* Right Icons */}
        <div className="hidden md:flex items-center justify-end space-x-8 flex-1">
          <button className="hover:opacity-70 transition-opacity">
            <Search size={18} strokeWidth={2} />
          </button>
          <Link href="/login" className="hover:opacity-70 transition-opacity">
            <User size={18} strokeWidth={2} />
          </Link>
          <Link href="/cart" className="relative hover:opacity-70 transition-opacity flex items-center">
            <ShoppingBag size={18} strokeWidth={2} />
            <span className="absolute -top-1 -right-2 bg-[#D4AF37] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex flex-1 justify-end">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="hover:opacity-70 transition-opacity">
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
            className="md:hidden bg-[#111111]/95 backdrop-blur-xl absolute top-full left-0 right-0 border-t border-white/10 overflow-hidden"
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
              
              <Link href="/login" className="text-white text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <User size={16} /> MEMBER LOGIN
              </Link>
              <Link href="/cart" className="text-white text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <ShoppingBag size={16} /> CART (0)
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
