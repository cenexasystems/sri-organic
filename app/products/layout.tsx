import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Products',
  description: 'Explore our authentic organic heirloom rice, wood-pressed oils, and traditional groceries. Hand-picked, naturally sun-cured, and clinical grade.',
  alternates: {
    canonical: 'https://sriorganic.com/products',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
