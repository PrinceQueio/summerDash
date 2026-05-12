import React, { useState } from 'react';

// Product images generated via AI
const IMAGES = {
  jersey: '/summerdash_jersey_mockup_1778340945769.png',
  hoodie: '/summerdash_hoodie_mockup_1778340956739.png',
  brandedHoodie: '/summerdash_branded_hoodie_mockup_1778342413693.png',
  cap: '/summerdash_cap_mockup_1778340972114.png',
  bottle: '/summerdash_bottle_mockup_1778343273904.png',
  mug: '/summerdash_mug_mockup_1778343296299.png',
  socks: '/summerdash_socks_mockup_1778343311237.png',
  tote: '/summerdash_tote_mockup_1778343337502.png',
  stickers: '/summerdash_sticker_mockup_1778343349833.png',
  beanie: '/summerdash_beanie_mockup_1778343361279.png',
};

const PRODUCTS = [
  {
    id: 7,
    name: 'SummerDash Branded Hoodie',
    price: '85.00',
    category: 'Apparel',
    tag: 'Featured',
    description: 'The definitive SummerDash streetwear staple. Heavyweight black fleece with high-density neon lime embroidery.',
    details: ['450GSM French Terry', '3D Glitch Embroidery', 'Oversized Fit', 'Signature Neon Tag'],
    image: IMAGES.brandedHoodie,
    color: '#d4ff00',
  },
  {
    id: 1,
    name: 'Runner Jersey #04',
    price: '45.00',
    category: 'Apparel',
    tag: 'Limited',
    description: 'The official Summer Dash tournament jersey. Lightweight performance fabric with pixel-art number printing on the back.',
    details: ['100% Performance Polyester', 'Pixel-art screen print', 'Unisex relaxed fit', 'Limited to 500 units'],
    image: IMAGES.jersey,
    color: '#d4ff00',
  },
  {
    id: 2,
    name: 'Glitch Cap',
    price: '30.00',
    category: 'Accessories',
    tag: 'New',
    description: 'Six-panel structured cap with embroidered Summer Dash logo and glitch-effect side print.',
    details: ['100% Cotton Twill', 'Embroidered logo', 'Adjustable snapback', 'One size fits all'],
    image: IMAGES.cap,
    color: '#00e5ff',
  },
  {
    id: 3,
    name: 'Sewer Biome Hoodie',
    price: '75.00',
    category: 'Apparel',
    tag: null,
    description: 'Heavyweight pullover inspired by the Sewer Biome. Features glow-in-the-dark biome map print on the back.',
    details: ['400GSM Cotton Fleece', 'Glow-in-dark back print', 'Kangaroo pocket', 'Made in Portugal'],
    image: IMAGES.hoodie,
    color: '#39ff14',
  },
  {
    id: 4,
    name: 'SummerDash Water Bottle',
    price: '25.00',
    category: 'Lifestyle',
    tag: 'Essential',
    description: 'Sleek matte black insulated bottle. Keeps drinks cold for 24 hours during your longest glitch escapes.',
    details: ['750ml Capacity', 'Double-walled steel', 'BPA Free', 'Neon Lime Branding'],
    image: IMAGES.bottle,
    color: '#d4ff00',
  },
  {
    id: 5,
    name: 'Glitch Mug',
    price: '18.00',
    category: 'Lifestyle',
    tag: null,
    description: 'Start your morning with a dose of glitch. Matte black ceramic with a vibrant neon interior.',
    details: ['12oz Capacity', 'Microwave safe', 'High-gloss interior', 'Pixel-art logo'],
    image: IMAGES.mug,
    color: '#00e5ff',
  },
  {
    id: 8,
    name: 'Performance Socks',
    price: '15.00',
    category: 'Apparel',
    tag: 'New',
    description: 'Athletic crew socks with compression arch support and neon glitch aesthetics.',
    details: ['Cotton/Nylon blend', 'Reinforced heel', 'Breathable mesh', 'Glitch knit pattern'],
    image: IMAGES.socks,
    color: '#d4ff00',
  },
  {
    id: 9,
    name: 'Biome Tote Bag',
    price: '22.00',
    category: 'Accessories',
    tag: null,
    description: 'Heavyweight canvas tote for your daily gear. Features the expanded Biome Map graphic.',
    details: ['100% Organic Canvas', 'Reinforced straps', 'Screen printed', 'Internal pocket'],
    image: IMAGES.tote,
    color: '#39ff14',
  },
  {
    id: 10,
    name: 'Pixel Sticker Pack',
    price: '10.00',
    category: 'Accessories',
    tag: null,
    description: 'Set of 12 weather-resistant vinyl stickers featuring your favorite SummerDash icons.',
    details: ['UV Resistant', 'Matte Finish', 'Die-cut shapes', 'Includes Rare Holographic'],
    image: IMAGES.stickers,
    color: '#ffd700',
  },
  {
    id: 11,
    name: 'Cyber Beanie',
    price: '28.00',
    category: 'Accessories',
    tag: 'New',
    description: 'Soft-touch ribbed beanie for late-night runs. Features the classic embroidered bolt logo.',
    details: ['Acrylic/Wool blend', 'Adjustable cuff', 'Tight knit', 'Neon embroidery'],
    image: IMAGES.beanie,
    color: '#d4ff00',
  },
  {
    id: 12,
    name: 'SummerDash Arcade Coin',
    price: '12.00',
    category: 'Collectibles',
    tag: 'OG',
    description: 'A physical replica of the in-game arcade coin. Hard enamel with a shiny gold finish.',
    details: ['Die-cast metal', 'Gold plating', 'Collector pouch included', 'Limited edition'],
    image: '/summerdash_keychain_mockup_1778343042676.png',
    color: '#ffd700',
  },
  {
    id: 13,
    name: 'Elite Token Pin',
    price: '18.00',
    category: 'Collectibles',
    tag: 'Elite',
    description: 'The definitive $DASH token pin. Soft enamel with gold-plated edges.',
    details: ['Enamel finish', 'Gold-plated edge', 'Secure rubber clutch', 'Individually numbered'],
    image: '/summerdash_token_pin_mockup_1778343070618.png',
    color: '#d4ff00',
  },
];

