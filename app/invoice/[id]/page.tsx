"use client";

import { useEffect, useState } from "react";
import { fetchOrderById, Order } from "@/lib/db";
import { Printer, ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setOrderId(p.id);
      fetchOrderById(p.id)
        .then((res) => {
          if (!res) {
            setError("Invoice not found");
          } else {
            setOrder(res);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load invoice");
          setLoading(false);
        });
    });
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F5] text-primary">
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <button onClick={() => router.back()} className="text-sm underline">
          Go Back
        </button>
      </div>
    );
  }

  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-body print:bg-white print:py-0 print:px-0">
      
      {/* Non-printable Action Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Store
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-outline-variant/50 hover:bg-gray-50 text-primary px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            title="Use 'Save as PDF' destination in the print dialog"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Invoice Paper */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl sm:shadow-xl border border-outline-variant/20 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 print:w-full print:max-w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-outline-variant/30 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <Image 
                src="/logo.png" 
                alt="Sri Organic" 
                fill 
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary font-poppins uppercase">Sri Organic</h1>
              <p className="text-xs text-on-surface-variant tracking-wider font-semibold">Clinical Botanical Solutions</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-extrabold text-primary font-poppins tracking-tighter mb-2">INVOICE</h2>
            <p className="text-xs font-bold text-on-surface-variant">#{order.id}</p>
            <p className="text-xs font-medium text-on-surface-variant mt-1">{invoiceDate}</p>
          </div>
        </div>

        {/* Customer & Store Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Billed To</h3>
            <p className="text-sm font-bold text-primary mb-1">{order.customerName}</p>
            {order.customerPhone && <p className="text-xs text-on-surface-variant mb-1">{order.customerPhone}</p>}
            {order.customerEmail && <p className="text-xs text-on-surface-variant mb-1">{order.customerEmail}</p>}
            {order.customerAddress && <p className="text-xs text-on-surface-variant mt-2 whitespace-pre-wrap">{order.customerAddress}</p>}
          </div>
          <div className="sm:text-right">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Issued By</h3>
            <p className="text-sm font-bold text-primary mb-1">Sri Organic</p>
            <p className="text-xs text-on-surface-variant mb-1">Coimbatore, Tamil Nadu</p>
            <p className="text-xs text-on-surface-variant mb-1">sriorganic@example.com</p>
            <p className="text-xs text-on-surface-variant">+91 79041 99050</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-hidden border border-outline-variant/20 rounded-2xl mb-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF9F5] text-primary font-bold border-b border-outline-variant/20">
                <th className="px-5 py-3">Item Description</th>
                <th className="px-5 py-3 text-center">Size</th>
                <th className="px-5 py-3 text-center">Qty</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {order.items.map((item, i) => (
                <tr key={i} className="text-on-surface-variant">
                  <td className="px-5 py-4 font-bold text-primary">{item.name}</td>
                  <td className="px-5 py-4 text-center">{item.size || '-'}</td>
                  <td className="px-5 py-4 text-center">{item.quantity}</td>
                  <td className="px-5 py-4 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="px-5 py-4 text-right font-bold text-primary">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation */}
        <div className="flex justify-end border-b border-outline-variant/30 pb-8 mb-8">
          <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3 text-xs">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span className="font-semibold">₹{order.subtotal.toFixed(2)}</span>
            </div>
            {order.couponDiscount && order.couponDiscount > 0 ? (
              <div className="flex justify-between text-[#16A34A]">
                <span>Discount ({order.couponCode || 'Promo'})</span>
                <span className="font-semibold">-₹{order.couponDiscount.toFixed(2)}</span>
              </div>
            ) : null}
            {order.manualDiscount && order.manualDiscount > 0 ? (
              <div className="flex justify-between text-[#16A34A]">
                <span>Manual Discount</span>
                <span className="font-semibold">-₹{order.manualDiscount.toFixed(2)}</span>
              </div>
            ) : null}
            {order.deliveryCharge && order.deliveryCharge > 0 ? (
              <div className="flex justify-between text-on-surface-variant">
                <span>Delivery Charge</span>
                <span className="font-semibold">₹{order.deliveryCharge.toFixed(2)}</span>
              </div>
            ) : null}
            
            <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
              <span className="text-sm font-bold text-primary uppercase tracking-widest">Total</span>
              <span className="text-xl font-extrabold text-primary font-poppins">₹{order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="text-center text-xs text-on-surface-variant/70 font-medium">
          <p className="mb-1 font-bold text-primary">Thank you for your business!</p>
          <p>For questions concerning this invoice, please contact our support team.</p>
        </div>

      </div>

      {/* Actual Web Page Footer (Non-Printable) */}
      <footer className="mt-20 -mx-4 sm:-mx-6 lg:-mx-8 -mb-8 sm:-mb-12 bg-[#111111] text-white py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-white/70 tracking-widest uppercase font-bold text-center md:text-left">
          <p className="flex-1">&copy; {new Date().getFullYear()} Sri Organic. All Rights Reserved.</p>
          <p className="flex-1 md:text-center">
            POWERED BY {""}
            <a href="https://www.cenexasystems.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-white">
              Cenexa System
            </a> &copy; {new Date().getFullYear()} 
          </p>
          <p className="flex-1 md:text-right text-[#F3D78E]">PURE &bull; ORGANIC &bull; PROVEN</p>
        </div>
      </footer>
    </div>
  );
}
