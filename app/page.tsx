import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f6f0] text-gray-800 font-sans selection:bg-green-200">
      {/* Navigation */}
      <header className="sticky top-0 z-10 bg-[#f9f6f0]/90 backdrop-blur-md border-b border-green-900/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
              <span className="text-[#f9f6f0] font-bold text-xl leading-none">S</span>
            </div>
            <span className="text-2xl font-bold text-green-900 tracking-tight">Sri Organic</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#" className="text-green-900 hover:text-green-700 font-medium transition-colors">Home</a>
            <a href="#products" className="text-green-900 hover:text-green-700 font-medium transition-colors">Products</a>
            <a href="#about" className="text-green-900 hover:text-green-700 font-medium transition-colors">About Us</a>
            <a href="#contact" className="text-green-900 hover:text-green-700 font-medium transition-colors">Contact</a>
          </nav>
          <button className="md:hidden text-green-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-green-900 mb-6 tracking-tight">
              Pure Nature, <br />
              <span className="text-green-700">Delivered to You.</span>
            </h1>
            <p className="text-lg md:text-xl text-green-800/80 max-w-2xl mx-auto mb-10">
              Welcome to Sri Organic. We bring you the freshest, 100% certified organic products directly from sustainable farms to your table.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="#products" className="px-8 py-4 bg-green-700 text-[#f9f6f0] rounded-full font-bold text-lg hover:bg-green-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Shop Now
              </a>
              <a href="#about" className="px-8 py-4 bg-transparent border-2 border-green-700 text-green-800 rounded-full font-bold text-lg hover:bg-green-700/10 transition-all">
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section id="products" className="py-24 bg-white/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-green-900 mb-4">Our Fresh Picks</h2>
              <p className="text-green-800/70 max-w-xl mx-auto">Discover our most popular organic produce, carefully selected for quality and taste.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product 1 */}
              <div className="bg-[#f9f6f0] rounded-2xl p-6 shadow-sm border border-green-900/5 hover:shadow-md transition-shadow group">
                <div className="aspect-square bg-green-100 rounded-xl mb-6 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                  🍅
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Organic Tomatoes</h3>
                <p className="text-green-800/70 mb-4 text-sm">Farm-fresh, pesticide-free tomatoes bursting with flavor.</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-800">$4.99 / lb</span>
                  <button className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center hover:bg-green-800 transition-colors">
                    +
                  </button>
                </div>
              </div>

              {/* Product 2 */}
              <div className="bg-[#f9f6f0] rounded-2xl p-6 shadow-sm border border-green-900/5 hover:shadow-md transition-shadow group">
                <div className="aspect-square bg-green-100 rounded-xl mb-6 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                  🥬
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Crisp Lettuce</h3>
                <p className="text-green-800/70 mb-4 text-sm">Crunchy, hydrating organic lettuce for perfect salads.</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-800">$2.49 / head</span>
                  <button className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center hover:bg-green-800 transition-colors">
                    +
                  </button>
                </div>
              </div>

              {/* Product 3 */}
              <div className="bg-[#f9f6f0] rounded-2xl p-6 shadow-sm border border-green-900/5 hover:shadow-md transition-shadow group">
                <div className="aspect-square bg-green-100 rounded-xl mb-6 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                  🍯
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Raw Organic Honey</h3>
                <p className="text-green-800/70 mb-4 text-sm">Pure, unpasteurized honey from local organic apiaries.</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-800">$8.99 / jar</span>
                  <button className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center hover:bg-green-800 transition-colors">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why Choose Us */}
        <section className="py-24 bg-green-900 text-[#f9f6f0]">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">Why Choose Sri Organic?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-bold mb-2">100% Organic</h3>
                <p className="text-green-100/70 text-sm">Certified organic products grown without synthetic pesticides or fertilizers.</p>
              </div>
              <div>
                <div className="text-4xl mb-4">🚜</div>
                <h3 className="text-xl font-bold mb-2">Local Farmers</h3>
                <p className="text-green-100/70 text-sm">We partner directly with local, sustainable farms to ensure freshness.</p>
              </div>
              <div>
                <div className="text-4xl mb-4">♻️</div>
                <h3 className="text-xl font-bold mb-2">Eco-Friendly</h3>
                <p className="text-green-100/70 text-sm">Packaging and processes designed to minimize our environmental footprint.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-950 text-green-100/60 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#f9f6f0]">Sri Organic</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Sri Organic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
