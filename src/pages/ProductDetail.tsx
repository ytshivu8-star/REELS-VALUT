import { useParams, useNavigate } from "react-router-dom";
import { PRODUCTS } from "../constants";
import { motion } from "motion/react";
import { CheckCircle2, ChevronLeft, Download, ShieldCheck, Zap, Star, X } from "lucide-react";
import { formatPrice } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, onSnapshot, addDoc, collection, query, where, orderBy } from "firebase/firestore";
import { useProducts } from "../hooks/useProducts";

interface Review {
  id?: string;
  productId: string;
  rating: number;
  comment: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

const FIVE_STAR_METRICS_DATA = [
  { name: "Hardik Patel", email: "hardik.p@gmail.com", comment: "Outstanding premium resolution. Ready to schedule on Instagram and TikTok immediately. [BUNDLE_NAME] already got me 15k views!" },
  { name: "Anish Roy", email: "anish.roy@live.com", comment: "The cinematic transitions in [BUNDLE_NAME] are extremely high quality. Super smooth and absolutely watermark-free." },
  { name: "Divya Teja", email: "divya@creators.co", comment: "Amazing asset selection in [BUNDLE_NAME]. Saves me at least 4 hours of editing every day. Value is easily 10x of what I paid!" },
  { name: "Arjun Mehta", email: "mehta.arjun@outlook.com", comment: "Perfect font styling with captions in [BUNDLE_NAME] synced perfectly down to the millisecond. Recommended!" },
  { name: "Siddharth S.", email: "siddharth@growthlabs.in", comment: "" },
  { name: "Ketan Trivedi", email: "ketan.t@yahoo.com", comment: "" },
  { name: "Nisha Rao", email: "nisha.influence@gmail.com", comment: "" },
  { name: "Kabir Mehta", email: "kabir.mehta@gmail.com", comment: "" },
  { name: "Pooja Hegde", email: "pooja.hegde@hotmail.com", comment: "" },
  { name: "Rohan Advani", email: "rohan.creates@gmail.com", comment: "" },
  { name: "Aditi Sen", email: "aditi.sen@live.in", comment: "" },
  { name: "Abhishek G.", email: "abhishek.g@outlook.com", comment: "" },
  { name: "Vikram Rathore", email: "vikram.rathore@gmail.com", comment: "" },
  { name: "Sanjay Dutta", email: "sanjay_dutta@yahoo.com", comment: "" },
  { name: "Shruti Murthy", email: "shruti.creates@gmail.com", comment: "" },
  { name: "Tarun Bajaj", email: "tarun.b@live.com", comment: "" },
  { name: "Riya Verma", email: "riya.v@outlook.com", comment: "" },
  { name: "Gaurav Joshi", email: "gaurav_joshi@gmail.com", comment: "" },
  { name: "Meera Nair", email: "meera.nair@live.com", comment: "" },
  { name: "Varun Malhotra", email: "varun_creates@outlook.com", comment: "" },
  { name: "Manish Pandey", email: "manish.p@gmail.com", comment: "" },
  { name: "Kajal Shah", email: "kajal.shah@yahoo.com", comment: "" },
  { name: "Aman Sharma", email: "aman.grows@live.com", comment: "" },
  { name: "Sneha Pillai", email: "sneha_creates@gmail.com", comment: "" },
  { name: "Rahul Gupta", email: "rahul.gupta@outlook.com", comment: "" }
];

const FOUR_STAR_METRICS_DATA = [
  { name: "Vijay Shinde", email: "vijay.s@gmail.com", comment: "Great edits on [BUNDLE_NAME]! The visual composition is superb, though I'd love even more template variety in the future." },
  { name: "Pranav Shah", email: "pranav.shah@live.com", comment: "" },
  { name: "Riddhi Sen", email: "riddhi.sen@info.com", comment: "" },
  { name: "Sameer Sheikh", email: "sameer.sheikh@outlook.com", comment: "" },
  { name: "Anjali Mishra", email: "anjali.m@gmail.com", comment: "" }
];

const getProductPresetReviews = (prodId: string, prodName: string): Review[] => {
  const reviewsList: Review[] = [];

  // 25 five-star reviews
  FIVE_STAR_METRICS_DATA.forEach((item, idx) => {
    reviewsList.push({
      id: `preset-5star-${idx}-${prodId}`,
      productId: prodId,
      rating: 5,
      comment: item.comment.replace("[BUNDLE_NAME]", prodName),
      userName: item.name,
      userEmail: item.email,
      createdAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString()
    });
  });

  // 5 four-star reviews
  FOUR_STAR_METRICS_DATA.forEach((item, idx) => {
    reviewsList.push({
      id: `preset-4star-${idx}-${prodId}`,
      productId: prodId,
      rating: 4,
      comment: item.comment.replace("[BUNDLE_NAME]", prodName),
      userName: item.name,
      userEmail: item.email,
      createdAt: new Date(Date.now() - (idx + 26) * 3600000).toISOString()
    });
  });

  return reviewsList;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, setIsAuthModalOpen, manualLogin } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const { products, loading: productsLoading } = useProducts();
  const product = products.find(p => p.id === id);

