import React, { useState } from "react";
import { motion } from "motion/react";
import { Download, CheckCircle, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { AssetSpecItem, PreProductionConfig } from "../types";

interface AssetSpecsProps {
  preProductionConfig?: PreProductionConfig;
}

export default function AssetSpecs({ preProductionConfig }: AssetSpecsProps) {
  const [downloading, setDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const config = preProductionConfig || {
    subtitle: "03 / PRE-PRODUCTION PREPARATION",
    title: "The Production Brief: Preparing Your Assets",
    introText: "To create a hyper-realistic digital twin of your collection that behaves exactly like real fabric, we require standard product references. We handle the technical heavy lifting, but the foundation starts with your vision and your product.",
    steps: [
      {
        id: "step-1",
        title: "Product Reference Guidelines",
        description: "Clear, high-resolution product photography captured from standard angles (Front, Back, and profile Sides). Flat-lays, ghost mannequins, or current on-model reference frames are perfect."
      },
      {
        id: "step-2",
        title: "Texture & Material Accuracy",
        description: "Ensure reference images are captured under neutral, shadowless day-lighting. This permits our laboratory scanners to calibrate the precise sheen, roughness, and color values of the textile weave."
      },
      {
        id: "step-3",
        title: "Product Submission Standards",
        description: "Close-up macro photography of specific hardware detailing (zippers, metallic buckles, engraved buttons, rivets) and fabric closeups to capture the tactile grain of knits, leathers, or silk fibers."
      }
    ],
    images: [
      "/src/assets/images/portfolio_bags_1783464942217.jpg",
      "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg",
      "/src/assets/images/vibrant_emerald_green_eyewear_1783498183736.jpg"
    ],
    calibrationQuote: "To ensure our editorial renders are indistinguishable from reality, our studio conducts a meticulous calibration of your fabric and form. High-quality inputs are the foundation of world-class production.",
    calibrationAuthor: "— Atelier Director, VUE Studio"
  };

  const images = config.images && config.images.length > 0 ? config.images : [
    "/src/assets/images/portfolio_bags_1783464942217.jpg",
    "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg",
    "/src/assets/images/vibrant_emerald_green_eyewear_1783498183736.jpg"
  ];

  const triggerDownload = async () => {
    setDownloading(true);

    if (config.downloadBriefUrl) {
      try {
        const response = await fetch(config.downloadBriefUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        
        let filename = config.downloadBriefFilename || "Vue_Fashion_Studio_Asset_Brief";
        if (!filename.includes(".")) {
          const mimeType = blob.type;
          if (mimeType.includes("pdf")) {
            filename += ".pdf";
          } else if (mimeType.includes("png")) {
            filename += ".png";
          } else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
            filename += ".jpg";
          } else if (mimeType.includes("webp")) {
            filename += ".webp";
          } else {
            const cleanUrl = config.downloadBriefUrl.split("?")[0];
            const ext = cleanUrl.split(".").pop();
            if (ext && ext.length <= 4) {
              filename += `.${ext}`;
            } else {
              filename += ".pdf";
            }
          }
        }

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        setDownloading(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        return;
      } catch (err) {
        console.warn("Direct blob download failed, falling back to direct navigation/opening:", err);
        const link = document.createElement("a");
        link.href = config.downloadBriefUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = config.downloadBriefFilename || "Vue_Fashion_Studio_Asset_Brief";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloading(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        return;
      }
    }

    // Dynamic high-fidelity technical brief document content for the downloadable TXT file
    const technicalBriefText = `====================================================================
               V U E   F A S H I O N   S T U D I O
             COMPLETE PRE-PRODUCTION TECHNICAL BRIEF
                        VERSION MMXXVI.I
====================================================================

Dear Creative Partner,

To deliver campaign assets that are indistinguishable from high-end
physical photography, our technical atelier conducts a meticulous
calibration of your fabric and form. 

--------------------------------------------------------------------
SECTION 01: ${config.title.toUpperCase()}
--------------------------------------------------------------------
${config.introText}

--------------------------------------------------------------------
SECTION 02: PRODUCTION PREPARATION STEPS
--------------------------------------------------------------------
${config.steps.map((s, i) => `${i + 1}. ${s.title.toUpperCase()}\n   ${s.description}`).join("\n\n")}

--------------------------------------------------------------------
SECTION 03: TECHNICAL DATA & CAMERA STANDARDS
--------------------------------------------------------------------
- Essential Angles: Front, Back, Left Profile, Right Profile (Flat & On-Model)
- Lighting Setup: Flat, shadowless, daylight balanced (5600K / D56 CRI 98+)
- Macro/Detail Close-ups: Mandatory for zippers, hardware, stitching threads,
  interior branding tags, and pocket profiles.
- Color Matching Calibration: Include a standard Macbeth ColorChecker passport
  within at least 3 master keyframes.
- Physical Material Swatch: We highly recommend courier delivery of a 10x10cm
  physical fabric swatch for physical haptic scanner calibration.

--------------------------------------------------------------------
SECTION 04: TEXTURE & MATERIAL ACCURACY (PBR MAPS)
--------------------------------------------------------------------
- Pipeline Standard: PBR (Physically Based Rendering) Metallic / Roughness
- Map Resolution: 4096 x 4096 (4K) Minimum, 8192 x 8192 (8K) Preferred
- Required Channels:
  * BaseColor / Albedo (Linear sRGB)
  * Normal (OpenGL / DirectX, 16-bit)
  * Roughness (Grayscale)
  * Metallic (Grayscale)
  * Ambient Occlusion (Grayscale)
  * Height / Displacement (Optional, 16-bit EXR)
  * Opacity / Alpha (For meshes requiring transparency)
- Raw Textures Format: Uncompressed 16-bit TIFF or lossless 8-bit PNG

====================================================================
VUE ATELIER CO. - PARADIGM OF VIRTUAL FASHION
CREATIVE ENGINEERING DIVISION
SUPPORT: tech-ateliers@vuefashionstudio.com
====================================================================`;

    // Generate a downloadable Blob
    const blob = new Blob([technicalBriefText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Vue_Fashion_Studio_Asset_Brief.txt";
    
    setTimeout(() => {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloading(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1200);
  };

  return (
    <section
      id="specifications"
      className="bg-black text-white py-32 px-6 sm:px-12 border-b border-neutral-900/60 overflow-hidden relative"
    >
      {/* Background ambient editorial grain overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-950/20 via-black to-black opacity-95 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* Left Column: The Guide Checklist */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-neutral-500 block mb-3 font-bold">
                {config.subtitle}
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight text-white mb-6">
                {config.title}
              </h2>
              <p className="font-sans-luxury text-sm font-light text-neutral-400 leading-relaxed max-w-xl">
                {config.introText}
              </p>
            </div>

            {/* Photoshoot Checklist replacing the raw data tables */}
            <div className="space-y-6 pt-4">
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-500 block font-bold">
                PHOTOSHOOT PREPARATION CHECKLIST
              </span>

              <div className="grid grid-cols-1 gap-5">
                {config.steps.map((step, idx) => (
                  <div key={step.id || idx} className="flex items-start gap-4 p-5 border border-neutral-900 bg-neutral-950/30 hover:border-neutral-800 transition-colors duration-300 rounded-sm">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-white rounded-full flex-shrink-0 mt-0.5">
                      <span className="font-mono text-xs font-semibold">{String(idx + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-sans-luxury text-xs font-semibold tracking-wider text-white uppercase">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rebranded, Beautiful Download Button */}
            <div className="relative pt-4 max-w-md">
              <button
                onClick={triggerDownload}
                disabled={downloading}
                id="btn-download-specs"
                className="w-full flex items-center justify-between group bg-white text-black font-sans-luxury text-[11px] tracking-[0.2em] uppercase font-semibold px-8 py-5 transition-all duration-300 hover:bg-neutral-200 cursor-pointer rounded-sm"
              >
                <span>{downloading ? "Formatting Technical Brief..." : "Download Full Production Brief"}</span>
                <Download
                  size={14}
                  className={`transition-transform duration-300 ${
                    downloading ? "animate-pulse" : "group-hover:translate-y-0.5"
                  }`}
                  strokeWidth={2}
                />
              </button>

              {/* Toast Notification */}
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 -bottom-16 bg-neutral-950 border border-neutral-850 px-4 py-3.5 flex items-center space-x-3 text-[10px] text-neutral-300 rounded-sm"
                >
                  <CheckCircle className="text-white flex-shrink-0" size={14} />
                  <span className="font-sans-luxury tracking-wide">
                    {config.downloadBriefUrl 
                      ? `${config.downloadBriefFilename || "Production_Brief_Guide"} downloaded successfully.` 
                      : "Vue_Fashion_Studio_Asset_Brief.txt downloaded. Full technical guidelines (TIFF, EXR, ACEScg, Clo3D) packaged successfully."}
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column: Editorial "Why" & Master Shot Imagery */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
            
            {/* Elegant Callout Card (High-End Fashion Magazine Look) */}
            {(config.calibrationQuote || config.calibrationAuthor) && (
              <div className="border border-neutral-900 bg-neutral-950/20 p-8 sm:p-10 relative rounded-sm">
                {/* Corner accent decorations typical of fine print layouts */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neutral-800" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neutral-800" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neutral-800" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neutral-800" />
                
                <div className="space-y-6">
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-500 font-bold flex items-center gap-1.5">
                    <Sparkles size={11} className="text-neutral-500" />
                    THE CALIBRATION WHY
                  </span>
                  
                  {config.calibrationQuote && (
                    <blockquote className="font-serif-luxury text-base sm:text-lg text-neutral-200 font-light tracking-wide leading-relaxed italic">
                      "{config.calibrationQuote}"
                    </blockquote>
                  )}
                  
                  {config.calibrationAuthor && (
                    <p className="font-sans-luxury text-[10px] text-neutral-500 tracking-widest uppercase">
                      {config.calibrationAuthor}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* High-End Example Master Shot Slider (FULLY COLORED, NO MONOCHROME FILTER) */}
            <div className="space-y-3.5 relative">
              <div className="w-full aspect-[4/3] bg-neutral-950 overflow-hidden border border-neutral-900/60 shadow-lg relative group rounded-sm">
                
                {/* Image display */}
                <div className="w-full h-full relative overflow-hidden">
                  <img 
                    src={images[currentImgIndex]} 
                    alt={`High-fashion reference details - Image ${currentImgIndex + 1}`} 
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Left/Right Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 border border-neutral-850 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center"
                      title="Previous Image"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 border border-neutral-850 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center"
                      title="Next Image"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 border border-neutral-900 z-10">
                  <span className="font-mono text-[8px] tracking-widest text-neutral-400 uppercase">
                    ACTIVE SCANS / REF: IMG-{currentImgIndex + 1}
                  </span>
                </div>

                {/* Slide index indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 flex space-x-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 border border-neutral-900/40 rounded-sm z-10">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImgIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                          currentImgIndex === idx ? "bg-white scale-125" : "bg-neutral-600 hover:bg-neutral-400"
                        }`}
                        title={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center px-1">
                <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase flex items-center space-x-2">
                  <span>MASTER DETAIL SHOT EXAMPLE</span>
                  <span className="text-neutral-700 font-normal">|</span>
                  <span className="text-neutral-400 font-normal font-mono">{currentImgIndex + 1} / {images.length}</span>
                </span>
                <span className="font-sans-luxury text-[10px] text-neutral-400 font-light italic">
                  Calibrated Photorealistic Analysis
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
