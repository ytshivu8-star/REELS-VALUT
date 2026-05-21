import ProductCard from "../components/home/ProductCard";
import Hero from "../components/home/Hero";
import { useProducts } from "../hooks/useProducts";
import { motion } from "motion/react";
import { Shield, FastForward, Award, HeadphonesIcon, Instagram, Star } from "lucide-react";

export default function Home() {
  const { products, loading } = useProducts();

  return (
    <div className="bg-dark min-h-screen">
      <Hero />
      
      {/* Featured Bundles */}
      <section id="bundles" className="py-16 md:py-32 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10 md:mb-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-6xl font-black uppercase leading-none tracking-tighter mb-4">
                TRENDING <span className="text-primary italic">BUNDLES</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base">
                Hand-picked, high-performing content designed to save you time and maximize your engagement. 
              </p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Catalogue Size</div>
              <div className="text-4xl font-black">1000+ REELS</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="aspect-[9/16] bg-white/5 animate-pulse rounded-2xl" />
              ))
            ) : (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Feature Bar */}
      <div className="mt-auto h-auto md:h-24 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-center md:justify-between px-6 md:px-10 gap-6 md:gap-8 py-8 md:py-0">
        <div className="flex flex-wrap gap-6 md:gap-12 justify-center">
          <div className="flex items-center gap-3">
            <div className="text-primary"><FastForward size={20} className="md:w-6 md:h-6" /></div>
            <div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-tight">INSTANT ACCESS</p>
              <p className="text-[8px] md:text-[10px] text-slate-500 uppercase">Drive link after payment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-primary"><Shield size={20} className="md:w-6 md:h-6" /></div>
            <div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-tight">100% SECURE</p>
              <p className="text-[8px] md:text-[10px] text-slate-500 uppercase">Razorpay & UPI Protected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-primary"><Award size={20} className="md:w-6 md:h-6" /></div>
            <div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-tight">PREMIUM QUALITY</p>
              <p className="text-[8px] md:text-[10px] text-slate-500 uppercase">4K Content Bundles</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-400 cursor-pointer hover:bg-green-500 hover:text-white transition-all">
             <Instagram size={16} />
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-all">
             <HeadphonesIcon size={16} />
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <section className="py-12 md:py-32 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-6xl font-display uppercase leading-tight mb-8 md:mb-20 text-center">
            What Our <span className="text-primary italic">Creators</span> Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] relative">
                <div className="text-primary flex gap-1 mb-4 md:mb-6">
                  <Star size={16} className="fill-current md:w-5 md:h-5" />
                  <Star size={16} className="fill-current md:w-5 md:h-5" />
                  <Star size={16} className="fill-current md:w-5 md:h-5" />
                  <Star size={16} className="fill-current md:w-5 md:h-5" />
                  <Star size={16} className="fill-current md:w-5 md:h-5" />
                </div>
                <p className="text-sm md:text-lg italic text-white/80 mb-6 md:mb-8 leading-relaxed">
                  "Webnixo bundles literally saved my page. I went from 200 views to 50k+ on my first upload from the mega pack. The quality is unmatched!"
                </p>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 shrink-0" />
                  <div>
                    <div className="font-bold text-white uppercase tracking-wider text-[10px] md:text-sm">Aman S.</div>
                    <div className="text-white/40 text-[9px] md:text-xs uppercase tracking-widest">Growth Specialist</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6 container mx-auto">
        <div className="glass bg-primary/10 rounded-2xl md:rounded-[3rem] p-6 sm:p-20 flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-3xl md:text-7xl font-display uppercase mb-4 md:mb-8 max-w-4xl tracking-tighter line-clamp-2 md:line-clamp-none">
            Ready to <span className="text-primary">Dominate</span> Social Media?
          </h2>
          <p className="text-sm md:text-xl text-white/60 mb-6 md:mb-12 max-w-2xl">
            Don't leave your growth to chance. Use proven, viral content to build your empire today.
          </p>
          <a href="#bundles" className="btn-primary py-4 md:py-5 px-6 md:px-14 text-sm md:text-xl w-full md:w-auto">Get Started Now</a>
        </div>
      </section>
    </div>
  );
}
