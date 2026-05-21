import { Instagram, Twitter, Mail, Zap, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-white/5 pt-20 pb-10 px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">Webnixo <span className="text-primary font-black">Reels</span></span>
          </Link>
          <p className="text-slate-500 max-w-sm mb-8 leading-relaxed text-sm font-medium">
            Dominate social media with ultra-high quality content bundles. 
            Designed for growth, scaled for results.
          </p>
          <div className="flex gap-4">
             <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
               <Instagram size={20} />
             </a>
             <a href="https://wa.me/917676394923?text=Hi%20I%20want%20to%20buy%20the%20reel%20bundle" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
               <Phone size={20} />
             </a>
          </div>
        </div>

        <div>
           <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-white">Navigation</h4>
           <ul className="space-y-3 text-slate-500 text-sm font-bold uppercase tracking-tight">
             <li><Link to="/" className="hover:text-white transition-colors">Bundles</Link></li>
             <li><Link to="/dashboard" className="hover:text-white transition-colors">Library</Link></li>
             
             <li><a href="#" className="hover:text-white transition-colors">Affiliate</a></li>
             <li><Link to="/admin" className="hover:text-white transition-colors opacity-30">Admin</Link></li>
           </ul>
        </div>

        <div>
           <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-white">Support</h4>
           <ul className="space-y-3 text-slate-500 text-sm font-bold uppercase tracking-tight">
             <li><a href="https://wa.me/917676394923?text=Hi%20I%20want%20to%20buy%20the%20reel%20bundle" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a></li>
             <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
           </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
        <p>© 2024 Webnixo Reels. Built for Scale.</p>
        <div className="flex gap-8">
           <span className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full" /> Server Online</span>
           <span className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> 256-Bit Encrypted</span>
        </div>
      </div>
    </footer>
  );
}
