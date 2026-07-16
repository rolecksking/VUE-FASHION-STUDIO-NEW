import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Inquiry, ServiceTier } from "../types";
import { saveInquiry } from "../firebase";

interface InquiryFormProps {
  onInquirySubmitted: () => void;
  tiers: ServiceTier[];
  selectedScope: string;
}

export default function InquiryForm({ onInquirySubmitted, tiers, selectedScope }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Outfits",
    scope: "",
    link: "",
    email: "",
  });

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const isEmailValid = isValidEmail(formData.email);

  // Sync selected scope when user clicks a button
  useEffect(() => {
    if (selectedScope) {
      setFormData((prev) => ({ ...prev, scope: selectedScope }));
    }
  }, [selectedScope]);

  // Set default scope on load/tiers update
  useEffect(() => {
    if (tiers && tiers.length > 0 && !formData.scope) {
      setFormData((prev) => ({ ...prev, scope: `${tiers[0].name} - ${tiers[0].tagline}` }));
    }
  }, [tiers]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate fields
    if (!formData.name.trim() || !formData.brand.trim()) {
      setError("Please fulfill all essential brand credentials.");
      return;
    }

    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newInquiry: Inquiry = {
        id: `inq-${Date.now()}`,
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        scope: formData.scope,
        link: formData.link,
        submittedAt: new Date().toLocaleString(),
        email: formData.email.trim(),
      };

      // Save to Firebase Firestore database
      await saveInquiry(newInquiry);

      // Trigger the email engine backend
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newInquiry),
        });
      } catch (emailErr) {
        console.error("Failed to send email via server:", emailErr);
      }

      // Save to localStorage as a fast local fallback
      const existingRaw = localStorage.getItem("vue_studio_inquiries");
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      existingList.unshift(newInquiry);
      localStorage.setItem("vue_studio_inquiries", JSON.stringify(existingList));

      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({
        name: "",
        brand: "",
        category: "Outfits",
        scope: "Atelier II - Signature Campaign",
        link: "",
        email: "",
      });

      // Trigger header notification update
      onInquirySubmitted();
    } catch (err) {
      setIsSubmitting(false);
      setError("Transmission failure. Please re-attempt.");
    }
  };

  return (
    <section
      id="inquire"
      className="bg-black text-white py-32 px-6 sm:px-12 relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header and subtitle */}
        <div className="text-center mb-20">
          <span className="font-sans-luxury text-[10px] tracking-[0.4em] uppercase text-neutral-500 block mb-4">
            Bespoke Inquiries
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-light tracking-wide mb-6">
            Initiate Production
          </h2>
          <p className="font-sans-luxury text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed tracking-wider font-light">
            Contact our Global Atelier to request booking availability. Our team coordinates creative direction, environment layout, and structural fabric scanning.
          </p>
        </div>

        {/* Animate Form Container */}
        <div className="border border-neutral-900 bg-neutral-950/40 p-8 md:p-12 relative max-w-2xl mx-auto">
          
          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                id="contact-form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Error Banner */}
                {error && (
                  <div className="bg-neutral-900/80 border border-neutral-800 text-neutral-300 p-4 text-xs font-sans-luxury tracking-wide flex items-center space-x-2">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Input 1: Client Name */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="name" className="font-sans-luxury text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-medium">
                    Representative Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Christian Dior"
                    className="bg-transparent border-b border-neutral-800 focus:border-white focus:outline-none py-3 text-sm font-sans-luxury font-light text-white tracking-wide transition-colors duration-300"
                  />
                </div>

                {/* Input 2: Brand / Agency */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="brand" className="font-sans-luxury text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-medium">
                    Brand / Agency *
                  </label>
                  <input
                    type="text"
                    id="brand"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Dior Atelier Paris"
                    className="bg-transparent border-b border-neutral-800 focus:border-white focus:outline-none py-3 text-sm font-sans-luxury font-light text-white tracking-wide transition-colors duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Input 3: Product Category Selection */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="category" className="font-sans-luxury text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-medium">
                      Product Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="bg-black border-b border-neutral-800 focus:border-white focus:outline-none py-3 text-sm font-sans-luxury font-light text-white tracking-wide transition-colors duration-300 cursor-pointer appearance-none"
                    >
                      <option value="Hats">Millinery & Hats</option>
                      <option value="Outfits">Ready-To-Wear & Outfits</option>
                      <option value="Bags">Bags & Leather Accessories</option>
                      <option value="Eyewear">Eyewear & Sunglasses</option>
                      <option value="Footwear">Footwear & Boots</option>
                      <option value="Outerwear">Outerwear & Coats</option>
                    </select>
                  </div>

                  {/* Input 4: Project Scope */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="scope" className="font-sans-luxury text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-medium">
                      Project Scope / Volume
                    </label>
                    <select
                      id="scope"
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      className="bg-black border-b border-neutral-800 focus:border-white focus:outline-none py-3 text-sm font-sans-luxury font-light text-white tracking-wide transition-colors duration-300 cursor-pointer appearance-none w-full"
                    >
                      {formData.scope && 
                       !tiers.some(t => `${t.name} - ${t.tagline}` === formData.scope) && 
                       formData.scope !== "Bespoke Custom Partnership" && (
                        <option value={formData.scope}>{formData.scope}</option>
                      )}
                      {tiers.map((tier) => (
                        <option key={tier.id} value={`${tier.name} - ${tier.tagline}`}>
                          {tier.name} — {tier.tagline} ({tier.priceEstimate})
                        </option>
                      ))}
                      <option value="Bespoke Custom Partnership">Bespoke Custom Partnership</option>
                    </select>
                  </div>
                </div>

                {/* Input 5: Link to Product Images */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="link" className="font-sans-luxury text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-medium">
                    Link to Reference Product Images (Optional)
                  </label>
                  <input
                    type="url"
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="e.g. https://dropbox.com/your-collection"
                    className="bg-transparent border-b border-neutral-800 focus:border-white focus:outline-none py-3 text-sm font-sans-luxury font-light text-white tracking-wide transition-colors duration-300"
                  />
                </div>

                {/* Input 6: Required Contact Email Address */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="email" className="font-sans-luxury text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-medium">
                    Contact Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. couture@client.com"
                    className="bg-transparent border-b border-neutral-800 focus:border-white focus:outline-none py-3 text-sm font-sans-luxury font-light text-white tracking-wide transition-colors duration-300"
                  />
                  {!isEmailValid && formData.email.trim().length > 0 && (
                    <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest mt-1">
                      Please enter a valid email address.
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isEmailValid}
                  id="btn-submit-inquiry"
                  className="w-full flex items-center justify-between group bg-white text-black font-sans-luxury text-[11px] tracking-[0.2em] uppercase font-semibold px-6 py-5 transition-all duration-300 hover:bg-neutral-200 mt-12 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{isSubmitting ? "TRANSMITTING TO ATELIER..." : "REQUEST PRODUCTION CONSULTATION"}</span>
                  <Send size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 space-y-6"
              >
                <div className="flex justify-center">
                  <CheckCircle2 size={48} className="text-white" strokeWidth={1} />
                </div>
                <h3 className="font-serif-luxury text-2xl tracking-wider text-white">
                  Consultation Request Logged
                </h3>
                <div className="w-12 h-[1px] bg-neutral-700 mx-auto" />
                <p className="font-sans-luxury text-xs text-neutral-400 leading-relaxed max-w-md mx-auto tracking-widest uppercase">
                  Thank you. Our digital production atelier will review your assets and reply within twelve hours to initiate your bespoke consultation.
                </p>
                
                <button
                  onClick={() => setShowSuccess(false)}
                  id="btn-reset-form"
                  className="mt-8 font-sans-luxury text-[10px] tracking-[0.2em] uppercase text-neutral-500 hover:text-white transition-colors duration-300 border border-neutral-900 px-6 py-3 hover:border-neutral-800"
                >
                  Create Another Inquiry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
