import { useAuth } from "../context/AuthContext";
import { useProducts } from "../hooks/useProducts";
import { motion } from "motion/react";
import { Download, ExternalLink, Package, History, Zap, Settings, ArrowRight } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { formatPrice } from "../lib/utils";

export default function Dashboard() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const { products, loading: productsLoading } = useProducts();

  const loading = authLoading || productsLoading;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  );

  if (!user) return <Navigate to="/" />;

  const purchasedProducts = products.filter(p => profile?.purchasedProductIds?.includes(p.id));
  const suggestedProducts = products.filter(p => !profile?.purchasedProductIds?.includes(p.id)).slice(0, 2);

  return (
    <div className="pt-24 md:pt-28 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 md:mb-16">
        <div>
           <div className="inline-flex items-center gap-2 text-primary font-black tracking-widest text-[8px] md:text-[10px] uppercase mb-2 md:mb-4">
             <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
             Content Vault
           </div>
           <h1 className="text-3xl md:text-5xl font-black uppercase mb-1 tracking-tighter">My <span className="text-primary italic">Library</span></h1>
           <p className="text-slate-500 uppercase tracking-widest text-[8px] md:text-[9px] font-bold italic">User UUID: {user.uid.substring(0, 8)}...</p>
        </div>
        <div className="flex gap-2 md:gap-4">
           <Link to="/" className="flex-1 md:flex-initial text-center px-4 md:px-6 py-2.5 md:py-3 bg-white text-black font-black uppercase text-[10px] md:text-xs rounded-lg md:rounded-xl hover:bg-primary transition-all">
             Catalogue
           </Link>
           <button onClick={logout} className="flex-1 md:flex-initial px-4 md:px-6 py-2.5 md:py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] md:text-xs rounded-lg md:rounded-xl hover:bg-white/10 transition-all">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Sidebar Stats */}
        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
           <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-2xl relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-primary/5 transition-colors">
               <Package size={60} className="md:w-20 md:h-20" />
             </div>
             <div className="text-slate-500 uppercase tracking-widest text-[8px] md:text-[10px] mb-1 font-black">Owned Packs</div>
             <div className="text-3xl md:text-5xl font-black text-white">{purchasedProducts.length}</div>
           </div>
           <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-2xl">
             <div className="text-slate-500 uppercase tracking-widest text-[8px] md:text-[10px] mb-1 font-black">Cloud Space</div>
             <div className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">∞ GB</div>
           </div>
           <div className="col-span-2 lg:col-span-1 bg-primary/5 border border-primary/20 p-5 md:p-8 rounded-2xl">
             <Zap className="text-primary mb-3 md:mb-4 w-5 h-5 md:w-6 md:h-6" />
             <div className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 md:mb-2 text-primary">Viral Strategy</div>
             <p className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase leading-relaxed">Consistency is key. Use your unlocked content to post 3x daily.</p>
           </div>
        </div>

        {/* Downloads Feed */}
        <div className="lg:col-span-3">
           <h3 className="text-lg md:text-xl font-black uppercase mb-6 md:mb-8 flex items-center gap-3 tracking-tight">
             <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/20 flex items-center justify-center">
               <History size={14} className="text-primary" />
             </div>
             Purchase History
           </h3>

           {purchasedProducts.length > 0 ? (
             <div className="space-y-4">
               {purchasedProducts.map((product) => (
                 <motion.div 
                   key={product.id}
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 md:gap-8 hover:border-primary/30 transition-all group"
                 >
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                     <img src={product.thumbnail} className="w-full h-full object-cover" />
                   </div>
                   
                   <div className="flex-grow text-center sm:text-left">
                     <h4 className="text-base md:text-lg font-black uppercase mb-1 tracking-tight group-hover:text-primary transition-colors">{product.name}</h4>
                     <p className="text-slate-500 text-[8px] md:text-[10px] uppercase font-bold tracking-widest">Unlocked Premium Asset</p>
                   </div>

                   <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                     <a 
                       href={product.deliveryLink} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="px-6 md:px-8 py-2.5 md:py-3 bg-white text-black font-black uppercase text-[9px] md:text-[10px] rounded-lg hover:bg-primary transition-all flex items-center justify-center gap-2"
                     >
                       <Download size={12} />
                       Drive
                     </a>
                     <Link 
                       to={`/product/${product.id}`}
                       className="px-4 md:px-6 py-2.5 md:py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-[9px] md:text-[10px] rounded-lg hover:bg-white/10 flex items-center justify-center transition-all"
                     >
                       Info
                     </Link>
                   </div>
                 </motion.div>
               ))}
             </div>
           ) : (
             <div className="bg-white/5 border border-white/5 p-20 rounded-3xl text-center">
               <Package className="mx-auto text-slate-800 mb-8" size={64} />
               <h4 className="text-3xl font-black uppercase mb-4 tracking-tighter">Vault Empty</h4>
               <p className="text-slate-500 max-w-sm mx-auto mb-10 text-sm font-bold uppercase">
                 You haven't added any viral material to your library yet.
               </p>
               <Link to="/" className="px-10 py-4 bg-primary text-black font-black uppercase text-sm rounded-xl">Unlock Bundles</Link>
             </div>
           )}

           {/* Suggestions */}
           {purchasedProducts.length > 0 && products.length > purchasedProducts.length && (
             <div className="mt-20">
               <h3 className="text-2xl font-display uppercase mb-8">Recommended for You</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {suggestedProducts.map(product => (
                   <Link 
                     key={product.id}
                     to={`/product/${product.id}`}
                     className="glass p-6 rounded-3xl flex items-center gap-4 hover:border-primary/50 transition-colors"
                   >
                     <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                       <img src={product.thumbnail} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-grow">
                        <div className="text-sm font-display uppercase">{product.name}</div>
                        <div className="text-xs text-primary font-bold">{formatPrice(product.price)}</div>
                     </div>
                     <ArrowRight size={18} className="text-white/20" />
                   </Link>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
