import { motion } from "motion/react";
import { Zap, PlayCircle, Star, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 animate-pulse"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary" />
          Scale Your Audience Overnight
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tighter leading-[0.9]"
        >
          1000+ VIRAL REELS <br className="sm:block hidden"/>
          <span className="text-gradient">READY TO UPLOAD</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg mb-10 px-2 sm:px-4"
        >
          Dominate the algorithm with premium 4K motivational content packs. <br className="hidden md:block" />
          Captions included. No watermarks. Instant download access.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0"
        >
          <a 
            href="#bundles" 
            className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black uppercase rounded-xl hover:bg-primary transition-all duration-300 shadow-xl"
          >
            Grab Pack
          </a>
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 md:mt-20 grid grid-cols-3 gap-4 max-w-md mx-auto w-full md:flex md:w-auto md:justify-center md:gap-12 text-slate-500"
        >
          <div className="flex flex-col items-center">
            <div className="text-xl sm:text-2xl font-black text-white">50K+</div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest">Creators</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl sm:text-2xl font-black text-white">4K UHD</div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest">Resolution</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl sm:text-2xl font-black text-white">100%</div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest">No-Watermark</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
