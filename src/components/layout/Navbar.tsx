import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, User, Menu, X, Instagram, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { AuthModal } from "../auth/AuthModal";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthModalOpen, setIsAuthModalOpen, openAuthModal } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 h-16 flex items-center",
        isScrolled ? "bg-dark/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <span className="text-xl font-bold tracking-tight uppercase">WEBNIXO REEL <span className="text-primary font-black">BUNDLES</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Bundles</Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">My Orders</Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-6">
                <button 
                  onClick={logout} 
                  className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] text-slate-400 font-black uppercase tracking-widest rounded-lg hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="px-5 py-2 bg-primary text-black font-bold rounded-full text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-dark/95 backdrop-blur-xl border-b border-white/5 p-6 md:hidden flex flex-col gap-6 overflow-hidden"
          >
             <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-xl font-black uppercase tracking-tighter">Bundles</Link>
             <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-xl font-black uppercase tracking-tighter">Library</Link>
             
             <div className="pt-6 border-t border-white/5">
               {user ? (
                 <div className="flex flex-col gap-4">
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Account: {user.email}</div>
                   <button 
                     onClick={() => { logout(); setIsMenuOpen(false); }} 
                     className="w-full py-4 bg-red-500/10 text-red-500 font-black uppercase text-xs rounded-xl border border-red-500/20"
                   >
                     Logout
                   </button>
                 </div>
               ) : (
                 <div className="flex flex-col gap-3">
                   <button 
                     onClick={() => { openAuthModal('login'); setIsMenuOpen(false); }} 
                     className="w-full py-4 bg-white/10 text-white font-black uppercase text-xs rounded-xl border border-white/10"
                   >
                     Login
                   </button>
                   <button 
                     onClick={() => { openAuthModal('signup'); setIsMenuOpen(false); }} 
                     className="w-full py-4 bg-primary text-black font-black uppercase text-xs rounded-xl shadow-lg shadow-primary/20"
                   >
                     Sign Up
                   </button>
                 </div>
               )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}
