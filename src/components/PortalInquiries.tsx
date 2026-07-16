import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Trash2, Shield, Calendar, User, Eye, ArrowRight, ExternalLink, 
  Settings, Image, FileText, Briefcase, Plus, Save, RotateCcw, CheckCircle, 
  ChevronRight, Inbox, Upload, Database, HelpCircle, Film, Loader2, Play, Edit, Mail
} from "lucide-react";
import { Inquiry, CampaignItem, ServiceTier, AssetSpecItem, PartnerLogo, PartnerLogosConfig, PreProductionConfig, PreProductionStep, PricingRates } from "../types";
import DragDropUpload from "./DragDropUpload";
import { getInquiries, saveInquiry, deleteInquiryFromFirebase, uploadToFirebaseStorage, uploadWithProgress, getFirebaseConfig, defaultSandboxConfig, auth, getCMSConfig, saveCMSConfig } from "../firebase";
import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

interface PortalInquiriesProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCount: () => void;

  // CMS Integration Props
  heroImages: any[];
  onUpdateHeroImages: (hero: any[]) => void;
  manifesto: any;
  onUpdateManifesto: (manifesto: any) => void;
  portfolioItems: CampaignItem[];
  onUpdatePortfolioItems: (items: CampaignItem[]) => void;
  servicesTiers: ServiceTier[];
  onUpdateServicesTiers: (tiers: ServiceTier[]) => void;

  // Partner Logos Props
  partnerLogosConfig: PartnerLogosConfig;
  onUpdatePartnerLogos: (config: PartnerLogosConfig) => void;

  // Pre-Production Config Props
  preProductionConfig?: PreProductionConfig;
  onUpdatePreProduction: (config: PreProductionConfig) => void;

  // Pricing Rates CMS Props
  pricingRates: PricingRates;
  onUpdatePricingRates: (rates: PricingRates) => void;
}

type TabType = "inquiries" | "hero_manifesto" | "portfolio" | "pricing_specs" | "database_setup" | "security" | "partners" | "pre_production" | "smtp_config";

function AssetUploadGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-neutral-900 bg-neutral-950/60 p-4 sm:p-5 rounded-sm space-y-3 font-sans-luxury">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-white cursor-pointer focus:outline-none"
      >
        <div className="flex items-center space-x-2">
          <HelpCircle size={14} className="text-neutral-400" />
          <span className="font-mono text-[9px] tracking-widest uppercase font-bold">Atelier Asset Upload Guidelines & specs</span>
        </div>
        <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest hover:text-white transition-colors">
          {isExpanded ? "[ Hide Specs ]" : "[ View Specs ]"}
        </span>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-[10px] text-neutral-400 leading-relaxed pt-3 border-t border-neutral-900/60 animate-fadeIn">
          <div className="space-y-1">
            <strong className="text-white block tracking-widest uppercase text-[8px] text-neutral-300 font-bold">1. Hero Slider</strong>
            <p>• Types: <span className="text-neutral-300 font-mono">JPEG, WebP</span></p>
            <p>• Max Size: <span className="text-neutral-300 font-mono">12 MB</span></p>
            <p>• Ratio: <span className="text-neutral-300 font-mono">16:9 Landscape</span></p>
            <p>• Target: <span className="text-neutral-300 font-mono">3840×2160 px</span></p>
          </div>
          <div className="space-y-1">
            <strong className="text-white block tracking-widest uppercase text-[8px] text-neutral-300 font-bold">2. Campaign Covers</strong>
            <p>• Types: <span className="text-neutral-300 font-mono">JPEG, WebP</span></p>
            <p>• Max Size: <span className="text-neutral-300 font-mono">8 MB</span></p>
            <p>• Ratio: <span className="text-neutral-300 font-mono">3:4 Portrait</span></p>
            <p>• Target: <span className="text-neutral-300 font-mono">1500×2000 px</span></p>
          </div>
          <div className="space-y-1">
            <strong className="text-white block tracking-widest uppercase text-[8px] text-neutral-300 font-bold">3. Showcase Images</strong>
            <p>• Types: <span className="text-neutral-300 font-mono">JPEG, WebP, PNG</span></p>
            <p>• Max Size: <span className="text-neutral-300 font-mono">10 MB</span></p>
            <p>• Ratio: <span className="text-neutral-300 font-mono">3:4 or 1:1 Square</span></p>
            <p>• Target: <span className="text-neutral-300 font-mono">1500×2000 px</span></p>
          </div>
          <div className="space-y-1">
            <strong className="text-white block tracking-widest uppercase text-[8px] text-neutral-300 font-bold">4. Showcase Videos</strong>
            <p>• Types: <span className="text-neutral-300 font-mono">MP4, WebM</span></p>
            <p>• Max Size: <span className="text-neutral-300 font-mono">50 MB</span></p>
            <p>• Codec: <span className="text-neutral-300 font-mono">H.264 Video</span></p>
            <p>• Duration: <span className="text-neutral-300 font-mono">15-30s (Silent Loop)</span></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalInquiries({ 
  isOpen, 
  onClose, 
  onRefreshCount,
  heroImages,
  onUpdateHeroImages,
  manifesto,
  onUpdateManifesto,
  portfolioItems,
  onUpdatePortfolioItems,
  servicesTiers,
  onUpdateServicesTiers,
  partnerLogosConfig,
  onUpdatePartnerLogos,
  preProductionConfig,
  onUpdatePreProduction,
  pricingRates,
  onUpdatePricingRates
}: PortalInquiriesProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("inquiries");

  // Portal Security States
  const [savedPassword, setSavedPassword] = useState<string | null>(() => {
    const serverConfig = (window as any).__STUDIO_CONFIG__;
    if (serverConfig && serverConfig.portalPassword) {
      return serverConfig.portalPassword;
    }
    return localStorage.getItem("vfs_portal_password");
  });
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const val = localStorage.getItem("vfs_failed_attempts");
    return val ? parseInt(val, 10) : 0;
  });
  const [lockoutTime, setLockoutTime] = useState<number>(() => {
    const val = localStorage.getItem("vfs_lockout_time");
    return val ? parseInt(val, 10) : 0;
  });
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // New Password Settings States
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordFormError, setPasswordFormError] = useState("");
  const [passwordFormSuccess, setPasswordFormSuccess] = useState("");

  // Lockout Countdown Timer Effect
  useEffect(() => {
    if (lockoutTime > Date.now()) {
      const calculateTimeLeft = () => {
        const diff = Math.max(0, Math.ceil((lockoutTime - Date.now()) / 1000));
        setTimeLeft(diff);
        if (diff === 0) {
          setFailedAttempts(0);
          setLockoutTime(0);
          localStorage.removeItem("vfs_failed_attempts");
          localStorage.removeItem("vfs_lockout_time");
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    } else {
      setTimeLeft(0);
    }
  }, [lockoutTime]);
  
  // Local form states to hold edit inputs before saving
  const [localManifesto, setLocalManifesto] = useState({ tagline: "", title: "", body: "", signature: "" });
  const [localHero, setLocalHero] = useState<any[]>([]);
  const [localTiers, setLocalTiers] = useState<ServiceTier[]>([]);
  
  // Custom Firebase Database config state
  const [dbConfig, setDbConfig] = useState({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    databaseId: ""
  });

  // Firebase Auth states
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [firebaseEmail, setFirebaseEmail] = useState("");
  const [firebasePassword, setFirebasePassword] = useState("");
  const [firebaseAuthError, setFirebaseAuthError] = useState("");
  const [inquiriesAuthRequired, setInquiriesAuthRequired] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setInquiriesAuthRequired(false);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // New campaign item form state
  const [newCampaign, setNewCampaign] = useState<{
    title: string;
    category: "Hats" | "Outfits" | "Bags" | "Eyewear" | "Footwear" | "Outerwear";
    imageUrl: string;
    innerImageUrl: string;
    year: string;
    description: string;
    showcaseItems: { url: string; type: "image" | "video" }[];
  }>({
    title: "",
    category: "Outfits",
    imageUrl: "",
    innerImageUrl: "",
    year: "MMXXVI",
    description: "",
    showcaseItems: []
  });

  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  // Partner Logos States
  const [partnerLogoName, setPartnerLogoName] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [editingPartnerLogoId, setEditingPartnerLogoId] = useState<string | null>(null);
  const [partnerLogoUploadProgress, setPartnerLogoUploadProgress] = useState<number | null>(null);

  // SMTP Email Engine States
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpAuth, setSmtpAuth] = useState(true);
  const [smtpTls, setSmtpTls] = useState(true);
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpToEmail, setSmtpToEmail] = useState("");

  const loadSmtpConfig = async () => {
    try {
      const config = await getCMSConfig("smtp");
      if (config) {
        setSmtpHost(config.host || "");
        setSmtpPort(config.port || 465);
        setSmtpUsername(config.username || "");
        setSmtpPassword(config.password || "");
        setSmtpAuth(config.auth !== undefined ? config.auth : true);
        setSmtpTls(config.tls !== undefined ? config.tls : true);
        setSmtpFromEmail(config.fromEmail || "");
        setSmtpToEmail(config.toEmail || "");
      }
    } catch (e) {
      console.error("Error loading SMTP config:", e);
    }
  };

  const handleSaveSmtpConfig = async () => {
    const config = {
      host: smtpHost.trim(),
      port: smtpPort,
      username: smtpUsername.trim(),
      password: smtpPassword,
      auth: smtpAuth,
      tls: smtpTls,
      fromEmail: smtpFromEmail.trim(),
      toEmail: smtpToEmail.trim()
    };
    const success = await saveCMSConfig("smtp", config);
    if (success) {
      triggerSaveToast("SMTP Email configuration successfully saved.");
    } else {
      alert("Failed to save SMTP configuration.");
    }
  };

  // Pre-Production States
  const [preProdTitle, setPreProdTitle] = useState("");
  const [preProdSubtitle, setPreProdSubtitle] = useState("");
  const [preProdIntroText, setPreProdIntroText] = useState("");
  const [preProdQuote, setPreProdQuote] = useState("");
  const [preProdAuthor, setPreProdAuthor] = useState("");
  const [preProdImages, setPreProdImages] = useState<string[]>(["", "", ""]);
  const [preProdSteps, setPreProdSteps] = useState<PreProductionStep[]>([]);
  const [preProdDownloadBriefUrl, setPreProdDownloadBriefUrl] = useState("");
  const [preProdDownloadBriefFilename, setPreProdDownloadBriefFilename] = useState("");
  const [preProdBriefUploadProgress, setPreProdBriefUploadProgress] = useState<number | null>(null);

  // Step specific form editing states
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepFormTitle, setStepFormTitle] = useState("");
  const [stepFormDesc, setStepFormDesc] = useState("");

  // Flat pricing rates local states
  const [localBasePrice, setLocalBasePrice] = useState(300);
  const [localExtraModelPrice, setLocalExtraModelPrice] = useState(150);
  const [localExtraLocationPrice, setLocalExtraLocationPrice] = useState(200);
  const [localVideoPrice, setLocalVideoPrice] = useState(250);

  // Upload state for preproduction images
  const [preProdImageUploadProgress, setPreProdImageUploadProgress] = useState<{ [key: number]: number | null }>({});


  // Real-time upload progress states
  const [heroUploadProgress, setHeroUploadProgress] = useState<{ [key: number]: number | null }>({});
  const [coverUploadProgress, setCoverUploadProgress] = useState<number | null>(null);
  const [innerCoverUploadProgress, setInnerCoverUploadProgress] = useState<number | null>(null);
  const [showcaseUploadProgress, setShowcaseUploadProgress] = useState<{ [key: string]: number }>({});

  // Success toast states
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Pre-configured high-fashion images for instant selection
  const PRESET_IMAGES = [
    { label: "Vibrant Fuchsia Couture", url: "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg" },
    { label: "Vibrant Blue & Yellow Silk", url: "/src/assets/images/vibrant_blue_yellow_silk_1783498166912.jpg" },
    { label: "Vibrant Emerald Eyewear", url: "/src/assets/images/vibrant_emerald_green_eyewear_1783498183736.jpg" },
    { label: "Architectural Brim Hat", url: "/src/assets/images/portfolio_hats_1783464917162.jpg" },
    { label: "Structural Silhouette", url: "/src/assets/images/hero_editorial_three_1783464906651.jpg" },
    { label: "Sculptural Black Coat", url: "/src/assets/images/hero_editorial_one_1783464885016.jpg" },
    { label: "Desert White Gown", url: "/src/assets/images/hero_editorial_two_1783464895044.jpg" },
    { label: "Monolith Leather Bag", url: "/src/assets/images/portfolio_bags_1783464942217.jpg" },
    { label: "The Sculptured Step Shoe", url: "/src/assets/images/portfolio_footwear_1783464969159.jpg" }
  ];

  useEffect(() => {
    if (isOpen) {
      loadInquiries();
      loadSmtpConfig();
      // Sync local edit states with current global values
      setLocalManifesto({ ...manifesto });
      setLocalHero([...heroImages]);
      setLocalTiers([...servicesTiers]);

      if (preProductionConfig) {
        setPreProdTitle(preProductionConfig.title || "");
        setPreProdSubtitle(preProductionConfig.subtitle || "");
        setPreProdIntroText(preProductionConfig.introText || "");
        setPreProdQuote(preProductionConfig.calibrationQuote || "");
        setPreProdAuthor(preProductionConfig.calibrationAuthor || "");
        setPreProdImages(preProductionConfig.images || ["", "", ""]);
        setPreProdSteps(preProductionConfig.steps || []);
        setPreProdDownloadBriefUrl(preProductionConfig.downloadBriefUrl || "");
        setPreProdDownloadBriefFilename(preProductionConfig.downloadBriefFilename || "");
      }

      // Sync custom db config
      const currentConfig = getFirebaseConfig();
      setDbConfig({
        apiKey: currentConfig.apiKey || "",
        authDomain: currentConfig.authDomain || "",
        projectId: currentConfig.projectId || "",
        storageBucket: currentConfig.storageBucket || "",
        messagingSenderId: currentConfig.messagingSenderId || "",
        appId: currentConfig.appId || "",
        databaseId: currentConfig.databaseId || ""
      });

      // Sync local flat pricing rates
      if (pricingRates) {
        setLocalBasePrice(pricingRates.basePrice);
        setLocalExtraModelPrice(pricingRates.extraModelPrice);
        setLocalExtraLocationPrice(pricingRates.extraLocationPrice);
        setLocalVideoPrice(pricingRates.videoPrice);
      }
    }
  }, [isOpen, manifesto, heroImages, servicesTiers, preProductionConfig, pricingRates]);

  const loadInquiries = async () => {
    try {
      const list = await getInquiries();
      setInquiriesAuthRequired(false);
      if (list && list.length > 0) {
        setInquiries(list);
      } else {
        const raw = localStorage.getItem("vue_studio_inquiries");
        if (raw) {
          try {
            setInquiries(JSON.parse(raw));
          } catch (e) {
            setInquiries([]);
          }
        } else {
          // Seed initial mock inquiry if none exist
          const initialSeed: Inquiry[] = [
            {
              id: "seed-1",
              name: "Audrey Hepburn",
              brand: "Givenchy Haute Couture",
              category: "Outfits",
              scope: "Atelier III - Couture Motion",
              link: "https://givenchy.com/couture",
              submittedAt: new Date().toLocaleString(),
              email: "audrey@givenchy.com",
            },
          ];
          localStorage.setItem("vue_studio_inquiries", JSON.stringify(initialSeed));
          setInquiries(initialSeed);
          // Save the seed in Firestore so it persists
          await saveInquiry(initialSeed[0]);
          onRefreshCount();
        }
      }
    } catch (e: any) {
      if (e?.message === "PERMISSION_DENIED") {
        setInquiriesAuthRequired(true);
      }
      console.error("Error loading inquiries from Firestore:", e);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > Date.now()) {
      setAuthError(`PORTAL LOCKED. PLEASE WAIT ${timeLeft}s`);
      return;
    }

    const currentPass = savedPassword || "vue";
    const isCorrect = passcode === currentPass || (savedPassword === null && (passcode.toLowerCase() === "vue" || passcode === "" || passcode.toLowerCase() === "studio2026"));

    if (isCorrect) {
      setIsAuthenticated(true);
      setAuthError("");
      setFailedAttempts(0);
      localStorage.removeItem("vfs_failed_attempts");
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      localStorage.setItem("vfs_failed_attempts", nextAttempts.toString());

      if (nextAttempts >= 5) {
        const lockUntil = Date.now() + 60000; // 60 seconds lockout
        setLockoutTime(lockUntil);
        localStorage.setItem("vfs_lockout_time", lockUntil.toString());
        setAuthError(`PORTAL LOCKED: 5 failed attempts.`);
      } else {
        setAuthError(`INVALID CREDENTIALS. Attempt ${nextAttempts} of 5.`);
      }
    }
  };

  const handleClearInquiries = async () => {
    if (window.confirm("Are you sure you want to delete all studio logged inquiries?")) {
      localStorage.removeItem("vue_studio_inquiries");
      // Delete from Firestore
      for (const inq of inquiries) {
        await deleteInquiryFromFirebase(inq.id);
      }
      setInquiries([]);
      setViewingInquiry(null);
      onRefreshCount();
    }
  };

  const handleDeleteInquiry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = inquiries.filter((item) => item.id !== id);
    localStorage.setItem("vue_studio_inquiries", JSON.stringify(filtered));
    setInquiries(filtered);
    if (viewingInquiry?.id === id) {
      setViewingInquiry(null);
    }
    await deleteInquiryFromFirebase(id);
    onRefreshCount();
  };

  // CMS Save Handlers
  const triggerSaveToast = (message: string) => {
    setSaveSuccess(message);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const saveHeroAndManifesto = () => {
    onUpdateManifesto(localManifesto);
    onUpdateHeroImages(localHero);
    triggerSaveToast("Hero Slider & Brand Manifesto updated.");
  };

  const handleStartEditCampaign = (item: CampaignItem) => {
    setEditingCampaignId(item.id);
    setNewCampaign({
      title: item.title,
      category: item.category as any,
      imageUrl: item.imageUrl,
      innerImageUrl: item.innerImageUrl || "",
      year: item.year || "MMXXVI",
      description: item.description || "",
      showcaseItems: item.showcaseItems || []
    });
    // Smooth scroll the campaign form into view
    const element = document.getElementById("campaign-form-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCancelEditCampaign = () => {
    setEditingCampaignId(null);
    setNewCampaign({
      title: "",
      category: "Outfits",
      imageUrl: "",
      innerImageUrl: "",
      year: "MMXXVI",
      description: "",
      showcaseItems: []
    });
    setCoverUploadProgress(null);
    setInnerCoverUploadProgress(null);
    setShowcaseUploadProgress({});
  };

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title.trim()) return;

    if (editingCampaignId) {
      const updated = portfolioItems.map((item) => {
        if (item.id === editingCampaignId) {
          return {
            ...item,
            title: newCampaign.title,
            category: newCampaign.category,
            imageUrl: newCampaign.imageUrl || "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg",
            innerImageUrl: newCampaign.innerImageUrl || undefined,
            year: newCampaign.year || "MMXXVI",
            description: newCampaign.description,
            showcaseItems: newCampaign.showcaseItems
          };
        }
        return item;
      });
      onUpdatePortfolioItems(updated);
      setEditingCampaignId(null);
      triggerSaveToast("Campaign portfolio updated successfully.");
    } else {
      const newItem: CampaignItem = {
        id: `camp-${Date.now()}`,
        title: newCampaign.title,
        category: newCampaign.category,
        imageUrl: newCampaign.imageUrl || "/src/assets/images/vibrant_fuchsia_orange_couture_1783498138634.jpg",
        innerImageUrl: newCampaign.innerImageUrl || undefined,
        year: newCampaign.year || "MMXXVI",
        description: newCampaign.description,
        showcaseItems: newCampaign.showcaseItems
      };

      const updated = [newItem, ...portfolioItems];
      onUpdatePortfolioItems(updated);
      triggerSaveToast("New campaign added to editorial portfolio.");
    }
    
    // Clear form
    setNewCampaign({
      title: "",
      category: "Outfits",
      imageUrl: "",
      innerImageUrl: "",
      year: "MMXXVI",
      description: "",
      showcaseItems: []
    });
    setCoverUploadProgress(null);
    setInnerCoverUploadProgress(null);
    setShowcaseUploadProgress({});
  };

  const handleDeleteCampaign = (id: string) => {
    if (window.confirm("Remove this item from the public campaign list?")) {
      const updated = portfolioItems.filter(item => item.id !== id);
      onUpdatePortfolioItems(updated);
      triggerSaveToast("Portfolio item removed.");
    }
  };

  const handleAddOrEditPartnerLogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerLogoName.trim()) return;

    let updatedLogos = [...(partnerLogosConfig?.logos || [])];

    if (editingPartnerLogoId) {
      // Edit
      updatedLogos = updatedLogos.map((item) => {
        if (item.id === editingPartnerLogoId) {
          return {
            ...item,
            name: partnerLogoName,
            logoUrl: partnerLogoUrl || undefined,
          };
        }
        return item;
      });
      triggerSaveToast("Partner logo updated.");
    } else {
      // Add
      const newLogo: PartnerLogo = {
        id: `logo-${Date.now()}`,
        name: partnerLogoName,
        logoUrl: partnerLogoUrl || undefined,
      };
      updatedLogos = [...updatedLogos, newLogo];
      triggerSaveToast("New partner logo added.");
    }

    onUpdatePartnerLogos({
      ...partnerLogosConfig,
      logos: updatedLogos,
    });

    // Reset Form
    setPartnerLogoName("");
    setPartnerLogoUrl("");
    setEditingPartnerLogoId(null);
    setPartnerLogoUploadProgress(null);
  };

  const handleStartEditPartnerLogo = (logo: PartnerLogo) => {
    setEditingPartnerLogoId(logo.id);
    setPartnerLogoName(logo.name);
    setPartnerLogoUrl(logo.logoUrl || "");
    // Smooth scroll the partner form into view
    const element = document.getElementById("partner-form-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCancelEditPartnerLogo = () => {
    setEditingPartnerLogoId(null);
    setPartnerLogoName("");
    setPartnerLogoUrl("");
    setPartnerLogoUploadProgress(null);
  };

  const handleDeletePartnerLogo = (id: string) => {
    if (window.confirm("Are you sure you want to remove this partner logo?")) {
      const updatedLogos = (partnerLogosConfig?.logos || []).filter((item) => item.id !== id);
      onUpdatePartnerLogos({
        ...partnerLogosConfig,
        logos: updatedLogos,
      });
      triggerSaveToast("Partner logo removed.");
    }
  };

  const handleTogglePartnerLogos = (enabled: boolean) => {
    onUpdatePartnerLogos({
      ...partnerLogosConfig,
      enabled,
    });
    triggerSaveToast(enabled ? "Partner logos marquee enabled." : "Partner logos marquee disabled.");
  };

  // Pre-Production Preparation Config Handlers
  const handleSavePreProdStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepFormTitle.trim() || !stepFormDesc.trim()) return;

    let updatedSteps = [...preProdSteps];

    if (editingStepId) {
      // Edit existing step
      updatedSteps = updatedSteps.map((step) => {
        if (step.id === editingStepId) {
          return {
            ...step,
            title: stepFormTitle,
            description: stepFormDesc,
          };
        }
        return step;
      });
      triggerSaveToast("Pre-production step updated.");
    } else {
      // Add new step
      const newStep: PreProductionStep = {
        id: `step-${Date.now()}`,
        title: stepFormTitle,
        description: stepFormDesc,
      };
      updatedSteps = [...updatedSteps, newStep];
      triggerSaveToast("New pre-production step added.");
    }

    setPreProdSteps(updatedSteps);
    setStepFormTitle("");
    setStepFormDesc("");
    setEditingStepId(null);
  };

  const handleStartEditPreProdStep = (step: PreProductionStep) => {
    setEditingStepId(step.id);
    setStepFormTitle(step.title);
    setStepFormDesc(step.description);
  };

  const handleDeletePreProdStep = (id: string) => {
    if (window.confirm("Are you sure you want to remove this pre-production step?")) {
      const updatedSteps = preProdSteps.filter((s) => s.id !== id);
      setPreProdSteps(updatedSteps);
      triggerSaveToast("Step removed.");
    }
  };

  const handleCancelEditPreProdStep = () => {
    setEditingStepId(null);
    setStepFormTitle("");
    setStepFormDesc("");
  };

  const handleSavePreProductionConfig = () => {
    if (!preProdTitle.trim()) {
      alert("Section title cannot be empty");
      return;
    }
    const updatedConfig: PreProductionConfig = {
      title: preProdTitle,
      subtitle: preProdSubtitle || "03 / PRE-PRODUCTION PREPARATION",
      introText: preProdIntroText,
      steps: preProdSteps,
      images: preProdImages,
      calibrationQuote: preProdQuote,
      calibrationAuthor: preProdAuthor,
      downloadBriefUrl: preProdDownloadBriefUrl,
      downloadBriefFilename: preProdDownloadBriefFilename,
    };
    onUpdatePreProduction(updatedConfig);
    triggerSaveToast("Pre-production configuration saved successfully.");
  };

  const handlePreProdBriefUpload = async (file: File) => {
    try {
      setPreProdBriefUploadProgress(0);
      const downloadUrl = await uploadWithProgress(file, `brief-${Date.now()}-${file.name}`, (p) => {
        setPreProdBriefUploadProgress(p);
      });
      setPreProdDownloadBriefUrl(downloadUrl);
      setPreProdDownloadBriefFilename(file.name);
      triggerSaveToast(`Production brief file "${file.name}" uploaded successfully! Remember to save changes.`);
      setTimeout(() => {
        setPreProdBriefUploadProgress(null);
      }, 3000);
    } catch (err) {
      console.error("Brief file upload failed:", err);
      alert("File upload failed. Please verify storage configuration.");
      setPreProdBriefUploadProgress(null);
    }
  };

  const handlePreProdImageUpload = async (index: number, file: File) => {
    try {
      setPreProdImageUploadProgress((prev) => ({ ...prev, [index]: 0 }));
      const downloadUrl = await uploadWithProgress(file, `preprod-${index}-${file.name}`, (p) => {
        setPreProdImageUploadProgress((prev) => ({ ...prev, [index]: p }));
      });
      const updatedImages = [...preProdImages];
      updatedImages[index] = downloadUrl;
      setPreProdImages(updatedImages);
      triggerSaveToast(`Pre-production image ${index + 1} uploaded!`);
      setTimeout(() => {
        setPreProdImageUploadProgress((prev) => ({ ...prev, [index]: null }));
      }, 3000);
    } catch (err) {
      console.error("Pre-production image upload failed:", err);
      alert("Image upload failed. Please verify storage configuration.");
      setPreProdImageUploadProgress((prev) => ({ ...prev, [index]: null }));
    }
  };

  const saveServicesAndSpecs = () => {
    onUpdateServicesTiers(localTiers);
    triggerSaveToast("Production menus updated successfully.");
  };

  const resetAllCMSToDefaults = () => {
    if (window.confirm("Reset all CMS configs (Images, Manifesto, Services) back to pristine studio defaults? This cannot be undone.")) {
      localStorage.removeItem("vfs_cms_hero");
      localStorage.removeItem("vfs_cms_manifesto");
      localStorage.removeItem("vfs_cms_portfolio");
      localStorage.removeItem("vfs_cms_services");
      localStorage.removeItem("vfs_cms_specs");
      
      // Force page reload to reinitialize pristine defaults
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="portal-overlay" className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="relative w-full max-w-3xl h-full bg-black border-l border-neutral-900 shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-neutral-900 flex items-center justify-between bg-neutral-950/60">
              <div>
                <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-1">
                  Atelier Control Center
                </span>
                <h3 className="font-serif-luxury text-xl sm:text-2xl tracking-wider text-white uppercase font-light">
                  Studio Portal CMS
                </h3>
              </div>
              <div className="flex items-center space-x-3">
                {isAuthenticated && (
                  <button
                    onClick={resetAllCMSToDefaults}
                    title="Reset to Factory Defaults"
                    className="text-neutral-500 hover:text-white p-2.5 transition-colors border border-neutral-900 hover:border-neutral-800 text-[10px] uppercase font-sans-luxury tracking-widest flex items-center space-x-1"
                  >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">Reset Defaults</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  id="btn-close-portal"
                  className="text-neutral-500 hover:text-white p-2.5 transition-colors border border-neutral-900 hover:border-neutral-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Success toast floating notice */}
            {saveSuccess && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 shadow-xl border border-neutral-200 flex items-center space-x-3 z-50 animate-bounce font-sans-luxury text-xs font-semibold tracking-wider uppercase">
                <CheckCircle size={14} />
                <span>{saveSuccess}</span>
              </div>
            )}

            {!isAuthenticated ? (
              /* Passcode Form */
              <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-sm mx-auto space-y-8">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-neutral-950 border border-neutral-900 rounded-full flex items-center justify-center mx-auto">
                    <Shield size={18} className="text-white" />
                  </div>
                  <h4 className="font-serif-luxury text-lg tracking-wide text-white font-light">
                    Atelier Authentication
                  </h4>
                  <p className="font-sans-luxury text-[10px] tracking-widest text-neutral-500 uppercase leading-relaxed">
                    {savedPassword 
                      ? "Custom security password is active. Enter your credentials to access the CMS."
                      : <>Enter passcode <strong className="text-white">"vue"</strong> or <strong className="text-white">"studio2026"</strong> to enter the premium CMS Dashboard.</>}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
                  <input
                    type="password"
                    value={passcode}
                    disabled={timeLeft > 0}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder={timeLeft > 0 ? `LOCKED FOR ${timeLeft}s` : "Enter Atelier Passcode"}
                    className={`w-full bg-neutral-950 border focus:border-white focus:outline-none px-4 py-3.5 text-sm text-center text-white tracking-[0.2em] font-light transition-all ${
                      timeLeft > 0 ? "border-red-900/50 text-red-500 placeholder-red-800" : "border-neutral-900"
                    }`}
                    autoFocus={timeLeft === 0}
                  />
                  {authError && (
                    <p className="font-mono text-[10px] text-center tracking-widest text-red-500 uppercase">{authError}</p>
                  )}
                  {timeLeft > 0 && (
                    <p className="font-mono text-[9px] text-center tracking-widest text-neutral-500 uppercase">
                      Please wait for the lock window to expire or reload.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={timeLeft > 0}
                    className={`w-full font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-4 transition-all cursor-pointer rounded-sm ${
                      timeLeft > 0 
                        ? "bg-red-950/20 text-red-600 border border-red-900/40 cursor-not-allowed" 
                        : "bg-white text-black hover:bg-neutral-200"
                    }`}
                  >
                    {timeLeft > 0 ? `Security Locked (${timeLeft}s)` : "Authorize Access"}
                  </button>
                </form>
              </div>
            ) : (
              /* Authorized CMS & Inquiry Area */
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Modern Navigation Tabs - Single-line stacked horizontally with horizontal scroll */}
                <div 
                  className="border-b border-neutral-900 bg-neutral-950/40 px-4 sm:px-6 md:px-8 flex space-x-4 overflow-x-auto pt-3 pb-4"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <button
                    onClick={() => { setActiveTab("inquiries"); setViewingInquiry(null); }}
                    className={`flex-shrink-0 pb-1.5 text-[10px] tracking-[0.15em] uppercase font-sans-luxury font-medium transition-colors border-b relative cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "inquiries" ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
                    }`}
                  >
                    <Inbox size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Inquiries ({inquiries.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("hero_manifesto")}
                    className={`flex-shrink-0 pb-1.5 text-[10px] tracking-[0.15em] uppercase font-sans-luxury font-medium transition-colors border-b relative cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "hero_manifesto" ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
                    }`}
                  >
                    <Image size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Hero & Manifesto</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("portfolio")}
                    className={`flex-shrink-0 pb-1.5 text-[10px] tracking-[0.15em] uppercase font-sans-luxury font-medium transition-colors border-b relative cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "portfolio" ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
                    }`}
                  >
                    <Plus size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Portfolio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("pricing_specs")}
                    className={`flex-shrink-0 pb-1.5 text-[10px] tracking-[0.15em] uppercase font-sans-luxury font-medium transition-colors border-b relative cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "pricing_specs" ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
                    }`}
                  >
                    <Settings size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Production Tiers</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("pre_production")}
                    className={`flex-shrink-0 pb-1.5 text-[10px] tracking-[0.15em] uppercase font-sans-luxury font-medium transition-colors border-b relative cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "pre_production" ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
                    }`}
                  >
                    <FileText size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Pre-Prod Prep</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("database_setup")}
                    className={`flex-shrink-0 pb-1.5 text-[10px] tracking-[0.15em] uppercase font-sans-luxury font-medium transition-colors border-b relative cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "database_setup" ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
                    }`}
                  >
                    <Database size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Database Config</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("partners")}
                    className={`flex-shrink-0 pb-1.5 text-[10px] tracking-[0.15em] uppercase font-sans-luxury font-medium transition-colors border-b relative cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "partners" ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
                    }`}
                  >
                    <Briefcase size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Studio Partners</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("smtp_config")}
                    className={`flex-shrink-0 pb-1.5 text-[10px] tracking-[0.15em] uppercase font-sans-luxury font-medium transition-colors border-b relative cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "smtp_config" ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
                    }`}
                  >
                    <Mail size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Email Settings</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("security")}
                    className={`flex-shrink-0 pb-1.5 text-[10px] tracking-[0.15em] uppercase font-sans-luxury font-medium transition-colors border-b relative cursor-pointer flex items-center space-x-1.5 ${
                      activeTab === "security" ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
                    }`}
                  >
                    <Shield size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Portal Password</span>
                  </button>
                </div>

                {/* Tab Area Scrollable Frame */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                  
                  {/* TAB 1: CLIENT CONSULTATION SUBMISSIONS */}
                  {activeTab === "inquiries" && (
                    <div className="space-y-6">
                      {inquiriesAuthRequired ? (
                        /* Database Authorization Warning Card */
                        <div className="border border-neutral-900 bg-neutral-950/40 p-8 rounded-sm text-center max-w-md mx-auto space-y-6 my-6">
                          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto">
                            <Shield size={18} className="text-amber-500 animate-pulse" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-serif-luxury text-lg tracking-wide text-white font-light uppercase">
                              Database Auth Required
                            </h4>
                            <p className="font-sans-luxury text-[10px] tracking-widest text-neutral-400 uppercase leading-relaxed">
                              Your new Firebase security rules restrict read access to authenticated owners only.
                            </p>
                          </div>
                          
                          <div className="pt-2">
                            <button
                              onClick={() => setActiveTab("database_setup")}
                              className="w-full bg-white text-black font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-3.5 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                            >
                              <Database size={12} />
                              <span>Go to Database Config</span>
                            </button>
                          </div>
                        </div>
                      ) : viewingInquiry ? (
                        /* Detail Submission View */
                        <div className="space-y-6 border border-neutral-900 bg-neutral-950/40 p-6 md:p-8">
                          <button
                            onClick={() => setViewingInquiry(null)}
                            className="inline-flex items-center space-x-2 text-[9px] tracking-widest uppercase text-neutral-500 hover:text-white transition-colors cursor-pointer mb-2"
                          >
                            <span>← BACK TO INQUIRIES</span>
                          </button>
                          {viewingInquiry.isCampaign ? (
                            /* CAMPAIGN BRIEF VIEW */
                            <div className="space-y-8 text-left font-sans-luxury">
                              <div className="border-b border-neutral-900 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                <div>
                                  <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 block mb-1">
                                    CAMPAIGN PHOTOSHOOT REQUEST
                                  </span>
                                  <h4 className="font-serif-luxury text-xl md:text-2xl tracking-wide text-white break-all">
                                    {viewingInquiry.email}
                                  </h4>
                                </div>
                                <a
                                  href={`mailto:${viewingInquiry.email}`}
                                  className="inline-flex items-center space-x-2 bg-white text-black text-[9px] tracking-widest uppercase font-semibold px-4 py-2 hover:bg-neutral-200 transition-colors shrink-0"
                                >
                                  <Mail size={12} />
                                  <span>Email Client</span>
                                </a>
                              </div>

                              {/* Campaign Estimates Banner */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-neutral-950/60 border border-neutral-900 p-5 rounded-sm">
                                <div>
                                  <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">Pricing Scope</span>
                                  <p className="text-xs text-white font-medium">{viewingInquiry.scope}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">Est. Investment</span>
                                  <p className="text-xs text-white font-mono">{viewingInquiry.campaignPayload?.estimatedInvestment || "Bespoke"}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">Timeline</span>
                                  <p className="text-xs text-white font-medium">{viewingInquiry.campaignPayload?.timeline || "TBD"}</p>
                                </div>
                              </div>

                              {/* Products Accordion List */}
                              <div className="space-y-6">
                                <h5 className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase border-b border-neutral-900 pb-2">
                                  Designed Looks & Collections ({viewingInquiry.campaignPayload?.products?.length || 0})
                                </h5>

                                {(viewingInquiry.campaignPayload?.products || []).map((prod: any, idx: number) => (
                                  <div key={idx} className="border border-neutral-900 bg-neutral-950/20 p-5 space-y-5 rounded-sm">
                                    <div className="flex items-start justify-between border-b border-neutral-900/60 pb-3">
                                      <div>
                                        <span className="text-[8px] font-mono text-neutral-500 uppercase">Look 0{idx + 1}</span>
                                        <h6 className="font-serif-luxury text-base text-white font-light">{prod.name || "Unnamed Product"}</h6>
                                      </div>
                                    </div>

                                    {/* Description */}
                                    {prod.description && (
                                      <div>
                                        <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1.5">Creative Direction Brief</span>
                                        <p className="text-xs text-neutral-300 font-light leading-relaxed whitespace-pre-line">{prod.description}</p>
                                      </div>
                                    )}

                                    {/* Uploaded Product Images */}
                                    {prod.images && prod.images.length > 0 && (
                                      <div>
                                        <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-2">Product Assets</span>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                          {prod.images.map((img: string, imgIdx: number) => (
                                            <div key={imgIdx} className="group relative aspect-[3/4] bg-neutral-900 border border-neutral-800 overflow-hidden rounded-sm">
                                              <img src={img} alt={`Ref ${imgIdx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                                              <a
                                                href={img}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 text-white text-[9px] uppercase tracking-widest font-semibold"
                                              >
                                                <ExternalLink size={10} />
                                                <span>Download</span>
                                              </a>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Model Preference */}
                                    <div className="border-t border-neutral-900/40 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1.5">Casting & Model Specs</span>
                                        {prod.isBespokeModel && prod.modelsList && prod.modelsList[0] ? (
                                          <div className="space-y-1.5 text-xs font-light text-neutral-300">
                                            <p><strong className="text-neutral-500">Gender / Cast:</strong> {prod.modelsList[0].gender}</p>
                                            <p><strong className="text-neutral-500">Ethnicity:</strong> {prod.modelsList[0].ethnicity}</p>
                                            <p><strong className="text-neutral-500">Body Size:</strong> {prod.modelsList[0].size}</p>
                                            <p><strong className="text-neutral-500">Height:</strong> {prod.modelsList[0].height}</p>
                                            <p><strong className="text-neutral-500">Age Range:</strong> {prod.modelsList[0].age}</p>
                                            <p><strong className="text-neutral-500">Makeup Concept:</strong> {prod.modelsList[0].makeup}</p>
                                            <p><strong className="text-neutral-500">Aesthetic Details:</strong> Tattoos: {prod.modelsList[0].tattoos} • Piercings: {prod.modelsList[0].piercings} • Jewelry: {prod.modelsList[0].jewelry}</p>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-neutral-400 font-light">Standard Atelier Cast & Curation</p>
                                        )}
                                      </div>

                                      {/* Model Reference Images */}
                                      {prod.isBespokeModel && prod.modelsList && prod.modelsList[0]?.images && prod.modelsList[0].images.length > 0 && (
                                        <div>
                                          <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1.5">Model Reference Moodboard</span>
                                          <div className="grid grid-cols-3 gap-2">
                                            {prod.modelsList[0].images.map((img: string, imgIdx: number) => (
                                              <div key={imgIdx} className="group relative aspect-[3/4] bg-neutral-900 border border-neutral-800 overflow-hidden rounded-sm">
                                                <img src={img} alt={`Model Ref ${imgIdx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                <a
                                                  href={img}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                >
                                                  <ExternalLink size={10} />
                                                </a>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Location preferences */}
                                    <div className="border-t border-neutral-900/40 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1.5">Set Design & Environment</span>
                                        {prod.productionScope === "single" ? (
                                          <div className="space-y-1 text-xs font-light text-neutral-300">
                                            <p className="font-semibold text-white">{prod.singleLocation?.name || "Signature Studio Environment"}</p>
                                            <p className="text-neutral-400 leading-relaxed">{prod.singleLocation?.description}</p>
                                          </div>
                                        ) : (
                                          <div className="space-y-3">
                                            <p className="font-semibold text-white text-xs">Multi-Location Campaign</p>
                                            {(prod.multiLocations || []).map((loc: any, lIdx: number) => (
                                              <div key={lIdx} className="border-l border-neutral-800 pl-2.5 space-y-0.5">
                                                <p className="text-xs text-white font-medium">Set {lIdx + 1}: {loc.name}</p>
                                                <p className="text-[11px] text-neutral-400 font-light leading-relaxed">{loc.description}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Location Reference images */}
                                      {prod.productionScope === "single" && prod.singleLocation?.images && prod.singleLocation.images.length > 0 && (
                                        <div>
                                          <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1.5">Set Moodboard Images</span>
                                          <div className="grid grid-cols-3 gap-2">
                                            {prod.singleLocation.images.map((img: string, imgIdx: number) => (
                                              <div key={imgIdx} className="group relative aspect-[3/4] bg-neutral-900 border border-neutral-800 overflow-hidden rounded-sm">
                                                <img src={img} alt={`Loc Ref ${imgIdx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                <a
                                                  href={img}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                >
                                                  <ExternalLink size={10} />
                                                </a>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {prod.productionScope === "multi" && prod.multiLocations && (
                                        <div>
                                          <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1.5">Multi-Set Moodboard Images</span>
                                          <div className="flex flex-wrap gap-2">
                                            {prod.multiLocations.map((loc: any, lIdx: number) => 
                                              (loc.images || []).map((img: string, imgIdx: number) => (
                                                <div key={`${lIdx}-${imgIdx}`} className="group relative w-16 h-20 bg-neutral-900 border border-neutral-800 overflow-hidden rounded-sm" title={`Set ${lIdx + 1} Ref`}>
                                                  <img src={img} alt={`Loc Ref ${lIdx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                  <a
                                                    href={img}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                  >
                                                    <ExternalLink size={10} />
                                                  </a>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Video specs */}
                                    <div className="border-t border-neutral-900/40 pt-4">
                                      <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1.5">Cinematic Video & Motion specs</span>
                                      {prod.videoCount > 0 ? (
                                        <div className="space-y-1.5 text-xs font-light text-neutral-300">
                                          <p><strong className="text-neutral-500">Video Outlay:</strong> {prod.videoCount} Short Motion Loops</p>
                                          <p><strong className="text-neutral-500">Aspect Format:</strong> {prod.videoOrientation}</p>
                                          {prod.videoInstructions && <p><strong className="text-neutral-500">Instructions:</strong> "{prod.videoInstructions}"</p>}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-neutral-400 font-light">Static High-Fashion editorial campaign images only</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-6 border-t border-neutral-900 flex items-center justify-between text-neutral-500 text-[10px]">
                                <span className="font-mono tracking-wider">Submitted: {viewingInquiry.submittedAt}</span>
                                <button
                                  onClick={(e) => { handleDeleteInquiry(viewingInquiry.id, e); setViewingInquiry(null); }}
                                  className="text-red-500 hover:text-red-400 font-sans-luxury tracking-widest uppercase flex items-center space-x-1 cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                  <span>DELETE CAMPAIGN BRIEF</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* STANDARD BRIEF VIEW */
                            <>
                              <div className="border-b border-neutral-900 pb-6">
                                <span className="font-mono text-[9px] tracking-widest text-neutral-500 block mb-1">
                                  INCOMING BRAND BRIEF
                                </span>
                                <h4 className="font-serif-luxury text-2xl tracking-wide text-white">
                                  {viewingInquiry.brand}
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans-luxury">
                                <div>
                                  <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">
                                    Brand Director
                                  </span>
                                  <p className="text-sm text-neutral-200 font-light">{viewingInquiry.name}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">
                                    Product Category
                                  </span>
                                  <p className="text-sm text-neutral-200 font-light">{viewingInquiry.category}</p>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">
                                    Requested Production Scope
                                  </span>
                                  <p className="text-sm text-neutral-200 font-light">{viewingInquiry.scope}</p>
                                </div>
                                {viewingInquiry.link && (
                                  <div className="sm:col-span-2">
                                    <span className="text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">
                                      Reference Moodboard Link
                                    </span>
                                    <a
                                      href={viewingInquiry.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-white hover:underline inline-flex items-center space-x-1 font-light"
                                    >
                                      <span className="truncate max-w-[320px] sm:max-w-md block">{viewingInquiry.link}</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  </div>
                                )}
                              </div>

                              <div className="pt-6 border-t border-neutral-900 flex items-center justify-between text-neutral-500 text-[10px]">
                                <span className="font-mono tracking-wider">Logged: {viewingInquiry.submittedAt}</span>
                                <button
                                  onClick={(e) => { handleDeleteInquiry(viewingInquiry.id, e); setViewingInquiry(null); }}
                                  className="text-red-500 hover:text-red-400 font-sans-luxury tracking-widest uppercase flex items-center space-x-1 cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                  <span>DELETE BRIEF</span>
                                </button>
                              </div>
                            </>
                          )}
                          </div>
                      ) : (
                        /* Submissions List view */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-950">
                            <span className="font-sans-luxury text-[10px] tracking-widest text-neutral-400">
                              Logged Consultations ({inquiries.length})
                            </span>
                            {inquiries.length > 0 && (
                              <button
                                onClick={handleClearInquiries}
                                className="text-neutral-500 hover:text-white text-[9px] tracking-widest uppercase flex items-center space-x-1 cursor-pointer"
                              >
                                <Trash2 size={12} />
                                <span>Clear All</span>
                              </button>
                            )}
                          </div>

                          <div className="divide-y divide-neutral-900 border border-neutral-900 bg-neutral-950/20">
                            {inquiries.length === 0 ? (
                              <div className="p-16 text-center text-neutral-600 font-sans-luxury text-xs tracking-widest uppercase">
                                No brand consultation requests have been received.
                              </div>
                            ) : (
                              inquiries.map((inq) => (
                                <div
                                  key={inq.id}
                                  onClick={() => setViewingInquiry(inq)}
                                  className="p-5 hover:bg-neutral-950/60 cursor-pointer flex items-center justify-between group transition-colors"
                                >
                                  <div>
                                    <span className="font-mono text-[8px] tracking-widest text-neutral-500 uppercase block mb-1">
                                      {inq.category}
                                    </span>
                                    <h4 className="font-serif-luxury text-base tracking-wide text-white group-hover:text-neutral-300 transition-colors">
                                      {inq.brand}
                                    </h4>
                                    <p className="font-sans-luxury text-[10px] text-neutral-500 font-light mt-0.5">
                                      {inq.name} • {inq.scope.split(" - ")[0]}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={(e) => handleDeleteInquiry(inq.id, e)}
                                      className="text-neutral-700 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                                      aria-label="Delete"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                    <ArrowRight size={14} className="text-neutral-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: HERO SLIDER & BRAND MANIFESTO COPY */}
                  {activeTab === "hero_manifesto" && (
                    <div className="space-y-10">
                      <AssetUploadGuide />
                      
                      {/* Hero Slides Editor */}
                      <div className="space-y-6">
                        <div className="border-b border-neutral-900 pb-2">
                          <h4 className="font-serif-luxury text-lg text-white font-light uppercase tracking-wider">
                            Vibrant Hero Slider Images
                          </h4>
                          <p className="font-sans-luxury text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                            Modify titles and URLs. Grayscale filter has been disabled to support Fabric Color Vibrancy.
                          </p>
                        </div>

                        {localHero.map((slide, sIdx) => (
                          <div key={sIdx} className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4 font-sans-luxury">
                            <span className="font-mono text-[9px] text-neutral-500 tracking-widest block uppercase font-bold">
                              HERO SLIDE 0{sIdx + 1}
                            </span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                              {/* Preview Thumbnail */}
                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-500">Thumbnail</label>
                                <div className="w-full h-[38px] bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden relative rounded-sm">
                                  {slide.url ? (
                                    <>
                                      <img src={slide.url} alt="Slide preview" className="w-full h-full object-cover" />
                                      {heroUploadProgress[sIdx] === 100 && (
                                        <div className="absolute inset-0 bg-emerald-950/80 flex items-center justify-center border border-emerald-500">
                                          <span className="text-[8px] text-emerald-300 font-mono uppercase font-bold tracking-widest">SUCCESS</span>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[8px] text-neutral-600 font-mono uppercase">Empty</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Slide Title</label>
                                <input
                                  type="text"
                                  value={slide.title}
                                  onChange={(e) => {
                                    const next = [...localHero];
                                    next[sIdx].title = e.target.value;
                                    setLocalHero(next);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light h-[38px]"
                                />
                              </div>
                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Image Asset URL</label>
                                <input
                                  type="text"
                                  value={slide.url}
                                  onChange={(e) => {
                                    const next = [...localHero];
                                    next[sIdx].url = e.target.value;
                                    setLocalHero(next);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light font-mono h-[38px]"
                                />
                              </div>
                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Upload to Storage</label>
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        try {
                                          setHeroUploadProgress(prev => ({ ...prev, [sIdx]: 0 }));
                                          const downloadUrl = await uploadWithProgress(file, file.name, (p) => {
                                            setHeroUploadProgress(prev => ({ ...prev, [sIdx]: p }));
                                          });
                                          const next = [...localHero];
                                          next[sIdx].url = downloadUrl;
                                          setLocalHero(next);
                                          triggerSaveToast("Hero Slide updated successfully!");
                                          setTimeout(() => {
                                            setHeroUploadProgress(prev => ({ ...prev, [sIdx]: null }));
                                          }, 3000);
                                        } catch (err) {
                                          console.error("Upload failed", err);
                                          alert("Failed to upload image. Please verify Firebase Storage rules.");
                                          setHeroUploadProgress(prev => ({ ...prev, [sIdx]: null }));
                                        }
                                      }
                                    }}
                                    className="hidden"
                                    id={`hero-upload-${sIdx}`}
                                  />
                                  <label
                                    htmlFor={`hero-upload-${sIdx}`}
                                    className="flex items-center justify-center space-x-2 bg-neutral-900 border border-neutral-800 text-[10px] tracking-widest uppercase text-neutral-300 py-2.5 px-3 hover:bg-neutral-800 cursor-pointer text-center font-semibold h-[38px] w-full"
                                  >
                                    <Upload size={12} />
                                    <span>Upload Image</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Hero Image Progress Tracker */}
                            {heroUploadProgress[sIdx] !== undefined && heroUploadProgress[sIdx] !== null && (
                              <div className="pt-1.5 space-y-1">
                                <div className="w-full bg-neutral-900 h-1.5 rounded-sm overflow-hidden relative">
                                  <div 
                                    className="bg-white h-full transition-all duration-300"
                                    style={{ width: `${heroUploadProgress[sIdx]}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[8px] text-neutral-400 block tracking-widest uppercase">
                                  UPLOADING IMAGE: {heroUploadProgress[sIdx]}%
                                </span>
                              </div>
                            )}

                            {/* Preset picker chips for hero image */}
                            <div className="pt-2">
                              <span className="text-[8px] tracking-widest uppercase text-neutral-500 block mb-1.5">Select high-fashion generated preset:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {PRESET_IMAGES.map((preset, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => {
                                      const next = [...localHero];
                                      next[sIdx].url = preset.url;
                                      setLocalHero(next);
                                    }}
                                    className={`text-[8px] tracking-wider px-2 py-1 border transition-colors cursor-pointer uppercase ${
                                      slide.url === preset.url 
                                        ? "bg-white text-black border-white font-medium" 
                                        : "bg-transparent text-neutral-400 border-neutral-900 hover:border-neutral-700"
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Manifesto Content Copy */}
                      <div className="space-y-6">
                        <div className="border-b border-neutral-900 pb-2">
                          <h4 className="font-serif-luxury text-lg text-white font-light uppercase tracking-wider">
                            Brand Manifesto Text
                          </h4>
                          <p className="font-sans-luxury text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                            Edit core editorial brand mission statement displayed on the main page.
                          </p>
                        </div>

                        <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4 font-sans-luxury">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400">Manifesto Section Tag</label>
                            <input
                              type="text"
                              value={localManifesto.tagline}
                              onChange={(e) => setLocalManifesto({ ...localManifesto, tagline: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400">Main Title Heading</label>
                            <input
                              type="text"
                              value={localManifesto.title}
                              onChange={(e) => setLocalManifesto({ ...localManifesto, title: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400">Manifesto Body Paragraph</label>
                            <textarea
                              rows={4}
                              value={localManifesto.body}
                              onChange={(e) => setLocalManifesto({ ...localManifesto, body: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light leading-relaxed"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400">Signature Line</label>
                            <input
                              type="text"
                              value={localManifesto.signature}
                              onChange={(e) => setLocalManifesto({ ...localManifesto, signature: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={saveHeroAndManifesto}
                        className="w-full bg-white text-black font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-4.5 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Save Hero & Manifesto Changes</span>
                      </button>

                    </div>
                  )}

                  {/* TAB 3: CAMPAIGNS PORTFOLIO GRID CMS */}
                  {activeTab === "portfolio" && (
                    <div className="space-y-10">
                      
                      {/* Collapsible Upload specifications info */}
                      <AssetUploadGuide />

                      {/* Form to Add New Campaign */}
                      <form id="campaign-form-section" onSubmit={handleAddCampaign} className="border border-neutral-900 p-6 bg-neutral-950/40 space-y-6 font-sans-luxury scroll-mt-6">
                        <div className="border-b border-neutral-900 pb-3 mb-2 flex items-center justify-between">
                          <h4 className="font-serif-luxury text-base text-white font-light uppercase tracking-wider flex items-center space-x-2">
                            {editingCampaignId ? <Save size={16} className="text-amber-400 animate-pulse" /> : <Plus size={16} />}
                            <span>{editingCampaignId ? `Edit Existing Campaign` : "Create New Clickable Editorial Campaign"}</span>
                          </h4>
                          <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest">
                            {editingCampaignId ? "[ Editing Mode Active ]" : "[ Step-By-Step Designer ]"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {/* 1. Title */}
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold">Campaign Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Neon Fusion Autumn Capsule"
                              value={newCampaign.title}
                              onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light"
                            />
                          </div>
                          
                          {/* 2. Category */}
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold">Category</label>
                            <select
                              value={newCampaign.category}
                              onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value as any })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light cursor-pointer appearance-none h-[38px]"
                            >
                              <option value="Outfits">Ready-To-Wear & Outfits</option>
                              <option value="Hats">Hats & Millinery</option>
                              <option value="Bags">Bags & Leather Accessories</option>
                              <option value="Eyewear">Eyewear & Sunglasses</option>
                              <option value="Footwear">Footwear & Boots</option>
                              <option value="Outerwear">Outerwear & Coats</option>
                            </select>
                          </div>

                          {/* 3. Year */}
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold">Campaign Year</label>
                            <input
                              type="text"
                              placeholder="e.g. MMXXVI"
                              value={newCampaign.year}
                              onChange={(e) => setNewCampaign({ ...newCampaign, year: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light"
                            />
                          </div>

                          {/* 4. Display Cover URL */}
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold">Display Cover URL *</label>
                            <input
                              type="text"
                              required
                              placeholder="Automatic or external URL..."
                              value={newCampaign.imageUrl}
                              onChange={(e) => setNewCampaign({ ...newCampaign, imageUrl: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light font-mono"
                            />
                          </div>

                          {/* 4b. Inner Campaign Cover URL (Landscape) */}
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold">Inner Cover URL (Landscape)</label>
                            <input
                              type="text"
                              placeholder="Optional landscape URL (falls back to main cover if empty)..."
                              value={newCampaign.innerImageUrl}
                              onChange={(e) => setNewCampaign({ ...newCampaign, innerImageUrl: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light font-mono"
                            />
                          </div>

                          {/* 5. Campaign Story / Description */}
                          <div className="flex flex-col space-y-1.5 sm:col-span-2">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold">Campaign Editorial Description *</label>
                            <textarea
                              rows={3}
                              required
                              placeholder="Write a beautiful, rich narrative story describing the fabric textures, lighting designs, and artistic motivations for this specific collection..."
                              value={newCampaign.description}
                              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light leading-relaxed"
                            />
                          </div>

                          {/* 6. Cover Image File Uploader */}
                          <div className="flex flex-col space-y-1.5 sm:col-span-2 border border-neutral-900 bg-neutral-950/30 p-4.5 rounded-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <span className="text-[9px] tracking-widest uppercase text-neutral-300 font-bold block">1. Main Cover Image</span>
                                <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-mono block mt-0.5">3:4 Ratio • Portrait • Max 8MB</span>
                              </div>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      try {
                                        setCoverUploadProgress(0);
                                        const downloadUrl = await uploadWithProgress(file, file.name, (p) => {
                                          setCoverUploadProgress(p);
                                        });
                                        setNewCampaign(prev => ({ ...prev, imageUrl: downloadUrl }));
                                        triggerSaveToast("Campaign cover uploaded successfully!");
                                        setTimeout(() => setCoverUploadProgress(null), 3000);
                                      } catch (err) {
                                        console.error("Cover upload failed:", err);
                                        alert("Cover upload failed. Please verify storage permissions.");
                                        setCoverUploadProgress(null);
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="cover-upload-field"
                                />
                                <label
                                  htmlFor="cover-upload-field"
                                  className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 text-[9px] tracking-widest uppercase text-white py-2 px-4 hover:bg-neutral-800 cursor-pointer font-bold h-[34px] rounded-sm"
                                >
                                  <Upload size={12} />
                                  <span>Upload Cover Image</span>
                                </label>
                              </div>
                            </div>

                            {/* Cover Progress Bar */}
                            {coverUploadProgress !== null && (
                              <div className="mt-3.5 space-y-1">
                                <div className="w-full bg-neutral-900 h-1 rounded-sm overflow-hidden relative">
                                  <div 
                                    className="bg-white h-full transition-all duration-300"
                                    style={{ width: `${coverUploadProgress}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[8px] text-neutral-400 block tracking-widest uppercase">
                                  UPLOADING COVER: {coverUploadProgress}%
                                </span>
                              </div>
                            )}

                            {/* Cover Thumbnail Preview */}
                            {newCampaign.imageUrl && (
                              <div className="mt-4 flex items-center space-x-4 border-t border-neutral-900 pt-4">
                                <div className="w-12 h-16 bg-black border border-neutral-800 overflow-hidden rounded-sm flex-shrink-0">
                                  <img src={newCampaign.imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="font-mono text-[8px] tracking-widest uppercase space-y-0.5 text-neutral-400">
                                  <span className="text-emerald-400 font-bold block">✓ COVER IMAGE DETECTED</span>
                                  <span className="block truncate max-w-md">{newCampaign.imageUrl}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 6b. Inner Landscape Cover Image File Uploader */}
                          <div className="flex flex-col space-y-1.5 sm:col-span-2 border border-neutral-900 bg-neutral-950/30 p-4.5 rounded-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <span className="text-[9px] tracking-widest uppercase text-neutral-300 font-bold block">1b. Inner Campaign Cover (Detail Page)</span>
                                <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-mono block mt-0.5">16:9 or 4:3 Ratio • Landscape • Max 8MB</span>
                              </div>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      try {
                                        setInnerCoverUploadProgress(0);
                                        const downloadUrl = await uploadWithProgress(file, file.name, (p) => {
                                          setInnerCoverUploadProgress(p);
                                        });
                                        setNewCampaign(prev => ({ ...prev, innerImageUrl: downloadUrl }));
                                        triggerSaveToast("Campaign inner landscape cover uploaded successfully!");
                                        setTimeout(() => setInnerCoverUploadProgress(null), 3000);
                                      } catch (err) {
                                        console.error("Inner cover upload failed:", err);
                                        alert("Inner cover upload failed. Please verify storage permissions.");
                                        setInnerCoverUploadProgress(null);
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="inner-cover-upload-field"
                                />
                                <label
                                  htmlFor="inner-cover-upload-field"
                                  className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 text-[9px] tracking-widest uppercase text-white py-2 px-4 hover:bg-neutral-800 cursor-pointer font-bold h-[34px] rounded-sm"
                                >
                                  <Upload size={12} />
                                  <span>Upload Landscape Image</span>
                                </label>
                              </div>
                            </div>

                            {/* Inner Cover Progress Bar */}
                            {innerCoverUploadProgress !== null && (
                              <div className="mt-3.5 space-y-1">
                                <div className="w-full bg-neutral-900 h-1 rounded-sm overflow-hidden relative">
                                  <div 
                                    className="bg-white h-full transition-all duration-300"
                                    style={{ width: `${innerCoverUploadProgress}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[8px] text-neutral-400 block tracking-widest uppercase">
                                  UPLOADING LANDSCAPE COVER: {innerCoverUploadProgress}%
                                </span>
                              </div>
                            )}

                            {/* Inner Cover Thumbnail Preview */}
                            {newCampaign.innerImageUrl && (
                              <div className="mt-4 flex items-center space-x-4 border-t border-neutral-900 pt-4">
                                <div className="w-20 h-12 bg-black border border-neutral-800 overflow-hidden rounded-sm flex-shrink-0">
                                  <img src={newCampaign.innerImageUrl} alt="Inner Landscape Cover Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="font-mono text-[8px] tracking-widest uppercase space-y-0.5 text-neutral-400">
                                  <span className="text-emerald-400 font-bold block">✓ INNER LANDSCAPE COVER DETECTED</span>
                                  <span className="block truncate max-w-md">{newCampaign.innerImageUrl}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 7. Showcase Elements (Multi-upload Images & Videos) */}
                          <div className="flex flex-col space-y-1.5 sm:col-span-2 border border-neutral-900 bg-neutral-950/30 p-4.5 rounded-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <span className="text-[9px] tracking-widest uppercase text-neutral-300 font-bold block">2. Campaign Gallery Showcase Assets</span>
                                <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-mono block mt-0.5">Multiple Files • Images (Max 10MB) • Videos (MP4 Loop, Max 50MB)</span>
                              </div>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  multiple
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      const files = Array.from(e.target.files) as File[];
                                      
                                      // Set default progress for selected files
                                      const initialProgress: { [key: string]: number } = {};
                                      files.forEach(f => { initialProgress[f.name] = 0; });
                                      setShowcaseUploadProgress(prev => ({ ...prev, ...initialProgress }));

                                      triggerSaveToast(`Uploading ${files.length} showcase assets...`);

                                      // Sequential upload to preserve memory & bandwidth
                                      for (const file of files) {
                                        try {
                                          const downloadUrl = await uploadWithProgress(file, file.name, (p) => {
                                            setShowcaseUploadProgress(prev => ({ ...prev, [file.name]: p }));
                                          });

                                          const itemType = file.type.startsWith("video/") ? "video" : "image";
                                          setNewCampaign(prev => ({
                                            ...prev,
                                            showcaseItems: [...prev.showcaseItems, { url: downloadUrl, type: itemType }]
                                          }));

                                          // Clear progress item
                                          setTimeout(() => {
                                            setShowcaseUploadProgress(prev => {
                                              const copy = { ...prev };
                                              delete copy[file.name];
                                              return copy;
                                            });
                                          }, 2000);

                                        } catch (err) {
                                          console.error("Showcase upload failed:", file.name, err);
                                          alert(`Failed to upload ${file.name}.`);
                                          setShowcaseUploadProgress(prev => {
                                            const copy = { ...prev };
                                            delete copy[file.name];
                                            return copy;
                                          });
                                        }
                                      }
                                      triggerSaveToast("Showcase gallery updated successfully!");
                                    }
                                  }}
                                  className="hidden"
                                  id="showcase-upload-field"
                                />
                                <label
                                  htmlFor="showcase-upload-field"
                                  className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 text-[9px] tracking-widest uppercase text-white py-2 px-4 hover:bg-neutral-800 cursor-pointer font-bold h-[34px] rounded-sm"
                                >
                                  <Upload size={12} />
                                  <span>Browse Multi-Files</span>
                                </label>
                              </div>
                            </div>

                            {/* Active Showcase Upload Progress Queue */}
                            {Object.keys(showcaseUploadProgress).length > 0 && (
                              <div className="mt-3.5 space-y-2 border-t border-neutral-900 pt-3">
                                <span className="font-mono text-[8px] tracking-widest uppercase text-neutral-500 font-bold block">UPLOADING QUEUE:</span>
                                {Object.entries(showcaseUploadProgress).map(([fileName, progress]) => (
                                  <div key={fileName} className="space-y-1">
                                    <div className="flex justify-between items-center text-[8px] font-mono text-neutral-400">
                                      <span className="truncate max-w-sm">{fileName}</span>
                                      <span>{progress}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-900 h-1 rounded-sm overflow-hidden relative">
                                      <div 
                                        className="bg-white h-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Showcase Thumbnails Grid (Editable Draft) */}
                            {newCampaign.showcaseItems && newCampaign.showcaseItems.length > 0 && (
                              <div className="mt-4 border-t border-neutral-900 pt-4 space-y-2">
                                <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-neutral-400 font-bold block">DRAFT GALLERY ({newCampaign.showcaseItems.length} ITEMS):</span>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                  {newCampaign.showcaseItems.map((item, idx) => (
                                    <div 
                                      key={idx} 
                                      className="aspect-[3/4] bg-black border border-neutral-800 overflow-hidden relative group rounded-sm"
                                    >
                                      {item.type === "video" ? (
                                        <div className="w-full h-full relative bg-neutral-950 flex items-center justify-center">
                                          <video src={item.url} muted className="w-full h-full object-cover opacity-75" />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <Film size={12} className="text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        <img src={item.url} alt={`Showcase draft ${idx}`} className="w-full h-full object-cover" />
                                      )}
                                      {/* Hover Deletion Layer */}
                                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNewCampaign(prev => ({
                                              ...prev,
                                              showcaseItems: prev.showcaseItems.filter((_, i) => i !== idx)
                                            }));
                                          }}
                                          className="text-red-400 hover:text-red-500 p-1 bg-neutral-900 border border-neutral-800"
                                          title="Delete Draft Item"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      {/* Index label */}
                                      <span className="absolute bottom-1 right-1 font-mono text-[7px] text-neutral-500 bg-black/80 px-1">0{idx + 1}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Image Presets Cover Picker */}
                        <div>
                          <span className="text-[8px] tracking-widest uppercase text-neutral-500 block mb-1.5">Quick image cover preset selection:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_IMAGES.map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setNewCampaign({ ...newCampaign, imageUrl: preset.url })}
                                className={`text-[8px] tracking-wider px-2 py-1 border transition-colors cursor-pointer uppercase ${
                                  newCampaign.imageUrl === preset.url 
                                    ? "bg-white text-black border-white font-medium" 
                                    : "bg-transparent text-neutral-400 border-neutral-900 hover:border-neutral-700"
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          {editingCampaignId && (
                            <button
                              type="button"
                              onClick={handleCancelEditCampaign}
                              className="w-full sm:w-1/3 bg-neutral-900 text-white border border-neutral-800 font-sans-luxury text-[10px] tracking-widest uppercase font-bold py-4 hover:bg-neutral-800 transition-all flex items-center justify-center space-x-1.5 cursor-pointer rounded-sm"
                            >
                              <X size={14} />
                              <span>Cancel Edit</span>
                            </button>
                          )}
                          <button
                            type="submit"
                            className={`flex-1 font-sans-luxury text-[10px] tracking-widest uppercase font-bold py-4 transition-all flex items-center justify-center space-x-1.5 cursor-pointer rounded-sm ${
                              editingCampaignId 
                                ? "bg-amber-500 text-black hover:bg-amber-400" 
                                : "bg-white text-black hover:bg-neutral-200"
                            }`}
                          >
                            {editingCampaignId ? <Save size={14} /> : <Plus size={14} />}
                            <span>{editingCampaignId ? "Save Changes to Campaign" : "Publish Campaign to Editorial Portfolio"}</span>
                          </button>
                        </div>
                      </form>

                      {/* Current Campaigns List */}
                      <div className="space-y-4">
                        <div className="border-b border-neutral-900 pb-2">
                          <h4 className="font-serif-luxury text-base text-white font-light uppercase tracking-wider">
                            Manage Live Campaign Gallery ({portfolioItems.length})
                          </h4>
                          <p className="font-sans-luxury text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">Clickable editorial subpages active on website.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {portfolioItems.map((item) => (
                            <div key={item.id} className="border border-neutral-900 p-4 bg-neutral-950/20 flex space-x-4 items-center relative group">
                              <div className="w-16 h-20 bg-neutral-950 flex-shrink-0 overflow-hidden border border-neutral-900">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 font-sans-luxury">
                                <span className="font-mono text-[8px] tracking-widest text-neutral-500 uppercase block">{item.category}</span>
                                <h5 className="text-xs text-white font-semibold tracking-wide truncate">{item.title}</h5>
                                <div className="flex items-center space-x-2 mt-0.5">
                                  <span className="text-[9px] text-neutral-500 font-mono">{item.year}</span>
                                  <span className="text-[9px] text-neutral-700">•</span>
                                  <span className="text-[9px] text-neutral-400 font-mono font-bold uppercase tracking-widest flex items-center">
                                    {item.showcaseItems?.length || 0} Assets
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCampaign(item)}
                                  className={`p-2 border transition-colors cursor-pointer ${
                                    editingCampaignId === item.id 
                                      ? "text-amber-400 border-amber-500/30 bg-amber-500/10" 
                                      : "text-neutral-500 hover:text-white border-neutral-900 hover:border-neutral-800"
                                  }`}
                                  title="Edit Campaign"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCampaign(item.id)}
                                  className="text-neutral-500 hover:text-red-500 p-2 border border-neutral-900 hover:border-neutral-800 transition-colors cursor-pointer"
                                  title="Remove Campaign"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 4: PRODUCTION MENUS & SPECS */}
                  {activeTab === "pricing_specs" && (
                    <div className="space-y-10 font-sans-luxury text-neutral-300">
                      
                      {/* Flat Pricing & Fixed Add-on Config */}
                      <div className="space-y-6 border border-neutral-900 p-5 bg-neutral-950/40 rounded-sm">
                        <div className="border-b border-neutral-900 pb-3">
                          <h4 className="font-serif-luxury text-base text-white font-light uppercase tracking-wider">
                            Flat Rate & Fixed Add-on Pricing
                          </h4>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                            Set the base product look price and the flat surcharge rates for extra casting, locations, or video assets.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {/* 1. Base Price */}
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold font-mono">
                              Base Price per Product Look ($)
                            </label>
                            <input
                              type="number"
                              required
                              value={localBasePrice}
                              onChange={(e) => setLocalBasePrice(Math.max(0, parseInt(e.target.value) || 0))}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-mono"
                            />
                          </div>

                          {/* 2. Extra Model Price */}
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold font-mono">
                              Extra Model Casting Surcharge ($)
                            </label>
                            <input
                              type="number"
                              required
                              value={localExtraModelPrice}
                              onChange={(e) => setLocalExtraModelPrice(Math.max(0, parseInt(e.target.value) || 0))}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-mono"
                            />
                          </div>

                          {/* 3. Extra Location Price */}
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold font-mono">
                              Multi-Location Campaign Surcharge ($)
                            </label>
                            <input
                              type="number"
                              required
                              value={localExtraLocationPrice}
                              onChange={(e) => setLocalExtraLocationPrice(Math.max(0, parseInt(e.target.value) || 0))}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-mono"
                            />
                          </div>

                          {/* 4. Video Price */}
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold font-mono">
                              Cinematic Short Video Surcharge ($)
                            </label>
                            <input
                              type="number"
                              required
                              value={localVideoPrice}
                              onChange={(e) => setLocalVideoPrice(Math.max(0, parseInt(e.target.value) || 0))}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              onUpdatePricingRates({
                                basePrice: localBasePrice,
                                extraModelPrice: localExtraModelPrice,
                                extraLocationPrice: localExtraLocationPrice,
                                videoPrice: localVideoPrice
                              });
                              triggerSaveToast("Flat pricing rates successfully saved.");
                            }}
                            className="w-full bg-white text-black font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-3 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <Save size={12} />
                            <span>Save Pricing Surcharges</span>
                          </button>
                        </div>
                      </div>

                      {/* Service Tiers Editor */}
                      <div className="space-y-8">
                        <div className="border-b border-neutral-900 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h4 className="font-serif-luxury text-lg text-white font-light uppercase tracking-wider">
                              Production Tiers & Investment Levels
                            </h4>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                              Modify investment levels, volume capacities, suitability text, and deliverables for each production level.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newId = `tier-${Date.now()}`;
                              const newTier: ServiceTier = {
                                id: newId,
                                name: `Atelier ${localTiers.length + 1}`,
                                tagline: "DIGITAL SHOWCASE SERVICE",
                                volume: "Custom Scope",
                                deliverables: [
                                  "Custom HD Editorial Renders",
                                  "Standard Scene Optimization"
                                ],
                                timeline: "Custom Timeline",
                                idealFor: "Premium luxury partners with highly bespoke creative needs.",
                                priceEstimate: "Upon Request"
                              };
                              setLocalTiers([...localTiers, newTier]);
                            }}
                            className="inline-flex items-center space-x-1.5 text-[10px] text-white border border-neutral-800 hover:border-white px-3 py-2 transition-colors cursor-pointer uppercase font-sans-luxury tracking-widest self-start sm:self-center"
                          >
                            <Plus size={12} />
                            <span>Add New Tier</span>
                          </button>
                        </div>

                        {localTiers.map((tier, tIdx) => (
                          <div key={tier.id} className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4">
                            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                              <span className="font-mono text-[9px] text-neutral-400 tracking-widest block uppercase font-bold">
                                TIER LEVEL 0{tIdx + 1} - {tier.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (localTiers.length <= 1) {
                                    alert("You must retain at least one production tier.");
                                    return;
                                  }
                                  if (window.confirm(`Are you sure you want to delete "${tier.name}"?`)) {
                                    setLocalTiers(localTiers.filter(t => t.id !== tier.id));
                                  }
                                }}
                                className="text-neutral-500 hover:text-red-500 transition-colors flex items-center space-x-1 cursor-pointer text-[10px] tracking-widest uppercase font-mono"
                              >
                                <Trash2 size={12} />
                                <span>Delete Tier</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Tier Name</label>
                                <input
                                  type="text"
                                  value={tier.name}
                                  onChange={(e) => {
                                    const next = [...localTiers];
                                    next[tIdx].name = e.target.value;
                                    setLocalTiers(next);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                                />
                              </div>

                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Investment Pricing</label>
                                <input
                                  type="text"
                                  value={tier.priceEstimate}
                                  onChange={(e) => {
                                    const next = [...localTiers];
                                    next[tIdx].priceEstimate = e.target.value;
                                    setLocalTiers(next);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                                />
                              </div>

                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Tagline Description</label>
                                <input
                                  type="text"
                                  value={tier.tagline}
                                  onChange={(e) => {
                                    const next = [...localTiers];
                                    next[tIdx].tagline = e.target.value;
                                    setLocalTiers(next);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                                />
                              </div>

                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Timeline Duration</label>
                                <input
                                  type="text"
                                  value={tier.timeline}
                                  onChange={(e) => {
                                    const next = [...localTiers];
                                    next[tIdx].timeline = e.target.value;
                                    setLocalTiers(next);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                                />
                              </div>

                              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Volume Capacity Info</label>
                                <input
                                  type="text"
                                  value={tier.volume}
                                  onChange={(e) => {
                                    const next = [...localTiers];
                                    next[tIdx].volume = e.target.value;
                                    setLocalTiers(next);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                                />
                              </div>

                              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Deliverables (comma separated)</label>
                                <textarea
                                  rows={3}
                                  value={tier.deliverables.join(", ")}
                                  onChange={(e) => {
                                    const list = e.target.value.split(",").map(item => item.trim()).filter(item => item !== "");
                                    const next = [...localTiers];
                                    next[tIdx].deliverables = list;
                                    setLocalTiers(next);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light leading-relaxed font-mono"
                                />
                              </div>

                              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400">Ideal Suitability Copy</label>
                                <input
                                  type="text"
                                  value={tier.idealFor}
                                  onChange={(e) => {
                                    const next = [...localTiers];
                                    next[tIdx].idealFor = e.target.value;
                                    setLocalTiers(next);
                                  }}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Save Button for services tiers */}
                      <button
                        onClick={saveServicesAndSpecs}
                        className="w-full bg-white text-black font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-4.5 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Save Production Tiers Changes</span>
                      </button>

                    </div>
                  )}

                  {/* TAB 5: DATABASE SETUP */}
                  {activeTab === "database_setup" && (
                    <div className="space-y-6 text-neutral-200">
                      
                      {/* Active Connection Status Header */}
                      <div className="border border-neutral-900 bg-neutral-950/60 p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">
                            Current Connection
                          </span>
                          <h4 className="font-serif-luxury text-lg text-white font-light tracking-wide flex items-center gap-2">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full animate-pulse ${
                              dbConfig.projectId === "magnificent-technique-c3bk6" ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                            {dbConfig.projectId === "magnificent-technique-c3bk6" ? (
                              <span>PREVIEW SANDBOX (Read-Only Rules)</span>
                            ) : (
                              <span>CUSTOM PROJECT: <strong className="text-white font-mono">{dbConfig.projectId}</strong></span>
                            )}
                          </h4>
                          <p className="font-mono text-[9px] text-neutral-500 mt-1 uppercase tracking-widest">
                            Database ID: <span className="text-neutral-400">{dbConfig.databaseId || "(default)"}</span> | Storage: <span className="text-neutral-400">{dbConfig.storageBucket || "None"}</span>
                          </p>
                        </div>

                        {dbConfig.projectId !== "magnificent-technique-c3bk6" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Switch back to the pre-configured AI Studio Sandbox database? This will clear your custom config.")) {
                                localStorage.removeItem("vfs_custom_firebase_config");
                                window.location.reload();
                              }
                            }}
                            className="text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-500 px-3 py-1.5 transition-colors cursor-pointer text-[10px] tracking-widest uppercase font-sans-luxury"
                          >
                            Reset to Sandbox
                          </button>
                        )}
                      </div>

                      {/* Firebase Auth Session Manager Card */}
                      <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4">
                        <div className="flex items-center space-x-2 border-b border-neutral-900 pb-3">
                          <Shield size={14} className="text-white" />
                          <span className="font-mono text-[9px] text-white tracking-widest block uppercase font-bold">
                            Firebase Authentication Session
                          </span>
                        </div>

                        {firebaseUser ? (
                          <div className="space-y-4 font-sans-luxury">
                            <div className="flex items-center justify-between p-3.5 bg-neutral-900/40 border border-neutral-900 rounded-sm">
                              <div>
                                <span className="font-mono text-[8px] tracking-widest text-emerald-500 uppercase block mb-1">
                                  ● ACTIVE AUTHENTICATED SESSION
                                </span>
                                <p className="text-xs text-white">
                                  {firebaseUser.isAnonymous ? (
                                    <span>Signed In Anonymously (UID: <code className="text-neutral-400 font-mono text-[11px]">{firebaseUser.uid.slice(0, 8)}...</code>)</span>
                                  ) : (
                                    <span>Logged In: <strong className="text-white font-medium">{firebaseUser.email}</strong></span>
                                  )}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await signOut(auth);
                                    triggerSaveToast("Signed out from Firebase Auth.");
                                    loadInquiries();
                                  } catch (err: any) {
                                    setFirebaseAuthError(err.message || "Failed to sign out");
                                  }
                                }}
                                className="text-neutral-400 hover:text-red-500 border border-neutral-800 hover:border-red-950/60 px-3 py-1.5 text-[9px] font-sans-luxury tracking-widest uppercase transition-colors rounded-sm cursor-pointer"
                              >
                                Sign Out
                              </button>
                            </div>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-relaxed">
                              You are authenticated with your active Firebase project. Your Firestore and Storage requests now transmit a valid auth token to comply with your rules.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-relaxed">
                              Your database security rules restrict access to authenticated owners. Enter your owner credentials or authenticate anonymously to view inquiries and update CMS sections.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Email Address</label>
                                <input
                                  type="email"
                                  value={firebaseEmail}
                                  placeholder="owner@vueatelier.com"
                                  onChange={(e) => setFirebaseEmail(e.target.value)}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                                />
                              </div>

                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Password</label>
                                <input
                                  type="password"
                                  value={firebasePassword}
                                  placeholder="••••••••"
                                  onChange={(e) => setFirebasePassword(e.target.value)}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                                />
                              </div>
                            </div>

                            {firebaseAuthError && (
                              <p className="font-mono text-[9px] tracking-widest text-red-500 bg-red-950/10 border border-red-950/40 p-2.5 rounded-sm uppercase">
                                {firebaseAuthError}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!firebaseEmail || !firebasePassword) {
                                    setFirebaseAuthError("Email and Password are required.");
                                    return;
                                  }
                                  setFirebaseAuthError("");
                                  try {
                                    await signInWithEmailAndPassword(auth, firebaseEmail, firebasePassword);
                                    triggerSaveToast("Admin session authenticated successfully!");
                                    loadInquiries();
                                  } catch (err: any) {
                                    setFirebaseAuthError(err.message || "Failed to sign in.");
                                  }
                                }}
                                className="bg-white text-black font-sans-luxury text-[9px] tracking-widest uppercase font-bold py-3 hover:bg-neutral-200 transition-colors cursor-pointer text-center"
                              >
                                Sign In Admin
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  if (!firebaseEmail || !firebasePassword) {
                                    setFirebaseAuthError("Specify Email & Password to register a new admin account.");
                                    return;
                                  }
                                  if (firebasePassword.length < 6) {
                                    setFirebaseAuthError("Password must be at least 6 characters.");
                                    return;
                                  }
                                  setFirebaseAuthError("");
                                  try {
                                    await createUserWithEmailAndPassword(auth, firebaseEmail, firebasePassword);
                                    triggerSaveToast("New Admin successfully created & authenticated!");
                                    loadInquiries();
                                  } catch (err: any) {
                                    setFirebaseAuthError(err.message || "Registration failed.");
                                  }
                                }}
                                className="bg-transparent text-white border border-neutral-800 hover:border-neutral-500 font-sans-luxury text-[9px] tracking-widest uppercase py-3 transition-colors cursor-pointer text-center"
                              >
                                Register Admin
                              </button>
                            </div>

                            <div className="relative flex py-1 items-center">
                              <div className="flex-grow border-t border-neutral-900"></div>
                              <span className="flex-shrink mx-4 text-neutral-600 font-mono text-[8px] uppercase tracking-widest">or</span>
                              <div className="flex-grow border-t border-neutral-900"></div>
                            </div>

                            <button
                              type="button"
                              onClick={async () => {
                                setFirebaseAuthError("");
                                try {
                                  await signInAnonymously(auth);
                                  triggerSaveToast("Signed in anonymously! Context established.");
                                  loadInquiries();
                                } catch (err: any) {
                                  setFirebaseAuthError(err.message || "Anonymous sign in failed.");
                                }
                              }}
                              className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white font-sans-luxury text-[9px] tracking-widest uppercase py-3 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <span>Sign In Anonymously</span>
                            </button>
                            <p className="text-[9px] text-neutral-500 font-mono uppercase text-center tracking-wider">
                              (Make sure "Anonymous Provider" is enabled under Build &gt; Authentication &gt; Sign-in method in Firebase Console)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Quick JSON Paste Helper */}
                      <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-3">
                        <span className="font-mono text-[9px] text-neutral-400 tracking-widest block uppercase font-bold">
                          ★ AUTOMATIC CONFIG IMPORT
                        </span>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                          Paste your Firebase Web Configuration JSON object directly from the Firebase Console (Settings &gt; General &gt; Your apps) to populate all fields automatically.
                        </p>
                        <textarea
                          rows={3}
                          placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "...",\n  "projectId": "..."\n}`}
                          onChange={(e) => {
                            try {
                              const val = e.target.value.trim();
                              if (!val) return;
                              // Clean potential variable wrappers if pasted with JS code (e.g. const firebaseConfig = { ... };)
                              const cleaned = val
                                .replace(/const\s+firebaseConfig\s*=\s*/gi, "")
                                .replace(/let\s+firebaseConfig\s*=\s*/gi, "")
                                .replace(/var\s+firebaseConfig\s*=\s*/gi, "")
                                .replace(/;/g, "");
                              
                              // Parse as JavaScript object loosely
                              // If it's valid JSON, JSON.parse works, otherwise we can eval cleanly
                              let parsed: any = null;
                              try {
                                parsed = JSON.parse(cleaned);
                              } catch {
                                // loose parse via Function wrapper
                                parsed = new Function(`return ${cleaned}`)();
                              }

                              if (parsed && typeof parsed === "object") {
                                setDbConfig({
                                  apiKey: parsed.apiKey || "",
                                  authDomain: parsed.authDomain || "",
                                  projectId: parsed.projectId || "",
                                  storageBucket: parsed.storageBucket || "",
                                  messagingSenderId: parsed.messagingSenderId || "",
                                  appId: parsed.appId || "",
                                  databaseId: parsed.databaseId || parsed.firestoreDatabaseId || "(default)"
                                });
                                triggerSaveToast("Firebase config successfully parsed and imported below!");
                              }
                            } catch (err) {
                              console.error("JSON parsing error:", err);
                            }
                          }}
                          className="w-full bg-black border border-neutral-800 rounded-sm text-xs font-mono text-neutral-300 p-3 focus:border-white focus:outline-none focus:ring-0 placeholder-neutral-700"
                        />
                      </div>

                      {/* Fields Form */}
                      <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4">
                        <span className="font-mono text-[9px] text-neutral-400 tracking-widest block uppercase font-bold">
                          MANUAL CONNECTION PARAMETERS
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Project ID</label>
                            <input
                              type="text"
                              value={dbConfig.projectId}
                              placeholder="e.g. vue-fashion-studio"
                              onChange={(e) => setDbConfig({ ...dbConfig, projectId: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">API Key</label>
                            <input
                              type="password"
                              value={dbConfig.apiKey}
                              placeholder="AIzaSy..."
                              onChange={(e) => setDbConfig({ ...dbConfig, apiKey: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Auth Domain</label>
                            <input
                              type="text"
                              value={dbConfig.authDomain}
                              placeholder="vue-fashion-studio.firebaseapp.com"
                              onChange={(e) => setDbConfig({ ...dbConfig, authDomain: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Storage Bucket</label>
                            <input
                              type="text"
                              value={dbConfig.storageBucket}
                              placeholder="vue-fashion-studio.firebasestorage.app"
                              onChange={(e) => setDbConfig({ ...dbConfig, storageBucket: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">App ID</label>
                            <input
                              type="text"
                              value={dbConfig.appId}
                              placeholder="1:1056815593475:web:..."
                              onChange={(e) => setDbConfig({ ...dbConfig, appId: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Messaging Sender ID</label>
                            <input
                              type="text"
                              value={dbConfig.messagingSenderId}
                              placeholder="1056815593475"
                              onChange={(e) => setDbConfig({ ...dbConfig, messagingSenderId: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5 sm:col-span-2">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">
                              Firestore Database Name (Optional)
                            </label>
                            <input
                              type="text"
                              value={dbConfig.databaseId}
                              placeholder="Use '(default)' unless you created a custom named database in Firestore Console"
                              onChange={(e) => setDbConfig({ ...dbConfig, databaseId: e.target.value })}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Connect Button */}
                      <button
                        onClick={() => {
                          if (!dbConfig.projectId || !dbConfig.apiKey) {
                            alert("Please provide at least a Project ID and API Key to establish a custom connection.");
                            return;
                          }
                          
                          const cleanedConfig = {
                            apiKey: dbConfig.apiKey.trim(),
                            authDomain: dbConfig.authDomain.trim(),
                            projectId: dbConfig.projectId.trim(),
                            storageBucket: dbConfig.storageBucket.trim(),
                            messagingSenderId: dbConfig.messagingSenderId.trim(),
                            appId: dbConfig.appId.trim(),
                            databaseId: dbConfig.databaseId.trim() || "(default)"
                          };

                          localStorage.setItem("vfs_custom_firebase_config", JSON.stringify(cleanedConfig));
                          
                          // Persist connection to server config
                          fetch("/api/save-studio-config", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              firebase: cleanedConfig,
                              portalPassword: savedPassword
                            })
                          })
                          .then(() => {
                            triggerSaveToast("Database connection saved to server persistently!");
                            setTimeout(() => {
                              window.location.reload();
                            }, 1200);
                          })
                          .catch((err) => {
                            console.error("Failed to save database config to server:", err);
                            triggerSaveToast("Connection saved to browser local storage.");
                            setTimeout(() => {
                              window.location.reload();
                            }, 1200);
                          });
                        }}
                        className="w-full bg-white text-black font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-4.5 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Establish Live Connection & Reload</span>
                      </button>

                      {/* Revert / Reset to Sandbox Database Option */}
                      {((window as any).__STUDIO_CONFIG__?.firebase || localStorage.getItem("vfs_custom_firebase_config")) && (
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Switch back to the pre-configured AI Studio Sandbox database? This will restore the default sandbox content.")) {
                                localStorage.removeItem("vfs_custom_firebase_config");
                                
                                // Persist removal to Server
                                fetch("/api/save-studio-config", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    firebase: null,
                                    portalPassword: savedPassword
                                  })
                                })
                                .then(() => {
                                  triggerSaveToast("Reverted to Sandbox Database!");
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 1200);
                                })
                                .catch((err) => {
                                  console.error("Failed to clear database config on server:", err);
                                  window.location.reload();
                                });
                              }
                            }}
                            className="text-neutral-500 hover:text-red-400 text-[9px] tracking-widest uppercase py-2 hover:underline cursor-pointer transition-colors"
                          >
                            Reset and Revert to Default Sandbox Database
                          </button>
                        </div>
                      )}

                      {/* Instructions / Security Rules Setup */}
                      <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4">
                        <span className="font-mono text-[9px] text-amber-500 tracking-widest block uppercase font-bold">
                          ⚠ PRODUCTION SECURITY RULES GUIDE
                        </span>
                        
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-relaxed">
                          Since your studio portal already has its own passcode protection (<strong className="text-white">"vue"</strong>), you can bypass Firebase Authentication by configuring your rules to allow unauthenticated requests.
                        </p>

                        <div className="space-y-4 pt-2 font-sans-luxury text-xs">
                          <div className="flex items-start space-x-3">
                            <span className="bg-neutral-900 border border-neutral-800 text-white font-mono w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 font-bold">1</span>
                            <div className="space-y-2">
                              <strong className="text-white tracking-wider block uppercase">Firestore Rules (Unauthenticated Mode)</strong>
                              <p className="text-[11px] text-neutral-400 leading-relaxed uppercase tracking-wide">
                                Set your Firestore rules to this block so you can load/update content and submit forms without needing to configure Firebase Auth:
                              </p>
                              <pre className="bg-black border border-neutral-900 rounded p-3 text-[10px] text-amber-500 font-mono mt-2 overflow-x-auto select-all leading-normal whitespace-pre">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 1. Inquiries: Allow reads & writes (secured client-side)
    match /inquiries/{inquiryId} {
      allow read, write: if true;
    }
    
    // 2. CMS Config: Allow reads & writes (secured client-side)
    match /cms_config/{docId} {
      allow read, write: if true;
    }
  }
}`}
                              </pre>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <span className="bg-neutral-900 border border-neutral-800 text-white font-mono w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 font-bold">2</span>
                            <div className="space-y-2">
                              <strong className="text-white tracking-wider block uppercase">Firebase Storage Rules (Unauthenticated Mode)</strong>
                              <p className="text-[11px] text-neutral-400 leading-relaxed uppercase tracking-wide">
                                Replace your Storage rules with this block to resolve image upload permission failures:
                              </p>
                              <pre className="bg-black border border-neutral-900 rounded p-3 text-[10px] text-amber-500 font-mono mt-2 overflow-x-auto select-all leading-normal whitespace-pre">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow reading and writing for visual asset updates
      allow read, write: if true;
    }
  }
}`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 5.5: STUDIO PARTNERS */}
                  {activeTab === "partners" && (
                    <div className="space-y-8 animate-fadeIn">
                      <div className="border-b border-neutral-900 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h4 className="font-serif-luxury text-lg text-white font-light uppercase tracking-wider flex items-center space-x-2">
                            <Briefcase size={18} className="text-white" />
                            <span>Editorial Partners & Client Logos</span>
                          </h4>
                          <p className="font-sans-luxury text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                            Configure, enable/disable, and edit partner fashion brand logos displayed below the Hero Slider.
                          </p>
                        </div>
                        {/* Global Enable / Disable Toggle Switch */}
                        <div className="flex items-center space-x-3 bg-neutral-950/60 px-4 py-2.5 border border-neutral-900 rounded-sm">
                          <span className="text-[9px] tracking-widest uppercase font-mono text-neutral-400">
                            MARQUEE STATUS:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePartnerLogos(!partnerLogosConfig.enabled)}
                            className={`px-3 py-1 text-[8px] font-bold tracking-widest uppercase rounded-sm transition-all cursor-pointer ${
                              partnerLogosConfig.enabled
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                                : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                            }`}
                          >
                            {partnerLogosConfig.enabled ? "✔ ENABLED" : "✖ DISABLED"}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT COLUMN: Add or Edit Form */}
                        <div id="partner-form-section" className="lg:col-span-5 space-y-4">
                          <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4 font-sans-luxury rounded-sm">
                            <h5 className="font-serif-luxury text-sm text-white uppercase tracking-widest pb-2 border-b border-neutral-900/60 flex items-center justify-between">
                              <span>{editingPartnerLogoId ? "Edit Partner Logo" : "Add Brand Logo"}</span>
                              {editingPartnerLogoId && (
                                <span className="font-mono text-[8px] text-amber-500 uppercase tracking-widest">
                                  [ EDIT MODE ]
                                </span>
                              )}
                            </h5>

                            <form onSubmit={handleAddOrEditPartnerLogo} className="space-y-4">
                              <div className="flex flex-col space-y-1.5">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">
                                  Brand / Company Name
                                </label>
                                <input
                                  type="text"
                                  value={partnerLogoName}
                                  placeholder="e.g. BALENCIAGA or VOGUE"
                                  onChange={(e) => setPartnerLogoName(e.target.value)}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wider"
                                  required
                                />
                              </div>

                              <div className="flex flex-col space-y-2">
                                <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">
                                  Brand Logo Image
                                </label>

                                <div className="grid grid-cols-3 gap-2 border border-neutral-900 bg-black/60 p-2 rounded-sm text-[8px] font-mono tracking-wider uppercase text-neutral-400">
                                  <div>
                                    <span className="text-neutral-600 block mb-0.5">FORMATS</span>
                                    <span className="text-white font-medium">PNG, SVG, WEBP</span>
                                  </div>
                                  <div>
                                    <span className="text-neutral-600 block mb-0.5">FILE SIZE</span>
                                    <span className="text-white font-medium">UNDER 2 MB</span>
                                  </div>
                                  <div>
                                    <span className="text-neutral-600 block mb-0.5">DIMENSIONS</span>
                                    <span className="text-white font-medium">500 x 250 PX (2:1)</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  {/* Custom file input */}
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          const file = e.target.files[0];
                                          try {
                                            setPartnerLogoUploadProgress(0);
                                            const downloadUrl = await uploadWithProgress(file, file.name, (p) => {
                                              setPartnerLogoUploadProgress(p);
                                            });
                                            setPartnerLogoUrl(downloadUrl);
                                            triggerSaveToast("Partner logo uploaded successfully!");
                                            setTimeout(() => setPartnerLogoUploadProgress(null), 3000);
                                          } catch (err) {
                                            console.error("Partner logo upload failed:", err);
                                            alert("Logo upload failed. Please verify storage configuration.");
                                            setPartnerLogoUploadProgress(null);
                                          }
                                        }
                                      }}
                                      className="hidden"
                                      id="partner-logo-upload-field"
                                    />
                                    <label
                                      htmlFor="partner-logo-upload-field"
                                      className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 text-[9px] tracking-widest uppercase text-white py-2 px-4 hover:bg-neutral-800 cursor-pointer font-bold h-[34px] rounded-sm"
                                    >
                                      <Upload size={12} />
                                      <span>Upload Image File</span>
                                    </label>
                                  </div>

                                  <span className="text-[9px] text-neutral-500 uppercase font-mono">or paste URL below</span>
                                </div>

                                {/* Upload Progress Bar */}
                                {partnerLogoUploadProgress !== null && (
                                  <div className="mt-2 space-y-1">
                                    <div className="w-full bg-neutral-900 h-1 rounded-sm overflow-hidden relative">
                                      <div 
                                        className="bg-white h-full transition-all duration-300"
                                        style={{ width: `${partnerLogoUploadProgress}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-[8px] text-neutral-400 block tracking-widest uppercase">
                                      UPLOADING LOGO: {partnerLogoUploadProgress}%
                                    </span>
                                  </div>
                                )}

                                <input
                                  type="url"
                                  value={partnerLogoUrl}
                                  placeholder="https://... or upload from left"
                                  onChange={(e) => setPartnerLogoUrl(e.target.value)}
                                  className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light tracking-wider"
                                />

                                <p className="text-[8px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                                  If no image is uploaded/provided, the system will render a highly polished text-brand display using customized luxury editorial typography.
                                </p>
                              </div>

                              {/* Logo Thumbnail Preview */}
                              {partnerLogoUrl && (
                                <div className="mt-2 flex items-center space-x-3 border-t border-neutral-900/60 pt-3">
                                  <div className="w-14 h-10 bg-neutral-900 border border-neutral-800 overflow-hidden rounded-sm flex items-center justify-center p-1 flex-shrink-0">
                                    <img src={partnerLogoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                  </div>
                                  <div className="font-mono text-[8px] tracking-widest uppercase space-y-0.5 text-neutral-400">
                                    <span className="text-emerald-400 font-bold block">✓ CUSTOM LOGO DETECTED</span>
                                    <span className="block truncate max-w-[180px]">{partnerLogoUrl}</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                <button
                                  type="submit"
                                  className="flex-1 bg-white text-black font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-3 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer rounded-sm"
                                >
                                  {editingPartnerLogoId ? <Save size={12} /> : <Plus size={12} />}
                                  <span>{editingPartnerLogoId ? "Update Logo" : "Add Brand"}</span>
                                </button>

                                {editingPartnerLogoId && (
                                  <button
                                    type="button"
                                    onClick={handleCancelEditPartnerLogo}
                                    className="px-4 bg-transparent border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white font-sans-luxury text-[10px] tracking-widest uppercase transition-colors cursor-pointer rounded-sm"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </form>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Interactive Grid List of Existing Logos */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="border border-neutral-900 p-5 bg-neutral-950/40 rounded-sm space-y-3">
                            <h5 className="font-serif-luxury text-sm text-white uppercase tracking-widest pb-2 border-b border-neutral-900/60">
                              Partner Registry List ({partnerLogosConfig?.logos?.length || 0})
                            </h5>

                            {(!partnerLogosConfig?.logos || partnerLogosConfig.logos.length === 0) ? (
                              <p className="text-[10px] text-neutral-500 uppercase tracking-widest text-center py-10 font-sans-luxury">
                                No partners currently added. Add a brand to get started.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1">
                                {partnerLogosConfig.logos.map((logo) => (
                                  <div
                                    key={logo.id}
                                    className="border border-neutral-900 bg-neutral-950/60 p-3 flex items-center justify-between rounded-sm transition-all hover:border-neutral-800"
                                  >
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                      {logo.logoUrl ? (
                                        <div className="w-12 h-8 bg-neutral-900 border border-neutral-800/80 rounded-sm p-1 flex items-center justify-center flex-shrink-0">
                                          <img
                                            src={logo.logoUrl}
                                            alt={logo.name}
                                            className="max-w-full max-h-full object-contain grayscale"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-12 h-8 bg-neutral-900 border border-neutral-800/80 rounded-sm flex items-center justify-center flex-shrink-0 text-[8px] font-bold tracking-widest text-neutral-400 font-serif-luxury">
                                          TEXT
                                        </div>
                                      )}
                                      <div className="overflow-hidden">
                                        <span className="font-serif-luxury text-xs text-white uppercase font-light block truncate max-w-[120px]">
                                          {logo.name}
                                        </span>
                                        <span className="font-mono text-[8px] text-neutral-500 uppercase tracking-widest block">
                                          {logo.logoUrl ? "Image Custom Logo" : "Typographic Display"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Edit / Delete CTA */}
                                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditPartnerLogo(logo)}
                                        className="p-1.5 text-neutral-500 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900 rounded-sm"
                                        title="Edit partner"
                                      >
                                        <Edit size={10} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePartnerLogo(logo.id)}
                                        className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer border border-transparent hover:border-neutral-900/40 bg-neutral-900/30 hover:bg-neutral-950 rounded-sm"
                                        title="Delete partner"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5.75: PRE-PRODUCTION PREPARATION */}
                  {activeTab === "pre_production" && (
                    <div className="space-y-8 animate-fadeIn">
                      <div className="border-b border-neutral-900 pb-3">
                        <h4 className="font-serif-luxury text-lg text-white font-light uppercase tracking-wider flex items-center space-x-2">
                          <FileText size={18} className="text-white" />
                          <span>Pre-Production Preparation Editor</span>
                        </h4>
                        <p className="font-sans-luxury text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                          Fully customize the client guide, pre-production guidelines checklist, and master calibration reference images.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* 1. SECTION TITLES */}
                        <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4 rounded-sm font-sans-luxury">
                          <h5 className="font-serif-luxury text-sm text-white uppercase tracking-widest pb-1 border-b border-neutral-900/60">
                            Section Titles & Intro
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1.5">
                              <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Subtitle Indicator</label>
                              <input
                                type="text"
                                value={preProdSubtitle}
                                onChange={(e) => setPreProdSubtitle(e.target.value)}
                                className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wide"
                                placeholder="03 / PRE-PRODUCTION PREPARATION"
                              />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                              <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Main Title</label>
                              <input
                                type="text"
                                value={preProdTitle}
                                onChange={(e) => setPreProdTitle(e.target.value)}
                                className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wide"
                                placeholder="The Production Brief: Preparing Your Assets"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Intro Text / Overview</label>
                            <textarea
                              rows={3}
                              value={preProdIntroText}
                              onChange={(e) => setPreProdIntroText(e.target.value)}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wide leading-relaxed"
                              placeholder="To create a hyper-realistic digital twin..."
                            />
                          </div>
                        </div>

                        {/* Downloadable Production Brief File */}
                        <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4 rounded-sm font-sans-luxury">
                          <h5 className="font-serif-luxury text-sm text-white uppercase tracking-widest pb-1 border-b border-neutral-900/60">
                            Downloadable Production Brief File / Guide
                          </h5>
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">
                            Upload a PDF guide or brief image. When a client clicks the download button on the main site, this file will be downloaded to their device.
                          </p>

                          {preProdDownloadBriefUrl && (
                            <div className="p-3 border border-neutral-900 bg-neutral-950/60 rounded-sm flex items-center justify-between">
                              <div className="flex items-center space-x-3 min-w-0">
                                <FileText className="text-white flex-shrink-0" size={16} />
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-white uppercase tracking-wider block truncate">
                                    {preProdDownloadBriefFilename || "Uploaded Brief File"}
                                  </span>
                                  <a 
                                    href={preProdDownloadBriefUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-neutral-500 hover:text-white uppercase tracking-widest font-mono underline"
                                  >
                                    View File
                                  </a>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setPreProdDownloadBriefUrl("");
                                  setPreProdDownloadBriefFilename("");
                                }}
                                className="text-neutral-500 hover:text-red-500 p-2 border border-neutral-900 hover:border-neutral-800 transition-colors cursor-pointer rounded-sm"
                                title="Remove Brief File"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="file"
                                accept="application/pdf,image/*"
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    await handlePreProdBriefUpload(e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                                id="preprod-brief-upload"
                              />
                              <label
                                htmlFor="preprod-brief-upload"
                                className="flex items-center justify-center space-x-1.5 bg-neutral-900 border border-neutral-850 text-[8px] tracking-widest uppercase text-white py-2 px-3 hover:bg-neutral-800 cursor-pointer text-center font-bold h-[32px] w-full rounded-sm"
                              >
                                <Upload size={10} />
                                <span>Upload PDF or Image Brief</span>
                              </label>
                            </div>

                            {preProdBriefUploadProgress !== null && (
                              <div className="space-y-1">
                                <div className="w-full bg-neutral-900 h-1 rounded-sm overflow-hidden relative">
                                  <div 
                                    className="bg-white h-full transition-all duration-300"
                                    style={{ width: `${preProdBriefUploadProgress}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[7px] text-neutral-400 block tracking-widest uppercase">
                                  UPLOADING: {preProdBriefUploadProgress}%
                                </span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col space-y-1">
                                <label className="text-[8px] tracking-widest uppercase text-neutral-500 font-mono">Or paste brief URL</label>
                                <input
                                  type="url"
                                  value={preProdDownloadBriefUrl || ""}
                                  placeholder="https://..."
                                  onChange={(e) => setPreProdDownloadBriefUrl(e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-850 text-[10px] text-white px-2 py-2 focus:border-white focus:outline-none font-mono"
                                />
                              </div>
                              <div className="flex flex-col space-y-1">
                                <label className="text-[8px] tracking-widest uppercase text-neutral-500 font-mono">Custom Filename (e.g. guide.pdf)</label>
                                <input
                                  type="text"
                                  value={preProdDownloadBriefFilename || ""}
                                  placeholder="Vue_Production_Brief.pdf"
                                  onChange={(e) => setPreProdDownloadBriefFilename(e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-850 text-[10px] text-white px-2 py-2 focus:border-white focus:outline-none font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. CALIBRATION WHY CALLOUT */}
                        <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4 rounded-sm font-sans-luxury">
                          <h5 className="font-serif-luxury text-sm text-white uppercase tracking-widest pb-1 border-b border-neutral-900/60">
                            "The Calibration Why" Quote Card
                          </h5>
                          
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Callout Quote / Testimonial</label>
                            <textarea
                              rows={2}
                              value={preProdQuote}
                              onChange={(e) => setPreProdQuote(e.target.value)}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light italic tracking-wide leading-relaxed"
                              placeholder="To ensure our editorial renders are indistinguishable..."
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Quote Author / Signature</label>
                            <input
                              type="text"
                              value={preProdAuthor}
                              onChange={(e) => setPreProdAuthor(e.target.value)}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wide"
                              placeholder="— Atelier Director, VUE Studio"
                            />
                          </div>
                        </div>

                        {/* 3. MASTER DETAIL SHOT EXAMPLE SLIDER IMAGES (3 IMAGES) */}
                        <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-6 rounded-sm font-sans-luxury">
                          <div>
                            <h5 className="font-serif-luxury text-sm text-white uppercase tracking-widest pb-1 border-b border-neutral-900/60">
                              Master Detail Shot Examples (Slider Images)
                            </h5>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">Provide up to 3 high-quality full color reference images to render inside the dynamic carousel.</p>
                            
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-b border-neutral-900/60 py-2.5 font-mono text-[8px] tracking-widest uppercase text-neutral-400">
                              <div>
                                <span className="text-neutral-500 block mb-0.5">FILE FORMATS</span>
                                <span className="text-white font-medium">JPEG, PNG, WEBP</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 block mb-0.5">RECOMMENDED SIZE</span>
                                <span className="text-white font-medium">MAX 5 MB PER FILE</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 block mb-0.5">TARGET DIMENSION</span>
                                <span className="text-white font-medium">1200 x 900 PX (4:3)</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((idx) => (
                              <div key={idx} className="space-y-3 p-3.5 border border-neutral-900 bg-black/40 rounded-sm relative">
                                <span className="font-mono text-[8px] text-neutral-400 block tracking-widest uppercase font-bold">IMAGE SPOT {idx + 1}</span>
                                
                                {preProdImages[idx] && (
                                  <div className="w-full aspect-[4/3] bg-neutral-950 border border-neutral-900 overflow-hidden rounded-sm relative">
                                    <img 
                                      src={preProdImages[idx]} 
                                      alt={`Preview spot ${idx + 1}`} 
                                      className="w-full h-full object-cover" 
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = [...preProdImages];
                                        next[idx] = "";
                                        setPreProdImages(next);
                                      }}
                                      className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black text-red-400 rounded-sm border border-neutral-900 cursor-pointer"
                                      title="Remove image"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          await handlePreProdImageUpload(idx, e.target.files[0]);
                                        }
                                      }}
                                      className="hidden"
                                      id={`preprod-upload-${idx}`}
                                    />
                                    <label
                                      htmlFor={`preprod-upload-${idx}`}
                                      className="flex items-center justify-center space-x-1.5 bg-neutral-900 border border-neutral-850 text-[8px] tracking-widest uppercase text-white py-2 px-3 hover:bg-neutral-800 cursor-pointer text-center font-bold h-[32px] w-full rounded-sm"
                                    >
                                      <Upload size={10} />
                                      <span>Upload Spot {idx + 1}</span>
                                    </label>
                                  </div>

                                  {preProdImageUploadProgress[idx] !== undefined && preProdImageUploadProgress[idx] !== null && (
                                    <div className="space-y-1">
                                      <div className="w-full bg-neutral-900 h-1 rounded-sm overflow-hidden relative">
                                        <div 
                                          className="bg-white h-full transition-all duration-300"
                                          style={{ width: `${preProdImageUploadProgress[idx]}%` }}
                                        />
                                      </div>
                                      <span className="font-mono text-[7px] text-neutral-400 block tracking-widest uppercase">
                                        UPLOADING: {preProdImageUploadProgress[idx]}%
                                      </span>
                                    </div>
                                  )}

                                  <input
                                    type="url"
                                    value={preProdImages[idx] || ""}
                                    placeholder="or paste image URL"
                                    onChange={(e) => {
                                      const next = [...preProdImages];
                                      next[idx] = e.target.value;
                                      setPreProdImages(next);
                                    }}
                                    className="w-full bg-neutral-950 border border-neutral-850 text-[10px] text-white px-2 py-1.5 focus:border-white focus:outline-none font-mono"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 4. CHECKLIST STEPS */}
                        <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-6 rounded-sm font-sans-luxury">
                          <div className="border-b border-neutral-900 pb-2">
                            <h5 className="font-serif-luxury text-sm text-white uppercase tracking-widest flex items-center justify-between">
                              <span>Checklist Steps ({preProdSteps.length})</span>
                            </h5>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">Configure individual photoshoot preparation checklist cards displayed on the front screen.</p>
                          </div>

                          {/* Existing steps list */}
                          <div className="space-y-3">
                            {preProdSteps.length === 0 ? (
                              <p className="text-neutral-500 text-xs italic">No checklist steps defined. Add a step below.</p>
                            ) : (
                              preProdSteps.map((step, sIdx) => (
                                <div key={step.id || sIdx} className="flex items-center justify-between p-3.5 border border-neutral-900 bg-neutral-950/60 rounded-sm">
                                  <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-mono text-[10px] text-neutral-400">Step {sIdx + 1}</span>
                                      <span className="text-neutral-700">•</span>
                                      <h6 className="text-xs font-bold text-white uppercase tracking-wider truncate">{step.title}</h6>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2">{step.description}</p>
                                  </div>

                                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditPreProdStep(step)}
                                      className={`p-2 border transition-colors cursor-pointer rounded-sm ${
                                        editingStepId === step.id 
                                          ? "text-amber-400 border-amber-500/30 bg-amber-500/10" 
                                          : "text-neutral-500 hover:text-white border-neutral-900 hover:border-neutral-800"
                                      }`}
                                      title="Edit Step"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePreProdStep(step.id)}
                                      className="text-neutral-500 hover:text-red-500 p-2 border border-neutral-900 hover:border-neutral-800 transition-colors cursor-pointer rounded-sm"
                                      title="Remove Step"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Step Form */}
                          <div className="p-4 border border-neutral-900 bg-black/30 rounded-sm space-y-4">
                            <span className="font-mono text-[8px] text-neutral-400 block tracking-widest uppercase font-bold">
                              {editingStepId ? "[ EDITING PRE-PRODUCTION STEP ]" : "[ ADD A NEW PRE-PRODUCTION STEP ]"}
                            </span>

                            <form onSubmit={handleSavePreProdStep} className="space-y-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                  <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Step Title</label>
                                  <input
                                    type="text"
                                    value={stepFormTitle}
                                    placeholder="e.g. Texture & Material Accuracy"
                                    onChange={(e) => setStepFormTitle(e.target.value)}
                                    className="bg-neutral-950 border border-neutral-850 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light"
                                  />
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                  <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Step Description</label>
                                  <textarea
                                    rows={2}
                                    value={stepFormDesc}
                                    placeholder="Describe material reference captured under neutral lightings..."
                                    onChange={(e) => setStepFormDesc(e.target.value)}
                                    className="bg-neutral-950 border border-neutral-850 text-xs text-white px-3 py-2 focus:border-white focus:outline-none font-light leading-relaxed"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2">
                                {editingStepId && (
                                  <button
                                    type="button"
                                    onClick={handleCancelEditPreProdStep}
                                    className="px-4 py-2 border border-neutral-800 hover:bg-neutral-900 text-[10px] tracking-widest uppercase text-white font-bold transition-all cursor-pointer rounded-sm"
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  type="submit"
                                  className="px-5 py-2 bg-white text-black hover:bg-neutral-200 text-[10px] tracking-widest uppercase font-bold transition-all cursor-pointer rounded-sm"
                                >
                                  {editingStepId ? "Update Step" : "Add Step Card"}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>

                        {/* SAVE ALL CHANGES BUTTON */}
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={handleSavePreProductionConfig}
                            className="w-full bg-white text-black font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-4.5 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer rounded-sm"
                          >
                            <Save size={14} />
                            <span>Save Complete Pre-Production Guide</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5.9: EMAIL & SMTP SETTINGS */}
                  {activeTab === "smtp_config" && (
                    <div className="space-y-8 animate-fadeIn">
                      <div className="border-b border-neutral-900 pb-3">
                        <h4 className="font-serif-luxury text-lg text-white font-light uppercase tracking-wider flex items-center space-x-2">
                          <Mail size={18} className="text-white" />
                          <span>SMTP Email Engine Configuration</span>
                        </h4>
                        <p className="font-sans-luxury text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                          Configure dynamic SMTP credentials to send instant photoshoot notifications and beautiful client auto-responders.
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4 rounded-sm font-sans-luxury">
                          <h5 className="font-serif-luxury text-sm text-white uppercase tracking-widest pb-1 border-b border-neutral-900/60">
                            SMTP server credentials
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1.5">
                              <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">SMTP Host *</label>
                              <input
                                type="text"
                                value={smtpHost}
                                onChange={(e) => setSmtpHost(e.target.value)}
                                className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wide"
                                placeholder="e.g. smtp.gmail.com"
                                required
                              />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                              <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">SMTP Port *</label>
                              <input
                                type="number"
                                value={smtpPort}
                                onChange={(e) => setSmtpPort(parseInt(e.target.value) || 0)}
                                className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wide"
                                placeholder="e.g. 465 or 587"
                                required
                              />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                              <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">SMTP Username / Email *</label>
                              <input
                                type="text"
                                value={smtpUsername}
                                onChange={(e) => setSmtpUsername(e.target.value)}
                                className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wide"
                                placeholder="e.g. studio@domain.com"
                                required
                              />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                              <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">SMTP Password *</label>
                              <input
                                type="password"
                                value={smtpPassword}
                                onChange={(e) => setSmtpPassword(e.target.value)}
                                className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-widest"
                                placeholder="••••••••••••"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center space-x-3 bg-neutral-950 border border-neutral-900 p-3.5 rounded-sm">
                              <input
                                type="checkbox"
                                id="smtpAuth"
                                checked={smtpAuth}
                                onChange={(e) => setSmtpAuth(e.target.checked)}
                                className="bg-neutral-900 border-neutral-800 text-white focus:ring-0 rounded-sm cursor-pointer h-4 w-4"
                              />
                              <label htmlFor="smtpAuth" className="text-[10px] tracking-widest uppercase text-neutral-300 font-mono cursor-pointer select-none">
                                SMTP Authentication Required
                              </label>
                            </div>

                            <div className="flex items-center space-x-3 bg-neutral-950 border border-neutral-900 p-3.5 rounded-sm">
                              <input
                                type="checkbox"
                                id="smtpTls"
                                checked={smtpTls}
                                onChange={(e) => setSmtpTls(e.target.checked)}
                                className="bg-neutral-900 border-neutral-800 text-white focus:ring-0 rounded-sm cursor-pointer h-4 w-4"
                              />
                              <label htmlFor="smtpTls" className="text-[10px] tracking-widest uppercase text-neutral-300 font-mono cursor-pointer select-none">
                                Use TLS / SSL Secure Connection
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="border border-neutral-900 p-5 bg-neutral-950/40 space-y-4 rounded-sm font-sans-luxury">
                          <h5 className="font-serif-luxury text-sm text-white uppercase tracking-widest pb-1 border-b border-neutral-900/60">
                            Notification routing addresses
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1.5">
                              <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">"From" Email Name / Address *</label>
                              <input
                                type="text"
                                value={smtpFromEmail}
                                onChange={(e) => setSmtpFromEmail(e.target.value)}
                                className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wide"
                                placeholder="VUE Atelier Studio <studio@domain.com>"
                                required
                              />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                              <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Atelier Notification Destination *</label>
                              <input
                                type="email"
                                value={smtpToEmail}
                                onChange={(e) => setSmtpToEmail(e.target.value)}
                                className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-wide"
                                placeholder="thevueatelier@gmail.com"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* SAVE SMTP CONFIG BUTTON */}
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={handleSaveSmtpConfig}
                            className="w-full bg-white text-black font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-4.5 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer rounded-sm"
                          >
                            <Save size={14} />
                            <span>Save SMTP Settings</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: SECURITY / PORTAL PASSWORD */}
                  {activeTab === "security" && (
                    <div className="space-y-6 max-w-lg mx-auto animate-fadeIn">
                      <div className="border border-neutral-900 p-6 bg-neutral-950/40 space-y-4 rounded-sm font-sans-luxury">
                        <div className="border-b border-neutral-900 pb-3 flex items-center justify-between">
                          <h4 className="font-serif-luxury text-base text-white font-light uppercase tracking-wider flex items-center space-x-2">
                            <Shield size={16} className="text-white" />
                            <span>Portal Password Settings</span>
                          </h4>
                          <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">[ SECURITY GATE ]</span>
                        </div>

                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-relaxed">
                          Secure the Atelier Studio Portal. Setting a custom password will override the default passcodes (<strong className="text-white">"vue"</strong> and <strong className="text-white">"studio2026"</strong>). Your password must be at least 6 characters in length.
                        </p>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] uppercase font-mono tracking-wider">
                            <span className="text-neutral-500">CURRENT STATUS</span>
                            <span className={savedPassword ? "text-emerald-400" : "text-amber-500"}>
                              {savedPassword ? "✔ CUSTOM PASSWORD ACTIVE" : "⚠ USING DEFAULT PASSCODES"}
                            </span>
                          </div>
                        </div>

                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            setPasswordFormError("");
                            setPasswordFormSuccess("");

                            // If they are setting it for the first time, or updating, we need they enter correct current password (or default)
                            if (savedPassword && currentPasswordInput !== savedPassword) {
                              setPasswordFormError("INCORRECT CURRENT PASSWORD");
                              return;
                            }
                            if (!savedPassword && currentPasswordInput !== "vue" && currentPasswordInput !== "studio2026") {
                              setPasswordFormError("CURRENT PASSWORD MUST MATCH DEFAULT CODES ('vue' OR 'studio2026')");
                              return;
                            }

                            if (newPasswordInput.length < 6) {
                              setPasswordFormError("NEW PASSWORD MUST BE AT LEAST 6 CHARACTERS");
                              return;
                            }

                            if (newPasswordInput !== confirmPasswordInput) {
                              setPasswordFormError("NEW PASSWORDS DO NOT MATCH");
                              return;
                            }

                            // All clear! Save the custom password
                            localStorage.setItem("vfs_portal_password", newPasswordInput);
                            setSavedPassword(newPasswordInput);
                            
                            // Persist to Server
                            const currentConfig = getFirebaseConfig();
                            fetch("/api/save-studio-config", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                firebase: currentConfig === defaultSandboxConfig ? null : currentConfig,
                                portalPassword: newPasswordInput
                              })
                            }).catch(err => console.error("Failed to save password to server:", err));

                            // Reset inputs
                            setCurrentPasswordInput("");
                            setNewPasswordInput("");
                            setConfirmPasswordInput("");
                            
                            setPasswordFormSuccess("PORTAL PASSWORD SUCCESSFULLY UPDATED!");
                            triggerSaveToast("Portal Security Password updated.");
                          }}
                          className="space-y-4 pt-2"
                        >
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Current Password / Default Passcode</label>
                            <input
                              type="password"
                              value={currentPasswordInput}
                              placeholder={savedPassword ? "Enter current password" : "Enter default passcode (vue or studio2026)"}
                              onChange={(e) => setCurrentPasswordInput(e.target.value)}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-widest"
                              required
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">New Password (Min 6 characters)</label>
                            <input
                              type="password"
                              value={newPasswordInput}
                              placeholder="Enter minimum 6-character password"
                              onChange={(e) => setNewPasswordInput(e.target.value)}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-widest"
                              required
                            />
                          </div>

                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] tracking-widest uppercase text-neutral-400 font-mono">Confirm New Password</label>
                            <input
                              type="password"
                              value={confirmPasswordInput}
                              placeholder="Confirm your new password"
                              onChange={(e) => setConfirmPasswordInput(e.target.value)}
                              className="bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-2.5 focus:border-white focus:outline-none font-light tracking-widest"
                              required
                            />
                          </div>

                          {passwordFormError && (
                            <p className="font-mono text-[9px] tracking-widest text-red-500 uppercase text-center bg-red-950/20 py-2 border border-red-900/40">
                              {passwordFormError}
                            </p>
                          )}

                          {passwordFormSuccess && (
                            <p className="font-mono text-[9px] tracking-widest text-emerald-400 uppercase text-center bg-emerald-950/20 py-2 border border-emerald-900/40">
                              {passwordFormSuccess}
                            </p>
                          )}

                          <button
                            type="submit"
                            className="w-full bg-white text-black font-sans-luxury text-[10px] tracking-widest uppercase font-semibold py-3.5 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <Save size={12} />
                            <span>Update Password</span>
                          </button>
                        </form>

                        {savedPassword && (
                          <div className="pt-4 border-t border-neutral-900/60">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to revert to default passcode credentials?")) {
                                  const confirmPass = prompt("Enter your current password to authorize reversion:");
                                  if (confirmPass === savedPassword) {
                                    localStorage.removeItem("vfs_portal_password");
                                    setSavedPassword(null);

                                    // Persist removal to Server
                                    const currentConfig = getFirebaseConfig();
                                    fetch("/api/save-studio-config", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        firebase: currentConfig === defaultSandboxConfig ? null : currentConfig,
                                        portalPassword: null
                                      })
                                    }).catch(err => console.error("Failed to clear password on server:", err));

                                    triggerSaveToast("Reverted to default passcodes.");
                                    setPasswordFormSuccess("REVERTED TO DEFAULT PASSCODES.");
                                    setPasswordFormError("");
                                  } else {
                                    alert("Incorrect password. Reversion denied.");
                                  }
                                }
                              }}
                              className="w-full bg-transparent text-neutral-500 hover:text-red-400 border border-neutral-900 hover:border-red-900/40 font-sans-luxury text-[9px] tracking-widest uppercase py-3 transition-colors cursor-pointer"
                            >
                              Reset and Revert to Default Passcode
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
