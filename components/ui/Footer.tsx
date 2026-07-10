"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const isCart = pathname === "/cart";

  if (pathname.startsWith("/admin") || pathname.startsWith("/invoice") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <footer className="bg-[#111111] text-white pt-16 md:pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {!isCart && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5 pr-0 lg:pr-12">
            <Link href="/" className="mb-6 inline-block bg-white p-3 rounded-2xl">
              <img src="/logo.svg" alt="Sri Dasarathi" className="h-20 w-auto object-contain" />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              Cultivating integrity through uncompromising standards. We bring you the purest expression of ancient agriculture, preserving flavors and vital nutrients.
            </p>
            <div className="flex gap-4 text-white/70">
              {/* Social icons placeholders */}
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer">In</div>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer">Fb</div>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer">Tw</div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <h4 className="font-bold tracking-[0.2em] text-[11px] uppercase mb-6 text-[#F3D78E]">Explore</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/#products" className="hover:text-white transition-colors">The Harvest</Link></li>
              <li><Link href="/#process" className="hover:text-white transition-colors">Our Process</Link></li>
              <li><Link href="/#reviews" className="hover:text-white transition-colors">Reviews</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-bold tracking-[0.2em] text-[11px] uppercase mb-6 text-[#F3D78E]">Contact</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#F3D78E]" />
                <span>47, Ambal Nagar, Andarkuppam,<br/>Nedumbarappakkam Road,<br/>Velammal School 9th gate opposite,<br/>Ponneri - 601 204.</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0 text-[#F3D78E]" />
                <span>9894609057, 7094501036</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 text-[#F3D78E]" />
                <span>hello@sriorganic.com</span>
              </li>
            </ul>
          </div>
          </div>
        )}

        <div className={`border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/50 tracking-widest uppercase text-center md:text-left ${!isCart ? 'border-t' : ''}`}>
          <p className="flex-1">&copy; {new Date().getFullYear()} Sri Organic. All rights reserved.</p>
          <p className="flex-1 md:text-center">
            Powered by{" "}
            <a href="https://www.cenexasystems.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-white">
              Cenexa System
            </a> &copy; {new Date().getFullYear()} 
          </p>
          <p className="flex-1 md:text-right">Organic &bull; Pure &bull; Natural</p>
        </div>
      </div>
    </footer>
  );
}
