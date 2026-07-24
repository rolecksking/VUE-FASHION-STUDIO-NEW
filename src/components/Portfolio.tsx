import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CampaignItem, ShowcaseItem } from "../types";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize2, X, Eye } from "lucide-react";

const DEFAULT_PORTFOLIO_ITEMS: CampaignItem[] = [
  {
    id: "camp-01",
    title: "Vivid Fuchsia & Orange",
    category: "Outfits",
    imageUrl: "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg",
    year: "MMXXVI",
    description: "An editorial exploration of saturated color blocking and structured draping. This campaign highlights the high-contrast interaction between vivid fuchsia and orange hues under clinical studio lighting, conveying a minimalist yet audacious architectural silhouetting.",
    showcaseItems: [
      { url: "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg", type: "image" },
      { url: "/src/assets/images/vibrant_blue_yellow_silk_1783498166912.jpg", type: "image" },
      { url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-makeup-41584-large.mp4", type: "video" },
      { url: "/src/assets/images/vibrant_emerald_green_eyewear_1783498183736.jpg", type: "image" }
    ]
  },
  {
    id: "camp-02",
    title: "The Architectural Brim",
    category: "Hats",
    imageUrl: "/src/assets/images/portfolio_hats_1783464917162.jpg",
    year: "MMXXVI",
    description: "Sculptural millinery designed for avant-garde profiles. Each piece is crafted using structural wool felts and high-density polymer matrices to defy gravity, offering dramatic shading lines that transform the wearer's stance.",
    showcaseItems: [
      { url: "/src/assets/images/portfolio_hats_1783464917162.jpg", type: "image" },
      { url: "https://assets.mixkit.co/videos/preview/mixkit-woman-posing-with-a-black-sun-hat-41588-large.mp4", type: "video" },
      { url: "/src/assets/images/vibrant_emerald_green_eyewear_1783498183736.jpg", type: "image" }
    ]
  },
  {
    id: "camp-03",
    title: "Chroma Eyewear Campaign",
    category: "Eyewear",
    imageUrl: "/src/assets/images/vibrant_emerald_green_eyewear_1783498183736.jpg",
    year: "MMXXVI",
    description: "Chromatic spectacles that filter light through high-index tinted crystals. Featuring hand-polished bio-acetates in emerald and deep tortoise, this capsule blends high-tech protection with editorial elegance.",
    showcaseItems: [
      { url: "/src/assets/images/vibrant_emerald_green_eyewear_1783498183736.jpg", type: "image" },
      { url: "https://assets.mixkit.co/videos/preview/mixkit-girl-with-blue-eyeshadow-and-glasses-posing-41585-large.mp4", type: "video" },
      { url: "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg", type: "image" }
    ]
  },
  {
    id: "camp-04",
    title: "Fluid Silk & Yellow Contrast",
    category: "Outfits",
    imageUrl: "/src/assets/images/vibrant_blue_yellow_silk_1783498166912.jpg",
    year: "MMXXVI",
    description: "A delicate dance of lightweight silks interacting with physical airflow. This collection is defined by the high-friction palette of deep royal blues contrasted with energetic primary yellows, generating fluid shapes in constant state of motion.",
    showcaseItems: [
      { url: "/src/assets/images/vibrant_blue_yellow_silk_1783498166912.jpg", type: "image" },
      { url: "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg", type: "image" },
      { url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-makeup-41584-large.mp4", type: "video" }
    ]
  },
  {
    id: "camp-05",
    title: "Monolith Leatherwork",
    category: "Bags",
    imageUrl: "/src/assets/images/portfolio_bags_1783464942217.jpg",
    year: "MMXXVI",
    description: "Brutalist bags constructed from ultra-thick grain leathers and architectural hardware closures. Designed to hold perfect geometry regardless of weight, these pieces represent the intersection of luggage utility and sculpture.",
    showcaseItems: [
      { url: "/src/assets/images/portfolio_bags_1783464942217.jpg", type: "image" },
      { url: "https://assets.mixkit.co/videos/preview/mixkit-woman-posing-with-a-black-sun-hat-41588-large.mp4", type: "video" },
      { url: "/src/assets/images/portfolio_footwear_1783464969159.jpg", type: "image" }
    ]
  },
  {
    id: "camp-06",
    title: "The Sculptured Step",
    category: "Footwear",
    imageUrl: "/src/assets/images/portfolio_footwear_1783464969159.jpg",
    year: "MMXXVI",
    description: "High-concept footwear characterized by architectural heels and premium leather wrapping. Tailored for visual momentum, each heel silhouette is mathematically drafted to provide maximum structural elegance.",
    showcaseItems: [
      { url: "/src/assets/images/portfolio_footwear_1783464969159.jpg", type: "image" },
      { url: "/src/assets/images/portfolio_bags_1783464942217.jpg", type: "image" },
      { url: "https://assets.mixkit.co/videos/preview/mixkit-girl-with-blue-eyeshadow-and-glasses-posing-41585-large.mp4", type: "video" }
    ]
  },
];

type FilterType = "All" | "Hats" | "Outfits" | "Bags" | "More";

interface LazyBlurImageProps {
  src: string;
  alt: string;
  className?: string;
}

function LazyBlurImage({ src, alt, className = "" }: LazyBlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-950">
      <div 
        className={`absolute inset-0 bg-neutral-950 transition-opacity duration-1000 ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100 animate-pulse"
        }`}
      >
        <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-950 filter blur-xl opacity-60" />
      </div>
      
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover object-center transition-all duration-[1200ms] ease-out ${
          isLoaded 
            ? `blur-0 scale-100 opacity-100 ${className}` 
            : "blur-2xl scale-[1.08] opacity-0"
        }`}
      />
    </div>
  );
}

// Interactive custom video player component
function CampaignVideoPlayer({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden group">
      <video
        ref={videoRef}
        src={url}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
      />
      {/* Controls Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
        <button
          onClick={togglePlay}
          className="bg-black/75 hover:bg-white hover:text-black border border-neutral-800 text-white p-2 transition-all duration-300"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={toggleMute}
          className="bg-black/75 hover:bg-white hover:text-black border border-neutral-800 text-white p-2 transition-all duration-300"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
      {/* Small live video badge */}
      <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-2 py-0.5 border border-white/10">
        <span className="font-mono text-[8px] tracking-widest text-white uppercase font-bold">FILM</span>
      </div>
    </div>
  );
}

interface PortfolioProps {
  items?: CampaignItem[];
}

export default function Portfolio({ items }: PortfolioProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const activeItems = items && items.length > 0 ? items : DEFAULT_PORTFOLIO_ITEMS;

  const filteredItems = activeItems.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "More") {
      return ["Eyewear", "Footwear", "Outerwear"].includes(item.category);
    }
    return item.category === activeFilter;
  });

  return (
    <section
      id="portfolio"
      className="bg-black text-white py-32 px-6 sm:px-12 border-b border-neutral-900 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!selectedCampaign ? (
            /* LISTING VIEW */
            <motion.div
              key="listing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div>
                  <span className="font-sans-luxury text-[10px] tracking-[0.4em] uppercase text-neutral-500 block mb-4">
                    Editorial Campaigns
                  </span>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide">
                    Selected Portfolios
                  </h2>
                </div>

                {/* Minimalist Filter Navigation */}
                <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-neutral-900 pb-2 md:pb-4">
                  {(["All", "Hats", "Outfits", "Bags", "More"] as FilterType[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      id={`filter-btn-${filter.toLowerCase()}`}
                      className="relative pb-2 font-sans-luxury text-[10px] tracking-[0.2em] uppercase font-medium transition-colors duration-300 cursor-pointer"
                      style={{ color: activeFilter === filter ? "#FFFFFF" : "#666666" }}
                    >
                      {filter === "More" ? "Accessories & Footwear" : filter}
                      {activeFilter === filter && (
                        <motion.div
                          layoutId="filterUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Layout */}
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 lg:gap-x-12"
              >
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="group cursor-pointer"
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        setSelectedCampaign(item);
                        // Smooth scroll to portfolio section top
                        const el = document.getElementById("portfolio");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      id={`portfolio-item-${item.id}`}
                    >
                      {/* Image Container with Custom Ratio */}
                      <div className="overflow-hidden bg-neutral-950 aspect-[3/4] mb-6 relative border border-neutral-900/30">
                        <LazyBlurImage
                          src={item.imageUrl}
                          alt={item.title}
                          className="group-hover:scale-105 saturate-[1.05]"
                        />
                        {/* Subtle Vibrant Vignette Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none flex items-end justify-between p-6">
                          <span className="text-[10px] text-white tracking-widest font-sans-luxury uppercase flex items-center space-x-1">
                            <span>Browse Campaign</span>
                            <Eye size={12} />
                          </span>
                        </div>

                        {/* Year Indicator on top right */}
                        <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-2.5 py-1 border border-neutral-800/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                          <span className="font-mono text-[9px] tracking-widest text-neutral-400">{item.year}</span>
                        </div>
                      </div>

                      {/* Info Text */}
                      <div className="flex justify-between items-baseline px-1">
                        <div>
                          <span className="font-sans-luxury text-[9px] tracking-[0.2em] text-neutral-500 uppercase block mb-1">
                            {item.category}
                          </span>
                          <h3 className="font-serif-luxury text-lg tracking-wide text-white group-hover:text-neutral-300 transition-colors duration-300 font-light">
                            {item.title}
                          </h3>
                        </div>
                        <span className="font-sans-luxury text-[10px] tracking-[0.1em] text-neutral-600 font-light">
                          0{index + 1}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : (
            /* DETAILED CAMPAIGN VIEW */
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16"
            >
              {/* Back Top Nav Bar */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-6">
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="group flex items-center space-x-3 text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs font-sans-luxury tracking-[0.2em] uppercase font-semibold"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1.5 transition-transform" />
                  <span>Back to Portfolios</span>
                </button>
                <div className="flex items-center space-x-4 font-mono text-[10px] tracking-widest text-neutral-500">
                  <span>{selectedCampaign.category.toUpperCase()}</span>
                  <span>/</span>
                  <span>{selectedCampaign.year}</span>
                </div>
              </div>

              {/* Title & Description Intro */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-500 font-bold block">
                    EDITORIAL STORY
                  </span>
                  <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide text-white leading-tight">
                    {selectedCampaign.title}
                  </h1>
                  <p className="font-sans-luxury text-sm font-light text-neutral-400 leading-relaxed max-w-xl">
                    {selectedCampaign.description || "An immersive couture showcase captured with meticulous attention to form, fabric texture, and advanced studio light calibration. Each frame stands as a testament to the future of high-fashion virtual production."}
                  </p>
                </div>

                <div className="lg:col-span-7 bg-neutral-950 aspect-video overflow-hidden border border-neutral-900/40 relative">
                  <LazyBlurImage
                    src={selectedCampaign.innerImageUrl || selectedCampaign.imageUrl}
                    alt={selectedCampaign.title}
                  />
                </div>
              </div>

              {/* Showcase Media Grid */}
              <div className="space-y-10 pt-10 border-t border-neutral-900">
                <div>
                  <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-neutral-500 block font-bold mb-3">
                    02 / CAMPAIGN GALLERY
                  </span>
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl font-light tracking-wide text-white">
                    Showcase Elements
                  </h2>
                </div>

                {selectedCampaign.showcaseItems && selectedCampaign.showcaseItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedCampaign.showcaseItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-neutral-950 aspect-[3/4] border border-neutral-900 overflow-hidden relative group rounded-sm transition-all duration-500 hover:border-neutral-700"
                      >
                        {item.type === "video" ? (
                          <CampaignVideoPlayer url={item.url} />
                        ) : (
                          <>
                            <LazyBlurImage
                              src={item.url}
                              alt={`${selectedCampaign.title} Showcase ${idx + 1}`}
                            />
                            {/* Hover Enlargement Button Overlay */}
                            <div 
                              onClick={() => setLightboxUrl(item.url)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer"
                            >
                              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Maximize2 size={14} />
                              </div>
                              <span className="text-[9px] font-mono tracking-widest text-neutral-300 uppercase mt-3">Enlarge View</span>
                            </div>
                          </>
                        )}
                        {/* Number Index */}
                        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md border border-neutral-900/60 w-6 h-6 flex items-center justify-center">
                          <span className="font-mono text-[9px] text-neutral-400">0{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback to show covers if no items uploaded */
                  <div className="p-12 border border-dashed border-neutral-900/60 bg-neutral-950/20 text-center space-y-4">
                    <p className="font-sans-luxury text-xs text-neutral-500 uppercase tracking-widest">
                      No multi-media showcase assets loaded for this campaign.
                    </p>
                    <p className="font-sans-luxury text-[11px] text-neutral-600 uppercase tracking-wider">
                      You can upload custom showcase images and videos inside the Studio Portal anytime.
                    </p>
                  </div>
                )}
              </div>

              {/* Next Campaign / Return button */}
              <div className="flex justify-center pt-12 border-t border-neutral-900">
                <button
                  onClick={() => {
                    setSelectedCampaign(null);
                    // Smooth scroll to portfolio section top
                    const el = document.getElementById("portfolio");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-neutral-900 hover:bg-white hover:text-black border border-neutral-800 hover:border-white px-8 py-4 font-sans-luxury text-[10px] tracking-widest uppercase font-semibold transition-all duration-300 cursor-pointer"
                >
                  Return to all campaigns
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxUrl(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 p-2.5 rounded-full transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X size={18} />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden bg-neutral-950 border border-neutral-900"
            >
              <img
                src={lightboxUrl}
                alt="Enlarged Showcase View"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
