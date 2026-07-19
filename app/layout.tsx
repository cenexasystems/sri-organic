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
  metadataBase: new URL("https://sriorganic.com"),
  title: {
    default: "Dasarathi Krubha Traders - Sri Organic",
    template: "%s | Sri Organic",
  },
  description: "Clinical Botanical Solutions. Buy authentic organic heirloom rice, wood-pressed oils, and traditional groceries in Tamil Nadu.",
  keywords: [
    "Organic heirloom rice Tamil Nadu",
    "Wood pressed oil Chennai",
    "Mapillai Samba rice online",
    "Organic rice shop Ponneri",
    "Buy organic spices online Tamil Nadu",
    "Black Kavuni rice benefits",
    "Thooyamalli rice online",
    "cold pressed groundnut oil Tamil Nadu",
    "wood pressed sesame oil online",
    "heirloom rice vs regular rice"
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sriorganic.com",
    siteName: "Dasarathi Krubha Traders - Sri Organic",
    title: "Dasarathi Krubha Traders - Sri Organic",
    description: "Clinical Botanical Solutions. Authentic organic heirloom rice, wood-pressed oils, and traditional groceries.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dasarathi Krubha Traders - Sri Organic",
    description: "Clinical Botanical Solutions. Authentic organic heirloom rice and wood-pressed oils.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sriorganic.com/#organization",
      "name": "Dasarathi Krubha Traders - Sri Organic",
      "url": "https://sriorganic.com",
      "logo": "https://sriorganic.com/logo.svg",
      "description": "Clinical Botanical Solutions and organic groceries provider in Tamil Nadu."
    },
    {
      "@type": "WebSite",
      "@id": "https://sriorganic.com/#website",
      "url": "https://sriorganic.com",
      "name": "Dasarathi Krubha Traders - Sri Organic",
      "publisher": {
        "@id": "https://sriorganic.com/#organization"
      }
    }
  ]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
