import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Sri Organic",
  description: "Clinical Botanical Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#FAF9F5]">
        <SmoothScroll>
          <NavBar />
          <main className="flex-grow flex flex-col relative w-full h-full overflow-x-hidden">{children}</main>
          <Footer />
        </SmoothScroll>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
