import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, ShoppingCart } from "lucide-react";
import { Product } from "../../types";
import { formatPrice, cn } from "../../lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user, setIsAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  const handleAction = (e: React.MouseEvent) => {
    // Let any user view the details page
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-primary/50 hover:bg-white/[0.07] transition-all group"
    >
      <Link 
        to={`/product/${product.id}`} 
        onClick={handleAction}
        className="block relative aspect-[9/16] w-full bg-slate-900 rounded-lg mb-4 overflow-hidden"
      >
        <img 
          src={product.thumbnail} 
          alt={product.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div className="w-12 h-12 border-2 border-white/50 rounded-full flex items-center justify-center">
             <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
           </div>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] uppercase font-black text-white">4K UHD</div>
      </Link>

      <div className="flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          {product.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              #{tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-xs sm:text-sm font-black uppercase mb-3 sm:mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex justify-between items-center mt-auto gap-1">
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest line-through opacity-70">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-primary font-black text-base sm:text-2xl tracking-tighter leading-none">{formatPrice(product.price)}</span>
          </div>
          <Link 
            to={`/product/${product.id}`}
            onClick={handleAction}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white text-black text-[9px] sm:text-[10px] font-black rounded uppercase hover:bg-primary transition-all shrink-0 text-center"
          >
            Grab Pack
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
