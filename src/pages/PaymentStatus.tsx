import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Loader2, Download, ExternalLink, ArrowRight } from "lucide-react";
import { useAuth, OperationType, handleFirestoreError } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { PRODUCTS } from "../constants";
import toast from "react-hot-toast";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  const productId = searchParams.get("product_id");
  const product = PRODUCTS.find((p) => p.id === productId);

  useEffect(() => {
    async function verifyPayment() {
      if (!orderId || !user || !productId) {
        if (!user && status === "loading") toast.error("Please login to verify payment");
        return;
      }

      try {
        const response = await fetch(`/api/verify-payment/${orderId}`);
        const data = await response.json();

        if (data.status === "SUCCESS") {
          // Grant access in Firestore
          const orderData = {
            userId: user.uid,
            userEmail: user.email,
            productId: productId,
            amount: data.payment.order_amount,
            status: 'completed',
            cfOrderId: data.payment.cf_payment_id,
            createdAt: new Date().toISOString()
          };

          try {
            // 1. Log the order
            await setDoc(doc(db, 'orders', orderId!), orderData);
            
            // 2. Add to user's purchased products
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              const currentPacks = userData.purchasedProductIds || [];
              if (!currentPacks.includes(productId)) {
                await updateDoc(userRef, {
                  purchasedProductIds: [...currentPacks, productId]
                });
              }
            } else {
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                isAdmin: false,
                purchasedProductIds: [productId]
              });
            }

            // 3. Force refresh user profile state
            await refreshProfile();

            setStatus("success");
            toast.success("Payment Verified! Access Granted.");
          } catch (fireError) {
            handleFirestoreError(fireError, OperationType.WRITE, `orders/${orderId}`);
          }
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("failed");
      }
    }

    verifyPayment();
  }, [orderId, user, productId]);

  return (
    <div className="pt-32 pb-20 px-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      {status === "loading" && (
        <div className="space-y-6">
          <Loader2 size={64} className="text-primary animate-spin mx-auto" />
          <h1 className="text-3xl font-black uppercase tracking-tighter">Verifying Payment...</h1>
          <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">Please do not close this window</p>
        </div>
      )}

      {status === "success" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <div className="relative inline-block">
            <CheckCircle2 size={80} className="text-green-500 mx-auto relative z-10" />
            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
          </div>
          
          <div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-3">Payment Successful!</h1>
            <p className="text-slate-400 uppercase text-xs font-black tracking-widest max-w-md mx-auto leading-relaxed">
              Your access has been granted instantly. You can start downloading and uploading straight away!
            </p>
          </div>

          {/* Product details and direct access link */}
          {product && (
            <div className="bg-[#151619] border border-white/10 rounded-2xl p-6 md:p-8 text-left space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-green-500 to-primary" />
              
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img src={product.thumbnail} className="w-full h-full object-cover" alt={product.name} />
                </div>
                <div className="flex-grow text-center sm:text-left space-y-1">
                  <span className="text-[9px] font-black tracking-widest text-[#00E5FF] uppercase">PRODUCT READY</span>
                  <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-tight">{product.name}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2 font-medium leading-relaxed">{product.description}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a 
                  href={product.deliveryLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 px-8 py-4 bg-primary text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 group shadow-lg"
                >
                  <Download size={15} />
                  <span>Open Drive Folder</span>
                  <ExternalLink size={12} className="opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <span>Go to Library</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Instructions on logging back in */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-left space-y-3">
            <span className="inline-flex py-1 px-3 bg-white/5 border border-white/10 text-[9px] text-slate-300 font-black uppercase tracking-widest rounded-full">
              🔑 How to Re-Login & Recover Your Purchases
            </span>
            <p className="text-[11px] leading-relaxed text-slate-400 uppercase font-bold tracking-tight">
              To log in later and access this drive link again: Click <span className="text-primary font-black">Login / Sign Up</span> on the homepage navigation bar, select <span className="text-white font-black">Manual Creator Access</span>, and fill in your registered Email ID <span className="text-white font-black">({user?.email})</span> and Name. That's it! Your past purchases will be fetched from Firebase and listed on your Dashboard automatically.
            </p>
          </div>
        </motion.div>
      )}

      {status === "failed" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <XCircle size={80} className="text-red-500 mx-auto" />
          <h1 className="text-5xl font-black uppercase tracking-tighter">Payment Failed</h1>
          <p className="text-slate-500 uppercase text-sm font-bold tracking-widest max-w-md mx-auto leading-relaxed">
            We couldn't verify your payment. If your money was deducted, please contact support.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-10 py-5 bg-white text-black font-black uppercase text-sm rounded-xl hover:bg-primary transition-all"
          >
            Back to Home
          </button>
        </motion.div>
      )}
    </div>
  );
}