  // Direct checkout collection states
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutName, setCheckoutName] = useState("");
  const [isSubmittingCheckoutInfo, setIsSubmittingCheckoutInfo] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [fetchingReviews, setFetchingReviews] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Fetch and subscribe to reviews for this product
    setFetchingReviews(true);
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewList: Review[] = [];
      snapshot.forEach((docSnap) => {
        reviewList.push({ id: docSnap.id, ...docSnap.data() } as Review);
      });
      setReviews(reviewList);
      setFetchingReviews(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setFetchingReviews(false);
    });

    return () => unsubscribeReviews();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error("Please login/register to leave a review");
      setIsAuthModalOpen(true);
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment!");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewerName = profile.displayName || user.displayName || user.email?.split('@')[0] || "Verified Customer";
      const reviewerEmail = profile.email || user.email || "email@anonymous.com";

      const reviewData = {
        productId: id,
        rating: newRating,
        comment: newComment.trim(),
        userName: reviewerName,
        userEmail: reviewerEmail,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      toast.success("Thank you for your valuable review!");
      setNewComment("");
      setNewRating(5);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      toast.error(`Failed to post review: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const allReviews = [
    ...reviews,
    ...getProductPresetReviews(id ?? "", product?.name || "Premium Reel Bundle")
  ];

  const writtenReviews = allReviews.filter((rev) => rev.comment && rev.comment.trim() !== "");

  const totalReviews = allReviews.length;
  const averageRating = totalReviews > 0 
    ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "4.8";

  useEffect(() => {
    if (profile && product) {
      setHasPurchased(profile.purchasedProductIds?.includes(product.id) || false);
    }
  }, [profile, product]);

  if (!product) {
    if (productsLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-[10px] uppercase font-black tracking-widest">Verifying Bundle Details...</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
        <p className="text-xs uppercase font-black tracking-widest mb-4">Product Not Found</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handlePurchase = async (activeUser = user) => {
    if (!activeUser) {
      setIsPurchaseModalOpen(true);
      return;
    }

    if (hasPurchased) {
      navigate('/dashboard');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create order on backend
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderAmount: product.price,
          productId: product.id,
          customerId: activeUser.uid,
          customerName: activeUser.displayName || "Customer",
          customerEmail: activeUser.email,
          customerPhone: "9999999999"
        }),
      });

      if (!response.ok) {
        let errorMsg = "Server error";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {
          // If response is not JSON (like a 404 HTML page)
          errorMsg = `Connection failed (Status ${response.status}). If you are on Netlify, please ensure environment variables are set.`;
        }
        throw new Error(errorMsg);
      }

      const orderData = await response.json();
      
      if (!orderData || !orderData.payment_session_id) {
        throw new Error("Invalid response from payment server");
      }

      // 2. Initialize Cashfree SDK with dynamic environment aligned with server-side secrets
      // @ts-ignore
      const cashfree = Cashfree({
        mode: orderData.environment || "sandbox"
      });

      // 3. Trigger Checkout
      await cashfree.checkout({
        paymentSessionId: orderData.payment_session_id,
        returnUrl: `${window.location.origin}/payment-status?order_id=${orderData.order_id}&product_id=${product.id}`,
      });

    } catch (error: any) {
      console.error("Purchase Error:", error);
      toast.error(error.message || "Failed to initiate purchase");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutEmail.trim() || !checkoutName.trim()) {
      toast.error("Please enter both your name and email.");
      return;
    }
    setIsSubmittingCheckoutInfo(true);
    const resolvedEmail = checkoutEmail.trim();
    const resolvedName = checkoutName.trim();
    try {
      const loggedInUser = await manualLogin(resolvedEmail, resolvedName);
      setIsPurchaseModalOpen(false);
      // Directly handle payment flow after login info is stored
      await handlePurchase(loggedInUser);
    } catch (err: any) {
      console.error("Checkout submit error:", err);
      toast.error(err.message || "Checkout failed");
    } finally {
      setIsSubmittingCheckoutInfo(false);
    }
  };

  return (
    <div className="pt-20 pb-16 md:pt-28 md:pb-20 px-4 md:px-6 max-w-7xl mx-auto min-h-screen relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 sm:mb-12 group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="uppercase tracking-widest text-[10px] font-black">Back to Catalogue</span>
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Info & Purchase */}
        <div className="flex flex-col py-2 sm:py-4">
          <div className="inline-flex items-center gap-2 text-primary font-black tracking-widest text-[10px] uppercase mb-3 sm:mb-4">
             <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
             Exclusive Bundle
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase leading-[1.1] sm:leading-none tracking-tighter mb-6 sm:mb-8 break-words">
            {product.name}
          </h1>

          <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-10">
            {product.description}
          </p>

          <div className="bg-white/5 border border-white/10 p-5 sm:p-10 rounded-2xl sm:rounded-[2rem] mb-10">
             <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 sm:mb-6 font-black">Pack Highlights</div>
             <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                {product.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-tight">{detail}</span>
                  </li>
                ))}
             </ul>

             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-white/5">
                <div>
                   <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-black">Instant Access Price</div>
                   <div className="flex items-end gap-3">
                     <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none">{formatPrice(product.price)}</div>
                     <div className="text-lg sm:text-xl font-bold text-slate-500 tracking-tighter line-through mb-0.5 opacity-50">{formatPrice(product.originalPrice)}</div>
                   </div>
                </div>
                
                {hasPurchased ? (
                  <a 
                    href={product.deliveryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-white text-black font-black uppercase text-xs sm:text-sm rounded-xl hover:bg-primary transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Download size={18} />
                    <span>Open Drive Folder</span>
                  </a>
                ) : (
                  <button 
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-primary text-black font-black uppercase text-xs sm:text-sm rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                    ) : (
                      <>
                        <Zap size={18} className="fill-current" />
                        <span>Grab Pack</span>
                      </>
                    )}
                  </button>
                )}
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
             <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-500" />
                Secure Access
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Instant Access
             </div>
          </div>

          {/* Creator Reviews & Experience */}
          <div className="mt-16 sm:mt-24 border-t border-white/10 pt-16">
            <h2 className="text-2xl sm:text-4xl font-black uppercase mb-2 tracking-tighter flex items-center gap-3">
              Creator <span className="text-primary italic">Reviews</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm uppercase tracking-wider font-bold mb-8">
              True feedback from creators who unlocked this exact resource pack
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Stats Summary Panel */}
              <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 rounded-2xl">
                <div className="text-center">
                  <div className="text-5xl font-black text-primary tracking-tighter">{averageRating}</div>
                  <div className="flex justify-center gap-0.5 text-primary my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={16} 
                        className={`fill-current ${s <= Math.round(parseFloat(averageRating)) ? 'text-primary' : 'text-slate-700'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                  <div className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-2">Rating Break Down</div>
                  {[5, 4, 3, 2, 1].map((r) => {
                    const count = allReviews.filter((rev) => rev.rating === r).length;
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={r} className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                        <span className="w-4 font-bold">{r}★</span>
                        <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-6 text-right text-slate-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form & List Feed Panel */}
              <div className="md:col-span-8 space-y-8">
                {/* Submit New Review */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <h3 className="text-xs uppercase font-black tracking-widest text-white mb-2">Leave a Customer Review</h3>
                      
                      {/* Selection Panel */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Select Stars:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setNewRating(s)}
                              className="text-primary hover:scale-110 transition-transform"
                            >
                              <Star 
                                size={20} 
                                className={`fill-current ${s <= newRating ? 'text-primary' : 'text-slate-700'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <textarea
                          placeholder="What did you think of the reels, organization, and download quality of this bundle?"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                          required
                          className="w-full bg-black border border-white/10 rounded-xl p-3.5 text-white text-xs placeholder-white/20 outline-none focus:border-primary transition-all font-bold resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full sm:w-auto px-6 py-3 bg-primary text-black font-black uppercase text-[10px] tracking-wider rounded-xl hover:bg-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmittingReview ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-black border-t-transparent" />
                        ) : (
                          "Post Feedback"
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3">Login to share your review on this bundle</p>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[9px] tracking-widest rounded-lg transition-all"
                      >
                        Sign in to review
                      </button>
                    </div>
                  )}
                </div>

                {/* Reviews Feed Column */}
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">
                    Feed comments ({writtenReviews.length})
                  </div>

                  {fetchingReviews ? (
                    <div className="text-center py-8 text-slate-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto mb-2" />
                      <span className="text-[10px] uppercase font-black tracking-widest">Streaming comments...</span>
                    </div>
                  ) : writtenReviews.length === 0 ? (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center text-slate-500 italic uppercase text-[10px] font-black tracking-widest">
                      No active customer experiences posted yet. Be the first creator!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {writtenReviews.map((rev) => (
                        <div key={rev.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black uppercase">
                                {rev.userName ? rev.userName.charAt(0) : "?"}
                              </div>
                              <div>
                                <div className="font-black text-white text-xs uppercase tracking-tight">{rev.userName}</div>
                                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                                  {rev.userEmail ? `${rev.userEmail.split('@')[0]}... @ Creator` : "Verified Creator"}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-0.5 text-primary">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                  key={s} 
                                  size={12} 
                                  className={`fill-current ${s <= rev.rating ? 'text-primary' : 'text-slate-800'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed font-medium">
                            "{rev.comment}"
                          </p>
                          <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                            Shared on: {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fast checkout info popup */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#151619] border border-white/10 rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
            <button 
              onClick={() => setIsPurchaseModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Secure Purchase Info
            </div>

            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-2">
              Unlock {product.name}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Enter your details below to unlock your pack. This will automatically save your email ID on Firebase and redirect you straight to the secure payment checkout terminal.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Enter Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Your full name"
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-bold placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Enter Gmail ID</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@gmail.com"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-bold placeholder-slate-500"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingCheckoutInfo || isProcessing}
                className="w-full py-4 mt-6 bg-primary text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingCheckoutInfo || isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                ) : (
                  <>
                    <Zap size={14} className="fill-current" />
                    <span>Continue to Payment</span>
                  </>
                )}
              </button>
              <div className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4">
                🔒 Verified and stored on Firebase server node
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
