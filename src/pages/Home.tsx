import { useState } from "react";
import ProductCard from "../components/home/ProductCard";
import Hero from "../components/home/Hero";
import { useProducts } from "../hooks/useProducts";
import { useSampleReels } from "../hooks/useSampleReels";
import { getEmbeddableDriveVideoUrl, getDirectStreamUrl, getDriveVideoThumbnailUrl } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  FastForward, 
  Award, 
  HeadphonesIcon, 
  Instagram, 
  Star, 
  ArrowUpDown, 
  FolderOpen, 
  FileVideo, 
  Play, 
  X, 
  ExternalLink, 
  Tv, 
  Sparkles, 
  Info,
  Sliders 
} from "lucide-react";

const getSampleThumbnailUrl = (idx: number) => {
  const thumbnails = [
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=70", // Clip 01: Andrew Tate / Wealth Car
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=70", // Clip 02: Elite / Leader Mindset Suit
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=70", // Clip 03: Grit / Gym / Bodybuilding
    "https://images.unsplash.com/photo-1621259182978-f09e5e2b07ae?w=600&auto=format&fit=crop&q=70"  // Clip 04: Epic City Lights / Financial Freedom
  ];
  return thumbnails[idx] || thumbnails[0];
};

export default function Home() {
  const { products, loading } = useProducts();
  const { data: sampleData, loading: samplesLoading } = useSampleReels();
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high">("featured");
  const [activeClipIndex, setActiveClipIndex] = useState<number | null>(null);
  const [useNativePlayer, setUseNativePlayer] = useState<boolean>(true);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    }
    if (sortBy === "price-high") {
      return b.price - a.price;
    }
    return 0; // featured remains default sequence
  });

  return (
    <div className="bg-dark min-h-screen">
      <Hero />
      
      {/* Featured Bundles */}
      <section id="bundles" className="py-16 md:py-32 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10 md:mb-12">
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

          {/* Pricing Sort Options */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <span className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                <ArrowUpDown size={12} className="text-primary" /> Sort by price:
              </span>
              <div className="flex items-center gap-1 bg-black/60 border border-white/5 p-1 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
                <button
                  id="sort-featured"
                  onClick={() => setSortBy("featured")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all text-center ${
                    sortBy === "featured"
                      ? "bg-primary text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Featured
                </button>
                <button
                  id="sort-price-low"
                  onClick={() => setSortBy("price-low")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all text-center ${
                    sortBy === "price-low"
                      ? "bg-primary text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Low to High
                </button>
                <button
                  id="sort-price-high"
                  onClick={() => setSortBy("price-high")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all text-center ${
                    sortBy === "price-high"
                      ? "bg-primary text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  High to Low
                </button>
              </div>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider text-left sm:text-right">
              Showing <span className="text-primary font-black">{sortedProducts.length}</span> premium bundles
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="aspect-[9/16] bg-white/5 animate-pulse rounded-2xl" />
              ))
            ) : (
              sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Sample Reel Clips Section */}
      <section id="samples" className="py-16 md:py-24 px-4 md:px-6 relative bg-white/[0.01] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10 md:mb-16">
            <div className="max-w-2xl">
              <span className="text-primary text-[10px] md:text-xs font-black uppercase tracking-widest pl-1 mb-2 block">FREE PREVIEWS</span>
              <h2 className="text-3xl md:text-6xl font-black uppercase leading-none tracking-tighter mb-4">
                SAMPLE <span className="text-primary italic">REEL CLIPS</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base">
                Check our styling, clarity, and pacing in real-time before choosing your growth path.
              </p>
            </div>
          </div>

          {samplesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="aspect-[9/16] bg-white/5 animate-pulse rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                  <Play size={24} className="text-slate-600 animate-bounce" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {sampleData.clips.map((clipUrl, idx) => {
                return (
                  <div key={idx} className="flex flex-col gap-3 group">
                    <div 
                      onClick={() => {
                        setActiveClipIndex(idx);
                        setUseNativePlayer(true); // default to fast direct player first
                      }}
                      className="aspect-[9/16] bg-black/60 rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl group-hover:border-primary/40 transition-all cursor-pointer flex flex-col items-center justify-center group"
                    >
                      {/* Real video preview thumbnail background - uses img with no-referrer to guarantee loading from Drive without blockages */}
                      <img 
                        src={getDriveVideoThumbnailUrl(clipUrl, getSampleThumbnailUrl(idx))}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                        alt={`Sample Reel Clip 0${idx + 1} Thumbnail`}
                      />
                      {/* Dark overlay with linear gradient to ensure contrast of controls */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95 z-0 transition-opacity duration-300 group-hover:opacity-90" />
                      
                      {/* Grid background motif */}
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
                      
                      {/* Top status badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <span className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded text-[9px] font-black uppercase text-primary tracking-widest bg-black/50 backdrop-blur-sm">
                          Clip 0{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-slate-400 tracking-wider bg-black/50 backdrop-blur-sm">
                          1080P HD
                        </span>
                      </div>

                      {/* Video and Play visualizer core */}
                      <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 group-hover:bg-primary group-hover:text-black hover:scale-110 transition-all duration-300 flex items-center justify-center text-primary shadow-lg shadow-primary/25 mb-3 backdrop-blur-sm">
                          <Play size={20} className="ml-1 fill-current group-hover:fill-none transition-all duration-300" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                          Watch Sample
                        </span>
                      </div>

                      {/* Bottom characteristics list */}
                      <div className="absolute bottom-4 left-4 right-4 text-center z-10">
                        <div className="flex items-center justify-center gap-1.5 text-[8px] font-black text-slate-300 uppercase tracking-widest bg-black/40 py-1.5 px-2 rounded-lg backdrop-blur-sm inline-flex mx-auto">
                          <span>Auto Captions</span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                          <span>Discipline</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                        Reel Preview 0{idx + 1}
                      </span>
                      {clipUrl && (
                        <a
                          href={clipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] hover:text-primary transition-colors text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <span>Drive Link</span>
                          <ExternalLink size={8} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Immersive Responsive Video Lightbox Modal */}
      <AnimatePresence>
        {activeClipIndex !== null && sampleData.clips[activeClipIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[99999] overflow-y-auto p-4 flex flex-col items-center justify-start sm:justify-center py-10"
          >
            {/* Overlay backdrop click to close */}
            <div 
              className="absolute inset-0 z-0 cursor-zoom-out" 
              onClick={() => setActiveClipIndex(null)}
            />

            {/* Modal Box with high viewport safety on slim / small mobile screens */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-sm bg-[#0e0f11] border border-white/10 rounded-[2rem] p-4 md:p-5 shadow-2xl flex flex-col gap-3 my-auto shrink-0 max-h-[96vh] overflow-y-auto scrollbar-none"
            >
              {/* Header metadata controls */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase font-black text-primary tracking-widest mb-0.5">High Definition Preview</div>
                  <h3 className="text-white text-sm md:text-base font-black uppercase tracking-tight">
                    Sample Reel Clip 0{activeClipIndex + 1}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveClipIndex(null)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Player Mode Settings Selector */}
              <div className="grid grid-cols-2 gap-1 bg-black/80 p-0.5 rounded-xl border border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => setUseNativePlayer(true)}
                  className={`py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    useNativePlayer 
                      ? "bg-primary text-black" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sliders size={10} />
                  <span>Direct Player</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUseNativePlayer(false)}
                  className={`py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    !useNativePlayer 
                      ? "bg-primary text-black" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Tv size={10} />
                  <span>Google Drive</span>
                </button>
              </div>

              {/* Main portrait 9:16 video frame container - highly responsive exact dimensions to prevent browser control alignments offset to the right */}
              <div className="aspect-[9/16] w-[270px] sm:w-[290px] md:w-[304px] lg:w-[326px] max-w-[85vw] bg-black rounded-2xl overflow-hidden border border-white/10 relative shadow-inner mx-auto shrink-0 self-center">
                {useNativePlayer ? (
                  <video
                    src={getDirectStreamUrl(sampleData.clips[activeClipIndex])}
                    autoPlay
                    controls
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover bg-black rounded-2xl block"
                    onError={() => {
                      console.warn("Direct stream failed to buffer. Swapping to Drive fallback preview.");
                      setUseNativePlayer(false);
                    }}
                  />
                ) : (
                  <iframe
                    src={getEmbeddableDriveVideoUrl(sampleData.clips[activeClipIndex])}
                    className="absolute inset-0 w-full h-full border-0 bg-black rounded-2xl block"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    title={`Lightbox Sample Reel Preview ${activeClipIndex + 1}`}
                  />
                )}
              </div>

              {/* Info text or status banner */}
              <div className="flex gap-2 p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-[9px] text-slate-400 leading-normal shrink-0">
                <Sparkles size={11} className="text-primary shrink-0 mt-0.5 animate-pulse" />
                <p>
                  {useNativePlayer
                    ? "Direct high-bandwidth rendering with zero cropping. If video fails, select 'Google Drive' player tab."
                    : "Official secure Google preview container. Tap 'Open Drive' below to download in full definition."
                  }
                </p>
              </div>

              {/* Action commands line */}
              <div className="grid grid-cols-2 gap-2 mt-0.5 shrink-0">
                <a
                  href={sampleData.clips[activeClipIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <ExternalLink size={10} className="text-primary" />
                  <span>Open Drive</span>
                </a>
                <button
                  onClick={() => setActiveClipIndex(null)}
                  className="py-2.5 bg-primary hover:bg-white hover:text-black text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <a href="https://www.instagram.com/webnixo.in" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500 hover:text-white transition-all">
             <Instagram size={16} />
          </a>
          <a href="https://wa.me/917676394923?text=Hi%20I%20want%20to%20buy%20the%20reel%20bundle" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
             <HeadphonesIcon size={16} />
          </a>
        </div>
      </div>

      {/* Testimonials */}
      <section className="py-12 md:py-32 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-6xl font-display uppercase leading-tight mb-8 md:mb-20 text-center">
            What Our <span className="text-primary italic">Creators</span> Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: "Aman Sharma",
                role: "Self-Improvement Creator",
                handle: "@alphamental.in",
                text: "The Andrew Tate and alpha mindset reels are styled perfectly. Grew my self-improvement page from scratch to 45k followers in less than 30 days! Webnixo is an outstanding investment.",
                initial: "A"
              },
              {
                name: "Priya Patel",
                role: "Social Media Agency CEO",
                handle: "CreativeShift Agency",
                text: "Best quality content bundles on the internet! Our clients' average reach increased by 310% in the first week. The edits are premium, high-res (HD/4K), and completely watermark-free.",
                initial: "P"
              },
              {
                name: "Rohan Malhotra",
                role: "Full-time Creator",
                text: "No more editing for 6 hours a day! I just download a reel from the Webnixo Google Drive, insert my caption hooks, and schedule. It saved me huge time and got me 1.2M impressions!",
                handle: "@rohanmotivation",
                initial: "R"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="glass p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] relative flex flex-col justify-between">
                <div>
                  <div className="text-primary flex gap-1 mb-4 md:mb-6">
                    <Star size={16} className="fill-current md:w-5 md:h-5" />
                    <Star size={16} className="fill-current md:w-5 md:h-5" />
                    <Star size={16} className="fill-current md:w-5 md:h-5" />
                    <Star size={16} className="fill-current md:w-5 md:h-5" />
                    <Star size={16} className="fill-current md:w-5 md:h-5" />
                  </div>
                  <p className="text-sm md:text-base italic text-white/80 mb-6 md:mb-8 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black uppercase text-xs">
                    {testimonial.initial}
                  </div>
                  <div>
                    <div className="font-bold text-white uppercase tracking-wider text-[10px] md:text-sm">{testimonial.name}</div>
                    <div className="text-white/40 text-[9px] md:text-xs uppercase tracking-widest">{testimonial.role} • {testimonial.handle}</div>
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
