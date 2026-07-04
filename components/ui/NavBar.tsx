"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, LogIn, LogOut, LayoutDashboard, Menu, X, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function NavBar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation links
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
  ];

  return (
    <nav className="sticky top-0 z-[100] w-full bg-[#FAF9F5]/90 backdrop-blur-md border-b border-outline-variant/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#1B3022] flex items-center justify-center group-hover:bg-[#0C1510] transition-colors">
              <Leaf className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <span className="font-display font-bold text-xl text-[#1B3022] tracking-tight">
              Sri Organic
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-body text-sm font-semibold transition-colors ${
                  pathname === link.href
                    ? "text-[#1B3022]"
                    : "text-gray-500 hover:text-[#1B3022]"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-4 w-px bg-gray-300"></div>

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className={`font-body text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    pathname === "/admin" ? "text-[#D4AF37]" : "text-[#1B3022] hover:text-[#D4AF37]"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="font-body text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="font-body text-sm font-bold bg-[#1B3022] text-[#FAF9F5] px-4 py-2 rounded-full hover:bg-[#0C1510] transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Member Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#1B3022] hover:text-[#0C1510] focus:outline-none p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-outline-variant/20 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md font-body text-base font-medium ${
                    pathname === link.href
                      ? "bg-[#1B3022]/5 text-[#1B3022]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#1B3022]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="my-2 border-t border-gray-200"></div>

              {user ? (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md font-body text-base font-medium text-[#1B3022] hover:bg-gray-50"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md font-body text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md font-body text-base font-medium text-[#1B3022] hover:bg-gray-50"
                >
                  <LogIn className="w-4 h-4" />
                  Member Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
