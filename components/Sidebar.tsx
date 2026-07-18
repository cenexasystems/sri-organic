"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Settings, 
  ChevronLeft, 
  X, 
  Lock, 
  MessageCircle, 
  ReceiptText, 
  BarChart2, 
  ShoppingCart, 
  Gift, 
  Package, 
  Tags, 
  Ticket, 
  Users 
} from "lucide-react";

const navItems = [
  { name: "Whatsapp", href: "/secure/admin/whatsapp", icon: MessageCircle, badge: "17" },
  { name: "POS BILLING", href: "/secure/admin/billing", icon: ReceiptText },
  { name: "POS ANALYTICS", href: "/secure/admin/analytics", icon: BarChart2 },
  { name: "ORDERS", href: "/secure/admin/orders", icon: ShoppingCart },
  { name: "GIFTS RECEIVED", href: "/secure/admin/gifts", icon: Gift },
  { name: "INVENTORY", href: "/secure/admin/inventory", icon: Package },
  { name: "CATEGORIES", href: "/secure/admin/categories", icon: Tags },
  { name: "COUPONS", href: "/secure/admin/coupons", icon: Ticket },
  { name: "USERS", href: "/secure/admin/users", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] h-screen bg-white border-r border-gray-100 flex flex-col shrink-0 sticky top-0 overflow-y-auto">
      {/* Logo & Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-700">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Business ERP</h1>
            <p className="text-[10px] text-gray-500 font-semibold tracking-wider">SRI ORGANIC</p>
          </div>
        </div>
        <button className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shadow-sm">
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Actions */}
      <div className="px-6 flex items-center gap-3 mb-8">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
          <X size={16} /> Exit
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-500 text-sm font-medium rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
          <Lock size={16} /> Logout
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href) || 
                           (pathname === "/secure/admin" && item.href === "/secure/admin/analytics");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? "bg-[#25392B] text-white shadow-md shadow-green-900/10" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon 
                  size={18} 
                  className={isActive ? "text-[#4ADE80]" : (item.name === "Whatsapp" ? "text-green-500" : "text-gray-400")} 
                />
                <span className={`text-sm font-semibold tracking-wide ${isActive ? "text-white" : ""}`}>
                  {item.name}
                </span>
              </div>
              {item.badge && (
                <span className="bg-[#25392B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#4ADE80]/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer Branding */}
      <div className="p-6 text-[10px] text-gray-400 font-medium text-center border-t border-gray-50">
        v1.0.0 &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
}
