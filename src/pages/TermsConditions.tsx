import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Scale, FileText } from "lucide-react";

export default function TermsConditions() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="min-h-screen pt-28 pb-16 px-6 sm:px-10 max-w-4xl mx-auto"
      id="terms-conditions-container"
    >
      <div className="text-center mb-12">
        <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
          Legal Agreement
        </span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-4 mb-3">
          Terms & <span className="text-primary italic">Conditions</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Last revised: May 21, 2026. Please read this digital license and service agreement carefully.
        </p>
      </div>

      <div className="glass p-6 sm:p-10 rounded-3xl border border-white/5 space-y-8 text-slate-300 leading-relaxed text-sm">
        <section className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Scale size={20} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">1. Agreement to Terms</h2>
          </div>
          <p>
            By accessing or purchasing digital content libraries, bundles, and templates hosted on this website (collectively referred to as "WEBNIXO REEL BUNDLES" or "Services"), you agree to abide by these operating terms of service, laws, regulations, and all compliance norms applicable locally and internationally.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">2. Digital Goods License</h2>
          </div>
          <p>
            Upon successful clearing of invoice/payment, Webnixo Reel Bundles grants you a non-exclusive, non-transferable perpetual personal and commercial media license to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Download and save licensed video clips, audio tracks, and motivational assets.</li>
            <li>Modify, add subtitles, crop, resize and upload clips onto your personal or business Instagram, YouTube Shorts, TikTok and Facebook social dashboards.</li>
            <li>Use the pre-made video templates to build attention retention, grow followers, and secure programmatic revenue.</li>
          </ul>
          <p className="text-slate-400 font-bold mt-2">
            Strict Restrictions: You may NOT resell, sub-license, repackage, distribute to third-party marketplaces, or share raw Google Drive directories directly with other users.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">3. Account Integrity & Custom Uplinks</h2>
          </div>
          <p>
            You are entirely responsible for guarding access credentials. All assets delivered via the secure library screen and email remain under security monitor. Sharing cloud storage keys can lead to automatic token termination to lock down further unauthorized content transfers.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Scale size={20} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">4. Limitation of Liability</h2>
          </div>
          <p>
            In no case shall Webnixo Reel Bundles or its associated engineers, creators, and partners be liable for channel suspension, community guidelines strikes, algorithm organic traffic recessions, or direct damages resulting from your specific use of templates on social programs. You use our viral video presets completely at your own creative discretion.
          </p>
        </section>

        <div className="border-t border-white/5 pt-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
          Copyright © 2026 WEBNIXO REEL BUNDLES. All Rights Reserved.
        </div>
      </div>
    </motion.div>
  );
}
