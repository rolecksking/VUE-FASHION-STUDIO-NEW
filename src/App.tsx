import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getCMSConfig, saveCMSConfig, getInquiries } from "./firebase";
import Header from "./components/Header";
import HeroSlider from "./components/HeroSlider";
import Portfolio from "./components/Portfolio";
import Services from "./components/Services";
import AssetSpecs from "./components/AssetSpecs";
import InquiryForm from "./components/InquiryForm";
import Footer from "./components/Footer";
import PortalInquiries from "./components/PortalInquiries";
import { CampaignItem, ServiceTier, AssetSpecItem, PartnerLogo, PartnerLogosConfig, PreProductionConfig, PricingRates } from "./types";
import PartnerLogos from "./components/PartnerLogos";

const INITIAL_PRICING_RATES: PricingRates = {
  basePrice: 300,
  extraModelPrice: 150,
  extraLocationPrice: 200,
  videoPrice: 250
};

const INITIAL_PREPRODUCTION: PreProductionConfig = {
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

const INITIAL_PARTNER_LOGOS: PartnerLogo[] = [
  { id: "p-01", name: "BALENCIAGA" },
  { id: "p-02", name: "VALENTINO" },
  { id: "p-03", name: "CHANEL" },
  { id: "p-04", name: "PRADA" },
  { id: "p-05", name: "DIOR" },
  { id: "p-06", name: "SAINT LAURENT" },
  { id: "p-07", name: "VOGUE" },
  { id: "p-08", name: "GIVENCHY" },
];


// Vibrant full-color high-fashion defaults
const INITIAL_HERO = [
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

const INITIAL_MANIFESTO = {
  tagline: "Our Manifesto",
  title: "The Future of Production",
  body: "We provide end-to-end fashion campaign photography. We handle the casting, set design, and editorial lighting to deliver high-resolution assets indistinguishable from a physical studio production.",
  signature: "— Paris / Milan / Tokyo / New York",
};

const INITIAL_PORTFOLIO: CampaignItem[] = [
  {
    id: "camp-01",
    title: "Vivid Fuchsia & Orange",
    category: "Outfits",
    imageUrl: "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg",
    year: "MMXXVI",
  },
  {
    id: "camp-02",
    title: "The Architectural Brim",
    category: "Hats",
    imageUrl: "/src/assets/images/portfolio_hats_1783464917162.jpg",
    year: "MMXXVI",
  },
  {
    id: "camp-03",
    title: "Chroma Eyewear Campaign",
    category: "Eyewear",
    imageUrl: "/src/assets/images/vibrant_emerald_green_eyewear_1783498183736.jpg",
    year: "MMXXVI",
  },
  {
    id: "camp-04",
    title: "Fluid Silk & Yellow Contrast",
    category: "Outfits",
    imageUrl: "/src/assets/images/vibrant_blue_yellow_silk_1783498166912.jpg",
    year: "MMXXVI",
  },
  {
    id: "camp-05",
    title: "Monolith Leatherwork",
    category: "Bags",
    imageUrl: "/src/assets/images/portfolio_bags_1783464942217.jpg",
    year: "MMXXVI",
  },
  {
    id: "camp-06",
    title: "The Sculptured Step",
    category: "Footwear",
    imageUrl: "/src/assets/images/portfolio_footwear_1783464969159.jpg",
    year: "MMXXVI",
  },
];

const INITIAL_SERVICES: ServiceTier[] = [
  {
    id: "tier-1",
    name: "Atelier I",
    tagline: "Digital Editorial Showcase",
    volume: "1 - 3 Product Silhouettes",
    deliverables: [
      "3+ Editorial Images per look (Hero, Lifestyle, Detail)",
      "Professional Model Casting & Set Curation",
      "Cinematic Editorial Lighting & Color Grading",
      "High-Resolution 4K Master Deliverables"
    ],
    timeline: "5-7 Business Days",
    idealFor: "Boutique fashion labels, emerging accessory brands, and singular lookbook launches.",
    priceEstimate: "From $4,500"
  },
  {
    id: "tier-2",
    name: "Atelier II",
    tagline: "Signature Campaign Production",
    volume: "Up to 8 Outfits / Accessories",
    deliverables: [
      "3+ Editorial Images per look (Hero, Lifestyle, Detail)",
      "Professional Model Casting & Set Curation",
      "Cinematic Editorial Lighting & Color Grading",
      "High-Resolution 4K Master Deliverables",
      "Custom Bespoke Virtual Environment Design",
      "Advanced Digital Styling & Fabric Simulation"
    ],
    timeline: "10-14 Business Days",
    idealFor: "Global flagship collections, premium footwear releases, and digital advertising campaigns.",
    priceEstimate: "From $12,000"
  },
  {
    id: "tier-3",
    name: "Atelier III",
    tagline: "Couture Motion & Metascapes",
    volume: "Complete Collection (Bespoke)",
    deliverables: [
      "3+ Editorial Images per look (Hero, Lifestyle, Detail)",
      "Professional Model Casting & Set Curation",
      "Cinematic Editorial Lighting & Color Grading",
      "High-Resolution 4K Master Deliverables",
      "Cinematic Immersive Video Clips (15s, 4K)",
      "Priority 24/7 Creative Art Director Assistance"
    ],
    timeline: "21 - 30 Production Days",
    idealFor: "Luxury houses seeking immersive runway launches, high-end campaign assets, or virtual showrooms.",
    priceEstimate: "Upon Request"
  }
];

export default function App() {
  const [portalOpen, setPortalOpen] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [selectedScope, setSelectedScope] = useState<string>("");
  const [lang, setLang] = useState<string>("EN");

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("vfs_theme");
    return (saved === "light" || saved === "dark") ? saved : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("vfs_theme", theme);
  }, [theme]);

  // Show luxury loading screen for first-time visitors who have no cached content in localStorage
  const [loading, setLoading] = useState(() => {
    return localStorage.getItem("vfs_cms_hero") === null;
  });

  // Load state or use high-fidelity vibrant full-color defaults
  const [heroImages, setHeroImages] = useState<Array<{ url: string; title: string; alt: string }>>(() => {
    const serverCMS = (window as any).__STUDIO_CONFIG__?.cms;
    if (serverCMS && serverCMS.hero) return serverCMS.hero;
    const raw = localStorage.getItem("vfs_cms_hero");
    return raw ? JSON.parse(raw) : INITIAL_HERO;
  });

  const [manifesto, setManifesto] = useState(() => {
    const serverCMS = (window as any).__STUDIO_CONFIG__?.cms;
    if (serverCMS && serverCMS.manifesto) return serverCMS.manifesto;
    const raw = localStorage.getItem("vfs_cms_manifesto_v2");
    return raw ? JSON.parse(raw) : INITIAL_MANIFESTO;
  });

  const getTranslatedManifesto = () => {
    const isDefault = JSON.stringify(manifesto) === JSON.stringify(INITIAL_MANIFESTO);
    if (!isDefault) return manifesto;

    if (lang === "FR") {
      return {
        tagline: "Notre Manifeste",
        title: "Le Futur de la Production",
        body: "Nous gérons la création de vos campagnes de mode de bout en bout : du casting de mannequins à la direction artistique en passant par la scénographie virtuelle et l'éclairage éditorial haute précision.",
        signature: "— Paris / Milan / Tokyo / New York",
      };
    }
    if (lang === "IT") {
      return {
        tagline: "Il Nostro Manifesto",
        title: "Il Futuro della Produzione",
        body: "Realizziamo campagne fotografiche di moda end-to-end d'eccellenza. Gestiamo il casting, la scenografia architettonica e l'illuminazione editoriale per offrire asset ad altissima risoluzione.",
        signature: "— Milano / Parigi / Tokyo / New York",
      };
    }
    return manifesto;
  };

  const [portfolioItems, setPortfolioItems] = useState<CampaignItem[]>(() => {
    const serverCMS = (window as any).__STUDIO_CONFIG__?.cms;
    if (serverCMS && serverCMS.portfolio) return serverCMS.portfolio;
    const raw = localStorage.getItem("vfs_cms_portfolio");
    return raw ? JSON.parse(raw) : INITIAL_PORTFOLIO;
  });

  const [servicesTiers, setServicesTiers] = useState<ServiceTier[]>(() => {
    const serverCMS = (window as any).__STUDIO_CONFIG__?.cms;
    if (serverCMS && serverCMS.services) return serverCMS.services;
    const raw = localStorage.getItem("vfs_cms_services_v2");
    return raw ? JSON.parse(raw) : INITIAL_SERVICES;
  });

  const [partnerLogosConfig, setPartnerLogosConfig] = useState<PartnerLogosConfig>(() => {
    const serverCMS = (window as any).__STUDIO_CONFIG__?.cms;
    if (serverCMS && serverCMS.partner_logos) return serverCMS.partner_logos;
    const raw = localStorage.getItem("vfs_cms_partner_logos");
    return raw ? JSON.parse(raw) : { enabled: true, logos: INITIAL_PARTNER_LOGOS };
  });

  const [preProductionConfig, setPreProductionConfig] = useState<PreProductionConfig>(() => {
    const serverCMS = (window as any).__STUDIO_CONFIG__?.cms;
    if (serverCMS && serverCMS.preproduction) return serverCMS.preproduction;
    const raw = localStorage.getItem("vfs_cms_preproduction");
    return raw ? JSON.parse(raw) : INITIAL_PREPRODUCTION;
  });

  const [pricingRates, setPricingRates] = useState<PricingRates>(() => {
    const serverCMS = (window as any).__STUDIO_CONFIG__?.cms;
    if (serverCMS && serverCMS.pricing_rates) return serverCMS.pricing_rates;
    const raw = localStorage.getItem("vfs_cms_pricing_rates");
    return raw ? JSON.parse(raw) : INITIAL_PRICING_RATES;
  });

  const [currency, setCurrency] = useState<"USD" | "NGN">(() => {
    const serverCMS = (window as any).__STUDIO_CONFIG__?.cms;
    if (serverCMS && serverCMS.settings?.currency) {
      const c = serverCMS.settings.currency;
      if (c === "USD" || c === "NGN") return c;
    }
    const saved = localStorage.getItem("vfs_currency");
    return (saved === "NGN" || saved === "USD") ? saved : "USD";
  });

  const handleSetCurrency = async (newCurrency: "USD" | "NGN") => {
    setCurrency(newCurrency);
    localStorage.setItem("vfs_currency", newCurrency);
    await saveCMSConfig("settings", { currency: newCurrency });
  };

  const updateInquiryCount = async () => {
    try {
      const list = await getInquiries();
      if (list && list.length > 0) {
        setInquiryCount(list.length);
      } else {
        const raw = localStorage.getItem("vue_studio_inquiries");
        if (raw) {
          const localList = JSON.parse(raw);
          setInquiryCount(localList.length);
        } else {
          setInquiryCount(1); // Set to 1 because PortalInquiries initializes with 1 seed item
        }
      }
    } catch (e) {
      setInquiryCount(0);
    }
  };

  useEffect(() => {
    updateInquiryCount();

    // Fetch initial CMS configuration from Firestore database with server fallback
    const initFirebaseCMS = async () => {
      // Set a robust timeout so first-time visitors are never stuck if connection is extremely slow
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 3500);

      try {
        // Query all configurations in parallel to reduce load time
        const [
          firestoreHero,
          firestoreManifesto,
          firestorePortfolio,
          firestoreServices,
          firestoreLogos,
          firestorePreProd,
          firestorePricingRates,
          firestoreSettings
        ] = await Promise.all([
          getCMSConfig("hero"),
          getCMSConfig("manifesto"),
          getCMSConfig("portfolio"),
          getCMSConfig("services"),
          getCMSConfig("partner_logos"),
          getCMSConfig("preproduction"),
          getCMSConfig("pricing_rates"),
          getCMSConfig("settings")
        ]);

        const serverCMS = (window as any).__STUDIO_CONFIG__?.cms || {};

        const activeHero = firestoreHero || serverCMS.hero;
        if (activeHero) {
          setHeroImages(activeHero);
          localStorage.setItem("vfs_cms_hero", JSON.stringify(activeHero));
        }

        const activeManifesto = firestoreManifesto || serverCMS.manifesto;
        if (activeManifesto) {
          setManifesto(activeManifesto);
          localStorage.setItem("vfs_cms_manifesto_v2", JSON.stringify(activeManifesto));
        }

        const activePortfolio = firestorePortfolio || serverCMS.portfolio;
        if (activePortfolio) {
          setPortfolioItems(activePortfolio);
          localStorage.setItem("vfs_cms_portfolio", JSON.stringify(activePortfolio));
        }

        const activeServices = firestoreServices || serverCMS.services;
        if (activeServices) {
          setServicesTiers(activeServices);
          localStorage.setItem("vfs_cms_services_v2", JSON.stringify(activeServices));
        }

        const activeLogos = firestoreLogos || serverCMS.partner_logos;
        if (activeLogos) {
          setPartnerLogosConfig(activeLogos);
          localStorage.setItem("vfs_cms_partner_logos", JSON.stringify(activeLogos));
        }

        const activePreProd = firestorePreProd || serverCMS.preproduction;
        if (activePreProd) {
          setPreProductionConfig(activePreProd);
          localStorage.setItem("vfs_cms_preproduction", JSON.stringify(activePreProd));
        }

        const activePricingRates = firestorePricingRates || serverCMS.pricing_rates;
        if (activePricingRates) {
          setPricingRates(activePricingRates);
          localStorage.setItem("vfs_cms_pricing_rates", JSON.stringify(activePricingRates));
        }

        const activeSettings = firestoreSettings || serverCMS.settings;
        if (activeSettings && (activeSettings.currency === "USD" || activeSettings.currency === "NGN")) {
          setCurrency(activeSettings.currency);
          localStorage.setItem("vfs_currency", activeSettings.currency);
        }
      } catch (err) {
        console.error("Failed to fetch initial cloud configurations:", err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initFirebaseCMS();
  }, []);

  const handleUpdatePartnerLogos = async (newConfig: PartnerLogosConfig) => {
    setPartnerLogosConfig(newConfig);
    localStorage.setItem("vfs_cms_partner_logos", JSON.stringify(newConfig));
    await saveCMSConfig("partner_logos", newConfig);
  };

  const handleUpdatePreProduction = async (newConfig: PreProductionConfig) => {
    setPreProductionConfig(newConfig);
    localStorage.setItem("vfs_cms_preproduction", JSON.stringify(newConfig));
    await saveCMSConfig("preproduction", newConfig);
  };

  const handleUpdatePricingRates = async (newRates: PricingRates) => {
    setPricingRates(newRates);
    localStorage.setItem("vfs_cms_pricing_rates", JSON.stringify(newRates));
    await saveCMSConfig("pricing_rates", newRates);
  };

  const handleUpdateHero = async (newHero: any[]) => {
    setHeroImages(newHero);
    localStorage.setItem("vfs_cms_hero", JSON.stringify(newHero));
    await saveCMSConfig("hero", newHero);
  };

  const handleUpdateManifesto = async (newManifesto: any) => {
    setManifesto(newManifesto);
    localStorage.setItem("vfs_cms_manifesto_v2", JSON.stringify(newManifesto));
    await saveCMSConfig("manifesto", newManifesto);
  };

  const handleUpdatePortfolio = async (newPortfolio: CampaignItem[]) => {
    setPortfolioItems(newPortfolio);
    localStorage.setItem("vfs_cms_portfolio", JSON.stringify(newPortfolio));
    await saveCMSConfig("portfolio", newPortfolio);
  };

  const handleUpdateServices = async (newServices: ServiceTier[]) => {
    setServicesTiers(newServices);
    localStorage.setItem("vfs_cms_services_v2", JSON.stringify(newServices));
    await saveCMSConfig("services", newServices);
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center font-sans"
        >
          <div className="text-center space-y-6 max-w-md px-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-2"
            >
              <h1 className="text-white font-serif text-3xl md:text-4xl tracking-[0.3em] uppercase">
                V U E
              </h1>
              <p className="text-neutral-500 font-sans text-[9px] tracking-[0.4em] uppercase">
                F A S H I O N   S T U D I O
              </p>
            </motion.div>
            
            {/* Elegant luxury loading line */}
            <div className="w-40 h-[1px] bg-neutral-900 mx-auto overflow-hidden relative">
              <motion.div 
                className="h-full bg-white w-16 absolute left-0"
                animate={{
                  x: ["-100%", "250%"]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut"
                }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-[8px] text-white tracking-[0.2em] uppercase font-mono"
            >
              Calibrating Atelier Assets...
            </motion.p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-black text-white relative min-h-screen selection:bg-white selection:text-black antialiased font-sans"
        >
          {/* Absolute Quiet Luxury Header with Language Selector & Mobile Hamburger */}
          <Header lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />

          {/* Main Single Page Sections */}
          <main>
            {/* Full screen HD Slider Hero with integrated Brand Manifesto (with language translation) */}
            <HeroSlider images={heroImages} manifesto={getTranslatedManifesto()} />

            {/* Scrolling Fashion Partner Logos (Client Portfolio Marquee) */}
            <PartnerLogos config={partnerLogosConfig} />

            {/* Services & Tiered Production Tables (Campaign Builder) - Directly below Hero */}
            <Services tiers={servicesTiers} onRequestTier={setSelectedScope} pricingRates={pricingRates} currency={currency} />

            {/* Client Asset Specs and Downloader (PRE-PRODUCTION PREPARATION) */}
            <AssetSpecs preProductionConfig={preProductionConfig} />

            {/* Campaigns Portfolio Gallery (Editorial Campaigns) */}
            <Portfolio items={portfolioItems} />

            {/* Bespoke Contact Inquiry Form (Bespoke Inquiries) */}
            <InquiryForm 
              onInquirySubmitted={updateInquiryCount} 
              tiers={servicesTiers}
              selectedScope={selectedScope}
              currency={currency}
            />
          </main>

          {/* Footer with Language Sensitivity */}
          <Footer onOpenPortal={() => setPortalOpen(true)} lang={lang} />

          {/* Control Center Portal (Submissions & CMS Drawer) */}
          <PortalInquiries
            isOpen={portalOpen}
            onClose={() => setPortalOpen(false)}
            onRefreshCount={updateInquiryCount}
            
            // CMS Integration Props
            heroImages={heroImages}
            onUpdateHeroImages={handleUpdateHero}
            manifesto={manifesto}
            onUpdateManifesto={handleUpdateManifesto}
            portfolioItems={portfolioItems}
            onUpdatePortfolioItems={handleUpdatePortfolio}
            servicesTiers={servicesTiers}
            onUpdateServicesTiers={handleUpdateServices}

            // Partner Logos Props
            partnerLogosConfig={partnerLogosConfig}
            onUpdatePartnerLogos={handleUpdatePartnerLogos}

            // Pre-Production Config Props
            preProductionConfig={preProductionConfig}
            onUpdatePreProduction={handleUpdatePreProduction}

            // Pricing Rates CMS Props
            pricingRates={pricingRates}
            onUpdatePricingRates={handleUpdatePricingRates}
            currency={currency}
            onUpdateCurrency={handleSetCurrency}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
