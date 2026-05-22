import React, { useState, useEffect } from "react";
import { useAuth, OperationType, handleFirestoreError } from "../context/AuthContext";
import { PRODUCTS } from "../constants";
import { useProducts } from "../hooks/useProducts";
import { db, auth } from "../lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Save, 
  RefreshCcw, 
  ShieldCheck, 
  LogOut, 
  ShoppingCart, 
  User, 
  Calendar, 
  Search, 
  Key, 
  FileText, 
  Tag, 
  Settings,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Edit,
  Video,
  FolderOpen,
  FileVideo,
  Play
} from "lucide-react";
import toast from "react-hot-toast";
import { getEmbeddableDriveImageUrl, getEmbeddableDriveVideoUrl, getDirectStreamUrl } from "../lib/utils";
import { useSampleReels } from "../hooks/useSampleReels";

interface Order {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  status: string;
  cfOrderId: string;
  createdAt: string;
  userEmail?: string;
  customerName?: string;
}

interface UserData {
  uid: string;
  email: string;
  isAdmin: boolean;
  purchasedProductIds: string[];
}

type AdminTab = 'overview' | 'prices' | 'orders' | 'licenses' | 'samples';

export default function Admin() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('admin_access_session') === '18139649';
  });
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [prices, setPrices] = useState<Record<string, { price: number; originalPrice: number }>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sample reels config states
  const { data: sampleData, updateSampleReels } = useSampleReels();
  const [folderLink, setFolderLink] = useState("");
  const [clips, setClips] = useState<string[]>([""]);

  useEffect(() => {
    if (sampleData) {
      setFolderLink(sampleData.folderLink || "");
      if (Array.isArray(sampleData.clips) && sampleData.clips.length > 0) {
        setClips([...sampleData.clips]);
      } else {
        setClips([""]);
      }
    }
  }, [sampleData]);

  const handleSaveSampleReels = async () => {
    try {
      setSaving(true);
      await updateSampleReels({
        folderLink: folderLink.trim(),
        clips: clips.map(c => c.trim())
      });
      toast.success("Sample Reels configuration updated successfully!");
    } catch (err: any) {
      console.error("Failed to update sample reels:", err);
      toast.error("Failed to update sample reels: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  
  // License Management State
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<UserData | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Dynamic products list from hook
  const { products, loading: productsLoading } = useProducts();

  // Create Bundle (Add Modal) States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBundleId, setNewBundleId] = useState("");
  const [newBundleName, setNewBundleName] = useState("");
  const [newBundlePrice, setNewBundlePrice] = useState("");
  const [newBundleOriginalPrice, setNewBundleOriginalPrice] = useState("");
  const [newBundleDeliveryLink, setNewBundleDeliveryLink] = useState("");
  const [newBundleThumbnail, setNewBundleThumbnail] = useState("");
  const [newBundleDescription, setNewBundleDescription] = useState("");
  const [isSavingNewBundle, setIsSavingNewBundle] = useState(false);

  // Edit Bundle Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editBundleName, setEditBundleName] = useState("");
  const [editBundlePrice, setEditBundlePrice] = useState("");
  const [editBundleOriginalPrice, setEditBundleOriginalPrice] = useState("");
  const [editBundleDeliveryLink, setEditBundleDeliveryLink] = useState("");
  const [editBundleThumbnail, setEditBundleThumbnail] = useState("");
  const [editBundleDescription, setEditBundleDescription] = useState("");
  const [isSavingEditBundle, setIsSavingEditBundle] = useState(false);

  // Stateful confirmations to avoid iframe/window.confirm limitations
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBundleName.trim() || !newBundlePrice || !newBundleOriginalPrice || !newBundleDeliveryLink.trim() || !newBundleThumbnail.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const priceNum = Number(newBundlePrice);
    const originalPriceNum = Number(newBundleOriginalPrice);
    if (isNaN(priceNum) || isNaN(originalPriceNum)) {
      toast.error("Prices must be valid numbers.");
      return;
    }

    setIsSavingNewBundle(true);
    const slug = newBundleId.trim() || newBundleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const bundleData = {
        name: newBundleName.trim(),
        price: priceNum,
        originalPrice: originalPriceNum,
        deliveryLink: newBundleDeliveryLink.trim(),
        thumbnail: getEmbeddableDriveImageUrl(newBundleThumbnail.trim()),
        description: newBundleDescription.trim() || "High quality viral content pack.",
        tags: ["Custom", "New"],
        previews: [],
        details: ["Ready to Upload", "Instant Download", "HD/4K Resolution", "Permanent Access"],
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'custom_packs', slug), bundleData);
      toast.success("New bundle successfully stored on Firebase!");
      
      // Reset form
      setNewBundleId("");
      setNewBundleName("");
      setNewBundlePrice("");
      setNewBundleOriginalPrice("");
      setNewBundleDeliveryLink("");
      setNewBundleThumbnail("");
      setNewBundleDescription("");
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Error creating bundle in Firebase:", err);
      toast.error(err.message || "Failed to create bundle");
    } finally {
      setIsSavingNewBundle(false);
    }
  };

  const handleOpenEditModal = (product: any) => {
    setSelectedProduct(product);
    setEditBundleName(product.name);
    setEditBundlePrice(product.price.toString());
    setEditBundleOriginalPrice(product.originalPrice.toString());
    setEditBundleDeliveryLink(product.deliveryLink || "");
    setEditBundleThumbnail(product.thumbnail || "");
    setEditBundleDescription(product.description || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEditBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!editBundleName.trim() || !editBundlePrice || !editBundleOriginalPrice) {
      toast.error("Name and prices and are required.");
      return;
    }

    const priceNum = Number(editBundlePrice);
    const originalPriceNum = Number(editBundleOriginalPrice);
    if (isNaN(priceNum) || isNaN(originalPriceNum)) {
      toast.error("Prices must be valid numbers.");
      return;
    }

    setIsSavingEditBundle(true);
    const isDefaultProduct = PRODUCTS.some(p => p.id === selectedProduct.id);

    try {
      if (isDefaultProduct) {
        // For default PRODUCTS (e.g. static ones), store overrides in pricing_overrides, including name!
        const payload = {
          name: editBundleName.trim(),
          price: priceNum,
          originalPrice: originalPriceNum,
          deliveryLink: editBundleDeliveryLink.trim() || selectedProduct.deliveryLink,
          thumbnail: getEmbeddableDriveImageUrl(editBundleThumbnail.trim() || selectedProduct.thumbnail),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'pricing_overrides', selectedProduct.id), payload, { merge: true });
        toast.success("Name and details updated on Firebase!");
      } else {
        // Direct modification of custom pack
        const payload = {
          name: editBundleName.trim(),
          price: priceNum,
          originalPrice: originalPriceNum,
          deliveryLink: editBundleDeliveryLink.trim(),
          thumbnail: getEmbeddableDriveImageUrl(editBundleThumbnail.trim()),
          description: editBundleDescription.trim(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'custom_packs', selectedProduct.id), payload, { merge: true });
        toast.success("Custom bundle successfully updated on Firebase!");
      }
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    } catch (err: any) {
      console.error("Error saving edits inside database:", err);
      toast.error(err.message || "Failed to save changes");
    } finally {
      setIsSavingEditBundle(false);
    }
  };

  const handleDeleteCustomPack = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'custom_packs', id));
      toast.success("Custom pack successfully deleted from Firebase!");
    } catch (err: any) {
      console.error("Delete call failed:", err);
      toast.error("Failed to delete custom pack: " + err.message);
    }
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (adminKeyInput === '18139649') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('admin_access_session', '18139649');
      toast.success("Admin Access Granted");
    } else {
      toast.error("Invalid Admin Key");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_access_session');
    toast.success("Session Terminated");
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success("Pending order successfully removed!");
      if (confirmDeleteId === orderId) {
        setConfirmDeleteId(null);
      }
    } catch (err: any) {
      console.error("Delete order failed:", err);
      toast.error("Failed to delete order: " + err.message);
    }
  };

  useEffect(() => {
    // Faster fail-safe: stop loading after 3 seconds as we have cache now
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    let unsubscribe: (() => void) | undefined;

    if (isAdminAuthenticated) {
      fetchPrices();
      
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
      unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
        const orderList: Order[] = [];
        snapshot.forEach((doc) => {
          orderList.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(orderList);
        
        // Only stop loading if we have data from server or if we wait too long
        if (!snapshot.metadata.fromCache || orderList.length > 0) {
          setLoading(false);
        }
      }, (error) => {
        console.error("Orders Snapshot error:", error);
        setLoading(false);
      });
    } else {
      setOrders([]);
      setLoading(false);
      clearTimeout(timeout);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timeout);
    };
  }, [isAdminAuthenticated]);

  const fetchPrices = async () => {
    setLoading(true);
    // Always start with default prices
    const priceMap: Record<string, { price: number; originalPrice: number }> = {};
    PRODUCTS.forEach(p => {
      priceMap[p.id] = { price: p.price, originalPrice: p.originalPrice };
    });
    
    try {
      const fetchPromise = getDocs(collection(db, 'pricing_overrides'));
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout waiting for database")), 3000)
      );

      const querySnapshot = await Promise.race([fetchPromise, timeoutPromise]).catch(err => {
        console.warn("Pricing fetch failed or timed out, using defaults:", err.message || err);
        return null;
      });

      if (querySnapshot) {
        querySnapshot.forEach((doc) => {
          const row = doc.data();
          if (priceMap[doc.id]) {
            priceMap[doc.id] = {
              price: typeof row.price === 'number' ? row.price : priceMap[doc.id].price,
              originalPrice: typeof row.originalPrice === 'number' ? row.originalPrice : priceMap[doc.id].originalPrice
            };
          }
        });
      }

      setPrices(priceMap);
    } catch (error) {
      console.error("General pricing fetch error:", error);
      setPrices(priceMap); // Ensure we have something
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (id: string, field: 'price' | 'originalPrice', value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    if (isNaN(numValue)) return;
    
    setPrices(prev => {
      const current = prev[id] || PRODUCTS.find(p => p.id === id) || { price: 0, originalPrice: 0 };
      return {
        ...prev,
        [id]: {
          ...current,
          [field]: numValue
        }
      };
    });
  };

  const savePrices = async () => {
    if (Object.keys(prices).length === 0) {
      toast.error("No items to sync");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Syncing prices with database...");
    
    try {
      const promises = Object.entries(prices).map(([id, data]) => {
        // Strict validation for Firestore
        const price = Number(data.price);
        const originalPrice = Number(data.originalPrice);
        
        if (isNaN(price) || isNaN(originalPrice)) {
          throw new Error(`Invalid numeric value for ${id}`);
        }

        const payload = {
          price: price,
          originalPrice: originalPrice,
          updatedAt: new Date().toISOString()
        };

        return setDoc(doc(db, 'pricing_overrides', id), payload, { merge: true });
      });

      // Race with an 8-second timeout to handle offline/permissions elegantly
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Database write timed out. This usually means your account lacks database write access in the Firestore Rules.")), 8000)
      );

      await Promise.race([Promise.all(promises), timeoutPromise]);
      toast.success("Database records updated successfully", { id: toastId });
    } catch (error: any) {
      console.error("Critical Save Error:", error);
      
      let errorMsg = "Cloud sync failed";
      if (error.message && error.message.includes("timed out")) {
        errorMsg = error.message;
      } else if (error.code === 'permission-denied') {
        errorMsg = "Access Denied: Write permission denied under current database rules.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg, { id: toastId });
      handleFirestoreError(error, OperationType.WRITE, "pricing_overrides");
    } finally {
      setSaving(false);
    }
  };

  // License Management Actions
  const searchUser = async () => {
    if (!searchEmail) return;
    setIsSearching(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setFoundUser(null);
        toast.error("User not found");
      } else {
        setFoundUser({ uid: snap.docs[0].id, ...snap.docs[0].data() } as UserData);
      }
    } catch (err) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const grantAccess = async (productId: string) => {
    if (!foundUser) return;
    try {
      const userRef = doc(db, 'users', foundUser.uid);
      await updateDoc(userRef, {
        purchasedProductIds: arrayUnion(productId)
      });
      setFoundUser(prev => prev ? {
        ...prev,
        purchasedProductIds: [...prev.purchasedProductIds, productId]
      } : null);
      toast.success(`Granted access to ${productId}`);
    } catch (err) {
      toast.error("Grant failed");
    }
  };

  const revokeAccess = async (productId: string) => {
    if (!foundUser) return;
    try {
      const userRef = doc(db, 'users', foundUser.uid);
      await updateDoc(userRef, {
        purchasedProductIds: arrayRemove(productId)
      });
      setFoundUser(prev => prev ? {
        ...prev,
        purchasedProductIds: prev.purchasedProductIds.filter(id => id !== productId)
      } : null);
      toast.success(`Revoked access to ${productId}`);
    } catch (err) {
      toast.error("Revoke failed");
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="pt-32 pb-20 px-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl"
        >
          <Key size={48} className="text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-black uppercase mb-2 tracking-tighter text-white">Admin Access</h1>
          <p className="text-slate-500 mb-8 uppercase text-[10px] font-bold tracking-widest leading-relaxed">
            Enter private override key to access secure records
          </p>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input 
              type="password"
              placeholder="••••••••"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-center text-white font-black tracking-[0.5em] focus:border-primary outline-none transition-all placeholder:tracking-normal placeholder:font-bold placeholder:text-slate-700"
            />
            <button 
              type="submit"
              className="w-full py-5 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-primary transition-all shadow-lg shadow-white/5 active:scale-95"
            >
              Verify Identity
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
           <div className="inline-flex items-center gap-2 text-primary font-black tracking-widest text-[10px] uppercase mb-4">
              <ShieldCheck size={14} />
              SYSTEM OVERRIDE
           </div>
           <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">Admin <span className="text-primary not-italic">CMD</span></h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <button 
            onClick={fetchPrices}
            className="px-6 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            Sync
          </button>
          
          <button 
            onClick={handleAdminLogout}
            className="px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-[10px] rounded-xl flex items-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
          >
            <LogOut size={14} />
            Terminate
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'prices', label: 'Pricing & Bundles', icon: Tag },
          { id: 'orders', label: 'Sales Feed', icon: ShoppingCart },
          { id: 'licenses', label: 'License Desk', icon: Key },
          { id: 'samples', label: 'Sample Reels', icon: Video },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-6 py-4 font-black uppercase text-[10px] tracking-widest whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id 
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading && activeTab !== 'overview' && (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <RefreshCcw className="animate-spin text-primary" size={40} />
          <p className="text-slate-500 uppercase font-black text-[10px] tracking-widest italic">Updating secure records...</p>
        </div>
      )}

      {/* Tab Content */}
      <div className={loading && activeTab !== 'overview' ? "hidden" : "min-h-[400px]"}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard label="Total Revenue" value={`₹${orders.filter(o => o.status === 'SUCCESS' || o.status === 'completed').reduce((acc, current) => acc + current.amount, 0)}`} icon={ShoppingCart} color="text-green-400" />
              <StatCard label="Total Orders" value={orders.length.toString()} icon={FileText} color="text-blue-400" />
              <StatCard label="Active Bundles" value={products.length.toString()} icon={Tag} color="text-primary" />
              <StatCard label="Server Status" value="Online" icon={ShieldCheck} color="text-emerald-400" />
              
              <div className="md:col-span-2 lg:col-span-4 mt-8 bg-white/5 border border-white/10 p-8 rounded-3xl">
                <h3 className="text-xl font-black uppercase mb-4 tracking-tight">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('orders')} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left">
                    <ShoppingCart className="text-primary mb-2" size={20} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Review Sales</p>
                  </button>
                  <button onClick={() => setActiveTab('prices')} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left">
                    <Tag className="text-primary mb-2" size={20} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Adjust Prices</p>
                  </button>
                  <button onClick={() => setActiveTab('licenses')} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left">
                    <Key className="text-primary mb-2" size={20} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Grant Access</p>
                  </button>
                  <button className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left opacity-50 cursor-not-allowed">
                    <Settings className="text-slate-500 mb-2" size={20} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Global Settings</p>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'prices' && (
            <motion.div 
              key="prices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Manage Bundles & Pricing</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configure and add custom Webnixo Reel Bundles</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-4 bg-primary text-black font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg shadow-primary/10"
                >
                  <Plus size={16} />
                  <span>Add New Bundle</span>
                </button>
              </div>

              {productsLoading ? (
                <div className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                  Loading bundles...
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map(product => {
                    const isDefault = PRODUCTS.some(p => p.id === product.id);
                    return (
                      <div 
                        key={product.id}
                        className="bg-[#151619] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 hover:border-white/20 transition-all shadow-xl"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-900">
                          <img src={product.thumbnail} className="w-full h-full object-cover" alt={product.name} />
                        </div>
                        
                        <div className="flex-grow text-center md:text-left space-y-1">
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${
                              isDefault ? 'bg-white/10 text-slate-300' : 'bg-primary/20 text-primary border border-primary/20'
                            }`}>
                              {isDefault ? 'Default Pack' : 'Custom Upload'}
                            </span>
                            <span className="text-slate-500 text-xs font-mono font-bold">ID: {product.id}</span>
                          </div>
                          <h3 className="text-base font-black uppercase text-white tracking-tight">{product.name}</h3>
                          <p className="text-slate-500 text-xs line-clamp-1 max-w-xl">{product.description}</p>
                        </div>

                        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 w-full md:w-auto shrink-0 justify-center md:justify-end">
                          <div className="text-center md:text-right">
                            <div className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Pricing</div>
                            <div className="text-sm font-black text-white">
                              ₹{product.price}{' '}
                              <span className="text-xs text-slate-600 line-through font-bold">
                                ₹{product.originalPrice}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenEditModal(product)}
                              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase text-[10px] flex items-center gap-2 hover:bg-white hover:text-black transition-all"
                            >
                              <Edit size={12} />
                              <span>Edit Pack</span>
                            </button>

                            {!isDefault && (
                              <button 
                                onClick={() => handleDeleteCustomPack(product.id, product.name)}
                                className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                title="Delete Custom Pack"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="text-lg font-black uppercase tracking-tight">Recent Transactions</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Feed Active
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-black/50 text-[9px] uppercase tracking-widest font-black text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Bundle</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-white/5">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-500 uppercase font-bold tracking-widest italic">
                            No transaction records found in the current buffer.
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                order.status === 'SUCCESS' || order.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {order.status === 'SUCCESS' || order.status === 'completed' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary">
                                  <User size={12} />
                                </div>
                                <span className="font-bold">{order.userEmail || order.customerName || 'Anonymous'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 uppercase font-black tracking-tight text-slate-400">{order.productId}</td>
                            <td className="px-6 py-4 font-black">₹{order.amount}</td>
                            <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                              {/* Option to delete pending style transactions */}
                              {order.status === 'pending' ? (
                                confirmDeleteId === order.id ? (
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <button
                                      onClick={() => handleDeleteOrder(order.id)}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase tracking-widest text-white rounded-md transition-all inline-flex items-center gap-1 cursor-pointer"
                                      title="Confirm Permanent Deletion"
                                    >
                                      <Trash2 size={10} />
                                      <span>Sure?</span>
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-1.5 py-1 bg-white/5 hover:bg-white/15 text-[10px] font-black uppercase tracking-widest text-slate-300 rounded-md transition-all inline-flex items-center justify-center cursor-pointer"
                                      title="Cancel"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDeleteId(order.id)}
                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/25 text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-500/20 rounded-md transition-all inline-flex items-center gap-1 cursor-pointer"
                                    title="Delete Pending Transaction"
                                  >
                                    <Trash2 size={10} />
                                    <span>Delete</span>
                                  </button>
                                )
                              ) : (
                                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'licenses' && (
            <motion.div 
              key="licenses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl space-y-8"
            >
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <h2 className="text-xl font-black uppercase mb-6 tracking-tight flex items-center gap-2">
                  <Search size={18} className="text-primary" />
                  User Search
                </h2>
                <div className="flex gap-4">
                  <div className="relative flex-grow">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="email"
                      placeholder="customer@email.com"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                      className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold text-sm outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <button 
                    onClick={searchUser}
                    disabled={isSearching}
                    className="px-8 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-primary transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSearching ? <RefreshCcw size={14} className="animate-spin" /> : <Search size={14} />}
                    Scan
                  </button>
                </div>
              </div>

              {foundUser && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
                >
                  <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight">{foundUser.email}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">UID: {foundUser.uid}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${foundUser.isAdmin ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border border-white/5'}`}>
                      {foundUser.isAdmin ? 'Admin' : 'Customer'}
                    </div>
                  </div>
                  
                  <div className="p-8 bg-black/20">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                      <ShoppingCart size={14} />
                      Inventory Control
                    </h4>
                    
                    <div className="grid gap-3">
                      {products.map(product => {
                        const hasAccess = foundUser.purchasedProductIds.includes(product.id);
                        return (
                          <div key={product.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${hasAccess ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-700'}`} />
                              <div>
                                <p className="text-xs font-black uppercase tracking-tight">{product.name}</p>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{product.id}</p>
                              </div>
                            </div>
                            
                            {hasAccess ? (
                              <button 
                                onClick={() => revokeAccess(product.id)}
                                className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => grantAccess(product.id)}
                                className="flex items-center gap-2 px-6 py-3 bg-primary/20 text-primary rounded-xl border border-primary/30 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-black font-black uppercase text-[10px]"
                              >
                                <Plus size={14} />
                                Grant
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'samples' && (
            <motion.div 
              key="samples"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl space-y-8"
            >
              <div className="bg-[#151619] border border-white/10 p-8 rounded-3xl space-y-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Sample Clips & Folder Link</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configure live previews showcased on the homepage</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Master Sample Drive Folder Link</label>
                    <div className="relative">
                      <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="url"
                        placeholder="https://drive.google.com/drive/folders/..."
                        value={folderLink}
                        onChange={(e) => setFolderLink(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold tracking-wide pl-1">
                      Direct Google Drive folders containing raw download samples
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-300">Individual Video Clip URLs (Drive file links)</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setClips([
                            "https://drive.google.com/file/d/11ZlHoUb8efxEwYgHxg6D0O77FUSz7MmE/view?usp=sharing",
                            "https://drive.google.com/file/d/14aOMFg6lr0SG2RHwLtbw5y6hSez0tK4o/view?usp=sharing",
                            "https://drive.google.com/file/d/1JdExnNMflWdZO7BSIASNBSyLMA59E8om/view?usp=sharing",
                            "https://drive.google.com/file/d/1O-fG1ZQ8g-vg_xSLffcmbUEn1k9NoSD_/view?usp=sharing"
                          ])}
                          className="py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-black uppercase text-[9px] tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RefreshCcw size={11} className="text-primary animate-spin-slow" />
                          <span>Load Demo Samples</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setClips([...clips, ""])}
                          className="py-1.5 px-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-black uppercase text-[9px] tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>Add New Clip Slot</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid gap-3.5">
                      {clips.map((clipVal, idx) => (
                        <div key={idx} className="space-y-1 bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">
                              Preview Clip 0{idx + 1}
                            </label>
                            {clips.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = clips.filter((_, i) => i !== idx);
                                  setClips(updated);
                                }}
                                className="text-[9px] text-red-500 font-bold uppercase tracking-widest hover:text-red-400 transition-colors flex items-center gap-1"
                              >
                                <span>Delete Clip</span>
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input 
                              type="url"
                              placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                              value={clipVal}
                              onChange={(e) => {
                                const updatedClips = [...clips];
                                updatedClips[idx] = e.target.value;
                                setClips(updatedClips);
                              }}
                              className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white font-bold text-xs outline-none focus:border-primary transition-all font-mono"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest text-center sm:text-left">
                      Ensure your drive links are shared with <span className="text-primary font-black">"Anyone with the link can view"</span>
                    </p>
                    <button
                      onClick={handleSaveSampleReels}
                      disabled={saving}
                      className="px-8 py-4 bg-primary text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all shadow-lg shadow-primary/10 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <Save size={14} />
                      <span>{saving ? "Saving in Firebase..." : "Save Configuration"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Real-Time Preview in Admin Section */}
              <div className="bg-[#151619] border border-white/10 p-8 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tighter">Live Player Sandbox</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Verify that your custom clips render and play correctly on touch devices</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {clips.map((clipVal, idx) => {
                    const streamUrl = getDirectStreamUrl(clipVal);
                    const embedUrl = getEmbeddableDriveVideoUrl(clipVal);
                    
                    return (
                      <div key={idx} className="flex flex-col gap-2 bg-[#1b1c21]/30 p-3 rounded-2xl border border-white/[0.03]">
                        <div className="aspect-[9/16] w-[135px] h-[240px] bg-black border border-white/10 rounded-xl overflow-hidden relative shadow-inner mx-auto shrink-0 self-center">
                          {clipVal.trim() && (streamUrl || embedUrl) ? (
                            <video 
                              src={streamUrl}
                              className="absolute inset-0 w-full h-full object-cover bg-black rounded-xl block"
                              controls
                              playsInline
                              preload="metadata"
                              poster=""
                              onError={(e) => {
                                // fallback safely to standard iframe preview if local stream blockages occur
                                const target = e.currentTarget;
                                const iframe = document.createElement("iframe");
                                iframe.src = embedUrl;
                                iframe.className = "absolute inset-0 w-full h-full border-0 bg-black rounded-xl block";
                                iframe.allow = "autoplay; encrypted-media; fullscreen";
                                iframe.allowFullscreen = true;
                                if (target.parentNode) {
                                  target.parentNode.replaceChild(iframe, target);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-2 text-center">
                              <FileVideo size={20} className="mb-1.5" />
                              <span className="text-[8px] uppercase font-black tracking-widest">Awaiting Link</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center space-y-1">
                          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block font-mono">Clip 0{idx + 1} Preview</span>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.05em] leading-none">HD Object Contain</p>
                          {clipVal.trim() && (
                            <a 
                              href={clipVal}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[8px] uppercase font-black tracking-wider text-primary hover:underline inline-flex items-center gap-1 pt-0.5"
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create New Bundle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#151619] border border-white/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl my-8">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-2">Create New Bundle</h3>
            <p className="text-slate-500 text-xs mb-6">Create a dynamic custom pack in the Firestore database instantly.</p>
            
            <form onSubmit={handleAddBundle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Bundle ID (Slug)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. customized-pack"
                    value={newBundleId}
                    onChange={(e) => setNewBundleId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Bundle Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Alpha Motivation"
                    value={newBundleName}
                    onChange={(e) => setNewBundleName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Sale Price (INR) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="299"
                    value={newBundlePrice}
                    onChange={(e) => setNewBundlePrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Original Price (INR) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="999"
                    value={newBundleOriginalPrice}
                    onChange={(e) => setNewBundleOriginalPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Google Drive Link *</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://drive.google.com/..."
                  value={newBundleDeliveryLink}
                  onChange={(e) => setNewBundleDeliveryLink(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Image / Thumbnail URL *</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://lh3.googleusercontent.com/..."
                  value={newBundleThumbnail}
                  onChange={(e) => setNewBundleThumbnail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Short Description</label>
                <textarea 
                  rows={2}
                  placeholder="Viral motivation bundle for creators."
                  value={newBundleDescription}
                  onChange={(e) => setNewBundleDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold placeholder-slate-600 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 text-white font-black uppercase text-xs rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSavingNewBundle}
                  className="flex-1 py-4 bg-primary text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all disabled:opacity-50"
                >
                  {isSavingNewBundle ? "Storing in Firebase..." : "Save Bundle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Existing Bundle Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#151619] border border-white/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl my-8">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedProduct(null);
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-2">Edit {selectedProduct.name}</h3>
            <p className="text-slate-500 text-xs mb-6">Modify details. Submitting saves overrides or updates database directly.</p>
            
            <form onSubmit={handleSaveEditBundle} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Bundle Name</label>
                <input 
                  type="text" 
                  required
                  value={editBundleName}
                  onChange={(e) => setEditBundleName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Sale Price (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={editBundlePrice}
                    onChange={(e) => setEditBundlePrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Original Price (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={editBundleOriginalPrice}
                    onChange={(e) => setEditBundleOriginalPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Google Drive Link</label>
                <input 
                  type="url" 
                  value={editBundleDeliveryLink}
                  onChange={(e) => setEditBundleDeliveryLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Image / Thumbnail URL</label>
                <input 
                  type="url" 
                  value={editBundleThumbnail}
                  onChange={(e) => setEditBundleThumbnail(e.target.value)}
                  placeholder="https://lh3.googleusercontent.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold"
                />
              </div>

              {!PRODUCTS.some(p => p.id === selectedProduct.id) && (
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Short Description</label>
                  <textarea 
                    rows={2}
                    value={editBundleDescription}
                    onChange={(e) => setEditBundleDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-bold resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-4 bg-white/5 text-white font-black uppercase text-xs rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSavingEditBundle}
                  className="flex-1 py-4 bg-primary text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all disabled:opacity-50"
                >
                  {isSavingEditBundle ? "Saving in Firebase..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
      <div className={`absolute -right-4 -bottom-4 ${color} opacity-5 group-hover:opacity-10 transition-all`}>
        <Icon size={120} />
      </div>
      <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] mb-4">{label}</p>
      <p className={`text-4xl font-black uppercase tracking-tight ${color}`}>{value}</p>
      <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-wider">
        <div className={`w-1.5 h-1.5 rounded-full bg-primary animate-pulse`} />
        Live Updated
      </div>
    </div>
  );
}
