import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";

const DEFAULT_HERO_IMAGES = [
  {
    url: "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg",
    alt: "Vue Fashion Studio Editorial Fuchsia Orange Couture",
    title: "Atelier I — Vibrant Color Blocking",
  },
  {
    url: "/src/assets/images/vibrant_blue_yellow_silk_1783498166912.jpg",
    alt: "Vue Fashion Studio Editorial Royal Blue Yellow Silk Gown",
    title: "Atelier II — Fluid Silk & Texture",
  },
  {
    url: "/src/assets/images/vibrant_emerald_green_eyewear_1783498183736.jpg",
    alt: "Vue Fashion Studio Editorial Emerald Green Eyewear",
    title: "Atelier III — Chroma Glass Close-up",
  },
];

interface HeroSliderProps {
  images?: Array<{ url: string; title: string; alt: string }>;
  manifesto?: {
    tagline: string;
    title: string;
    body: string;
    signature: string;
  };
}

export default function HeroSlider({ images, manifesto }: HeroSliderProps) {
  const activeImages = images && images.length > 0 ? images : DEFAULT_HERO_IMAGES;
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeTagline = manifesto?.tagline || "Our Manifesto";
  const activeTitle = manifesto?.title || "The Future of Production";
  const activeBody = manifesto?.body || "We provide end-to-end fashion campaign photography. We handle the casting, set design, and editorial lighting to deliver high-resolution assets indistinguishable from a physical studio production.";
  const activeSignature = manifesto?.signature || "— Paris / Milan / Tokyo / New York";

  useEffect(() => {
    if (currentIndex >= activeImages.length) {
      setCurrentIndex(0);
    }
  }, [activeImages, currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (activeImages.length > 0 ? (prev + 1) % activeImages.length : 0));
    }, 6000);
    return () => clearInterval(timer);
  }, [activeImages]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (activeImages.length > 0 ? (prev - 1 + activeImages.length) % activeImages.length : 0));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (activeImages.length > 0 ? (prev + 1) % activeImages.length : 0));
  };

  if (activeImages.length === 0) return null;

  return (
    <section id="hero" className="relative h-screen w-full bg-black overflow-hidden flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Subtle vignette/shading overlay to ground text */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/75 z-10 pointer-events-none" />
          
          <img
            src={activeImages[currentIndex]?.url}
            alt={activeImages[currentIndex]?.alt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center contrast-[1.02] saturate-[1.1]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Manifesto Overlay Card - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        id="manifesto"
        className="absolute bottom-40 sm:bottom-12 left-6 sm:left-12 lg:left-24 z-20 pointer-events-auto text-left max-w-[320px] sm:max-w-md lg:max-w-lg bg-black/60 backdrop-blur-md border border-white/10 p-5 sm:p-7 rounded-sm shadow-2xl"
      >
        <span className="font-sans-luxury text-[8px] tracking-[0.4em] uppercase text-neutral-400 block mb-2 font-bold">
          {activeTagline}
        </span>
        <h2 className="font-serif-luxury text-base sm:text-lg md:text-xl font-light tracking-wide text-white mb-2 leading-tight uppercase">
          {activeTitle}
        </h2>
        <div className="w-10 h-[1px] bg-neutral-600/60 my-2.5" />
        <p className="font-sans-luxury text-[10px] sm:text-[11px] leading-relaxed text-neutral-300 font-light tracking-wide max-h-[120px] sm:max-h-[160px] overflow-y-auto pr-1">
          {activeBody}
        </p>
        {activeSignature && (
          <span className="font-serif-luxury italic text-[9px] text-neutral-500 mt-3 block">
            {activeSignature}
          </span>
        )}
      </motion.div>

      {/* Extreme Minimal Navigation HUD - Bottom Right */}
      <div className="absolute bottom-12 right-6 sm:right-12 lg:right-24 z-20 flex flex-col items-end space-y-3 pointer-events-auto text-right">
        {/* Dynamic Slide Counter & Arrows */}
        <div className="flex items-center space-x-6 bg-black/60 backdrop-blur-md px-5 py-2.5 border border-neutral-900/50">
          <button
            onClick={handlePrev}
            id="hero-prev-btn"
            className="text-neutral-400 hover:text-white transition-colors duration-300 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft size={14} strokeWidth={1} />
          </button>

          <span id="hero-counter" className="font-sans-luxury text-[10px] tracking-[0.2em] font-light text-neutral-400">
            <span className="text-white">0{currentIndex + 1}</span> / 0{activeImages.length}
          </span>

          <button
            onClick={handleNext}
            id="hero-next-btn"
            className="text-neutral-400 hover:text-white transition-colors duration-300 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight size={14} strokeWidth={1} />
          </button>
        </div>
      </div>

      {/* Bottom subtle scroll-down cue */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-neutral-400 animate-bounce pointer-events-none hidden md:block">
        <ArrowDown size={14} strokeWidth={1} />
      </div>

      {/* Decorative vertical lines to convey high-end design grid */}
      <div className="absolute top-0 bottom-0 left-12 w-[1px] bg-white/5 pointer-events-none hidden lg:block" />
      <div className="absolute top-0 bottom-0 right-12 w-[1px] bg-white/5 pointer-events-none hidden lg:block" />
    </section>
  );
}