const CATEGORIES = ['All Products', 'Apparel', 'Accessories', 'Collectibles'];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const ProductVisual = ({ color, category, image }) => {
  if (image) {
    return (
      <div className="w-full h-full bg-[#f6f6f6] flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-500">
        <img src={image} alt="Product" className="w-full h-full object-contain mix-blend-multiply" />
      </div>
    );
  }

  const icons = {
    Apparel: '👕',
    Accessories: '🧢',
    Collectibles: '🪙',
  };
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-[#f6f6f6]"
    >
      <span className="text-6xl z-10 drop-shadow-lg opacity-20">{icons[category] || '🎮'}</span>
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: color }}
      />
    </div>
  );
};

const ShopPage = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toggle body class for white background
  React.useEffect(() => {
    document.body.classList.add('shop-active');
    return () => document.body.classList.remove('shop-active');
  }, []);

  const addToCart = (product, size = 'M') => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedSize === size)
            ? { ...item, quantity: (Number(item.quantity) || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, cartId: Math.random() }];
    });
  };

  const removeFromCart = (cartId, forceAll = false) => {
    setCart(prev => {
      const item = prev.find(i => i.cartId === cartId);
      if (item && (Number(item.quantity) || 1) > 1 && !forceAll) {
        return prev.map(i => i.cartId === cartId ? { ...i, quantity: (Number(i.quantity) || 1) - 1 } : i);
      }
      return prev.filter(i => i.cartId !== cartId);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (Number(item.quantity) || 1)), 0).toFixed(2);
  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const filtered = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'All Products' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      setSelectedProduct(null);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#111] overflow-x-hidden">
      {/* Remix-style Minimalist Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_left</span>
              Game
            </button>
            <nav className="hidden md:flex items-center gap-8">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-primary ${activeCategory === cat ? 'text-primary' : 'text-gray-400'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-black uppercase tracking-[0.3em]">
            Summer Dash<span className="text-primary">.</span>
          </h1>

          <div className="flex items-center gap-6">
             {isSearchOpen ? (
               <div className="flex items-center bg-[#f6f6f6] px-4 py-2 border border-[#eee] animate-in slide-in-from-right duration-300">
                 <input 
                   autoFocus
                   type="text"
                   placeholder="Search products..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-[0.2em] w-48"
                 />
                 <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="material-symbols-outlined text-sm ml-2">close</button>
               </div>
             ) : (
               <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-secondary"
               >
                Search
               </button>
             )}
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-secondary"
            >
              Cart ({cartCount})
            </button>
          </div>
        </div>
      </header>

      {/* Typography Hero Section - Remix Format */}
      <section className="px-6 py-24 md:py-32 max-w-[1400px] mx-auto">
        <h2 className="text-4xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase max-w-4xl">
          Summer Dash <span className="text-gray-300">escape the glitch</span> soft wear <span className="text-gray-300">for runners of all kinds</span>
        </h2>
      </section>

      {/* Product Grid - Dense & Clean */}
      <main className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filtered.map(product => (
            <div
              key={product.id}
              onClick={() => { setSelectedProduct(product); setAddedToCart(false); setSelectedSize('M'); }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] mb-4 overflow-hidden bg-[#f6f6f6] relative">
                {product.tag && (
                  <div className="absolute top-4 left-4 z-10 bg-[#111] text-white px-2 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {product.tag}
                  </div>
                )}
                <ProductVisual color={product.color} category={product.category} image={product.image} />
              </div>
              <div className="flex justify-between items-center mt-2 group/info">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold uppercase tracking-tight">{product.name}</span>
                  <span className="text-[11px] font-medium text-[#777] uppercase tracking-widest">${product.price}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="w-8 h-8 rounded-full border border-[#eee] flex items-center justify-center hover:bg-[#d4ff00] hover:border-[#d4ff00] transition-colors"
                >
                  <span className="text-lg font-light">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Catalog Note */}
        <div className="mt-32 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-md">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-4">Catalog V.1.0</p>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              Designed for high-performance glitch escaping. Our soft wear is engineered to withstand the digital void while maintaining maximum comfort in physical space.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Designed in SDash</div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Minted on Avalanche</div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Worldwide Shipping</div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Limited Quantities</div>
          </div>
        </div>
      </main>

      {/* Footer - Remix Style */}
      <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Summer Dash<span className="text-primary">.</span></h2>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest leading-loose">
              Summer Dash is for everyone<br />
              Summer Dash is an engineering team<br />
              Summer Dash builds tools for a better run
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6">Links</h4>
            <ul className="space-y-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <li><a href="#" className="hover:text-secondary transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">X / Twitter</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Discord</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6">Support</h4>
            <ul className="space-y-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <li><a href="#" className="hover:text-secondary transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 mt-24 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
          © 2026 Summer Dash Team. Powered by Avalanche.
        </div>
      </footer>

      {/* Product Modal - Remix Format */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[9999] bg-white flex flex-col md:flex-row overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedProduct(null)}
            className="fixed top-8 right-8 z-[10000] size-12 bg-black text-white flex items-center justify-center hover:scale-110 transition-transform"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Large Image View */}
          <div className="w-full md:w-2/3 bg-[#f6f6f6] min-h-[50vh] md:min-h-screen flex items-center justify-center p-12">
            <ProductVisual color={selectedProduct.color} category={selectedProduct.category} image={selectedProduct.image} />
          </div>

          {/* Product Detail Sidebar */}
          <div className="w-full md:w-1/3 px-8 py-24 md:px-12 flex flex-col gap-12">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-4">{selectedProduct.category}</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">{selectedProduct.name}</h2>
              <p className="text-xl font-medium text-gray-500">${selectedProduct.price}</p>
            </div>

            <div className="space-y-6">
              <p className="text-sm font-medium text-gray-600 leading-relaxed">{selectedProduct.description}</p>

              {selectedProduct.category === 'Apparel' && (
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Select Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {SIZES.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 border-2 font-bold text-xs uppercase transition-all flex items-center justify-center ${selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {(() => {
                const inCart = cart.find(i => i.id === selectedProduct.id && i.selectedSize === selectedSize);
                return (
                  <div className="space-y-4">
                    {inCart && (
                      <div className="bg-[#f6f6f6] p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black">
                          Already in Cart: {Number(inCart.quantity) || 1}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(selectedProduct, selectedSize)}
                      className="w-full bg-[#111] text-white py-4 text-sm font-black uppercase tracking-widest hover:bg-[#333] transition-colors"
                    >
                      {inCart ? 'Add Another' : `Add to Cart — $${selectedProduct.price}`}
                    </button>
                  </div>
                );
              })()}
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center">
                Worldwide Shipping · Secure Checkout
              </p>
            </div>

            <div className="pt-12 border-t border-gray-100">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Details</h4>
              <ul className="space-y-3">
                {selectedProduct.details.map((d, i) => (
                  <li key={i} className="text-xs font-bold uppercase tracking-tight text-gray-500">• {d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 bg-[#d4ff00] text-[#111] px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 z-40 hover:scale-105 transition-all group border-2 border-black"
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          <span className="font-black uppercase tracking-widest text-xs">View Cart ({cartCount})</span>
          <span className="w-1.5 h-1.5 bg-[#111] rounded-full group-hover:scale-150 transition-transform"></span>
        </button>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-[#eee] flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="material-symbols-outlined">close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#999]">
                  <span className="material-symbols-outlined text-4xl mb-2">shopping_basket</span>
                  <p className="uppercase text-[10px] font-bold tracking-widest">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="flex gap-4 group">
                    <div className="w-20 aspect-square bg-[#f6f6f6] flex-shrink-0">
                      <ProductVisual image={item.image} category={item.category} color={item.color} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold uppercase">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.cartId, true)} className="text-[10px] text-gray-400 hover:text-black uppercase underline">Remove</button>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase mt-1">Size: {item.selectedSize}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border border-[#eee]">
                          <button onClick={() => removeFromCart(item.cartId)} className="px-2 py-1 text-xs hover:bg-gray-100">-</button>
                          <span className="px-3 text-[10px] font-bold">{item.quantity}</span>
                          <button onClick={() => addToCart(item, item.selectedSize)} className="px-2 py-1 text-xs hover:bg-gray-100">+</button>
                        </div>
                        <span className="text-xs font-bold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t border-[#eee] bg-[#fcfcfc]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Subtotal</span>
                  <span className="text-lg font-black">${cartTotal}</span>
                </div>
                <button className="w-full bg-[#111] text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-[#d4ff00] hover:text-[#111] transition-all">
                  Checkout Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;

