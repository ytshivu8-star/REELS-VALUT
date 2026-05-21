import React from "react";
import { motion } from "motion/react";
import { AlertCircle, RotateCcw, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function RefundsCancellations() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="min-h-screen pt-28 pb-16 px-6 sm:px-10 max-w-4xl mx-auto"
      id="refunds-cancellations-container"
    >
      <div className="text-center mb-12">
        <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
          Refund Policy
        </span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-4 mb-3">
          Refunds & <span className="text-primary italic">Cancellations</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Last revised: May 21, 2026. Please read our operational policy regarding digital items carefully.
        </p>
      </div>

      <div className="glass p-6 sm:p-10 rounded-3xl border border-white/5 space-y-8 text-slate-300 leading-relaxed text-sm">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex gap-4 text-yellow-300">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-black uppercase text-xs tracking-wider mb-1">Important Highlight about Digital Assets</h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Because digital assets (Google Drive bundles of files containing downloadable MP4 clips) can be duplicated with permanent access instantly upon receipt, our default refund program is highly structured.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <RotateCcw size={20} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">1. Immediate Access / No Refunds Policy</h2>
          </div>
          <p>
            Once payment is cleared and delivery links are unlocked inside your creator dashboard and email account, we generally do not offer manual or automatic general refunds. We encourage inspecting preview clips, reading product descriptors, asking pre-sale inquiries on support chats, and checking review breakdowns before pulling the trigger.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <HelpCircle size={20} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">2. Special Assistance & File Restoration</h2>
          </div>
          <p>
            If the Google Drive delivery link becomes broken, unshared, or locked from your local account:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>You can immediately request new server links or backup folders within 365 days of purchasing.</li>
            <li>If files fail to load properly or are formatted incorrectly on your current device, our design staff will guide you through or manually transfer custom clips to your specific backup drive.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <AlertCircle size={20} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">3. Erroneous / Double Payments</h2>
          </div>
          <p>
            In any scenario where money is deducted multiple times due to a gateway error, double-clicks, or slow internet, the redundant invoice counts are flagged automatically. We issue 100% cashback refunds for double transactions immediately after verification. Just get in touch with our active WhatsApp dispatch immediately.
          </p>
        </section>

        <div className="border-t border-white/5 pt-6 text-center space-y-3">
          <p className="text-xs text-slate-500 font-black uppercase tracking-widest">
            Need support processing refunds or restoring links?
          </p>
          <Link 
            to="/contact-us"
            className="inline-block px-6 py-3 bg-primary text-black font-black uppercase text-[10px] rounded-xl hover:bg-white transition-all"
          >
            Go to Contact Center
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
