import React from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactUs() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message received! Our support team will get back to you via email/WhatsApp shortly.");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="min-h-screen pt-28 pb-16 px-6 sm:px-10 max-w-5xl mx-auto flex flex-col justify-center"
      id="contact-page-container"
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-4 mb-3">
          Contact <span className="text-primary italic">Us</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Have queries about the Webnixo Reel Bundles? We offer 24/7 priority assistance to help scale your personal brand or business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-4">
        {/* Contact info cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm uppercase font-black tracking-widest text-white border-b border-white/5 pb-2">
              Support Channels
            </h3>

            <a 
              href="https://wa.me/917676394923?text=Hi%20I%20need%20support%20with%20Webnixo%20Reel%20Bundles"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-300">WhatsApp Chat</div>
                <div className="text-sm font-bold text-white">+91 7676394923</div>
              </div>
            </a>

            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02]">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-primary">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">Email Address</div>
                <div className="text-sm font-semibold text-white">ytshivu8@gmail.com</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02]">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-primary">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">HQ Office</div>
                <div className="text-xs font-semibold text-slate-300 leading-normal">
                  Webnixo Creators Hub, Bengaluru, KA, India.
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Response Guarantee</div>
            <p className="text-xs text-slate-400 font-medium">We usually respond to emails within 2 hours, and WhatsApp chats live within 10 minutes.</p>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="md:col-span-7 glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-base font-black uppercase text-white mb-2 leading-none">Drop Us a message</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Your Full Name</label>
              <input 
                type="text" 
                required
                placeholder="Aman Sharma"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-medium"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Your Email Address</label>
              <input 
                type="email" 
                required
                placeholder="aman@gmail.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Instagram Handle / WhatsApp Number</label>
            <input 
              type="text" 
              placeholder="@aman_creates or +91..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-medium"
            />
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">How can we help you? *</label>
            <textarea 
              rows={4}
              required
              placeholder="Hi, I am interested in custom bundle overrides, pre-purchase doubts, or delivery backup requests..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary font-medium resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-primary hover:bg-white text-black font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/5 mt-2"
          >
            <Send size={14} />
            <span>Send Message</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
}
