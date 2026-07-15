import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ServiceTier, CampaignBuilderRates } from "../types";
import DragDropUpload from "./DragDropUpload";
import { Clock, Check, Sparkles, Film, Image as ImageIcon, MapPin, Users, Upload, Trash2, Plus, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { saveInquiry, uploadCampaignAsset } from "../firebase";

const DEFAULT_SERVICE_TIERS: ServiceTier[] = [
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

interface ModelPreference {
  gender: string;
  ethnicity: string;
  size: string;
  height: string;
  age: string;
  makeup: string;
  tattoos: string;
  piercings: string;
  jewelry: string;
  images: string[];
}

const DEFAULT_MODEL_PREFERENCE: ModelPreference = {
  gender: "Female",
  ethnicity: "Diverse Casting",
  size: "Standard Sample Size",
  height: "Standard High-Fashion (175-180cm)",
  age: "Adult (20-35)",
  makeup: "Minimalist / Raw Skin",
  tattoos: "None",
  piercings: "None",
  jewelry: "None / Product-Focused",
  images: [],
};

interface LocationPreference {
  name: string;
  description: string;
  images: string[];
}

interface ProductRequest {
  name: string;
  description: string;
  images: string[];
  isBespokeModel: boolean;
  modelsList: ModelPreference[];
  activeModelIndex: number;
  productionScope: "single" | "multi";
  singleLocation: LocationPreference;
  multiLocations: LocationPreference[];
  activeLocationIndex: number;
  videoRequired: boolean;
  videoCount: number;
  videoOrientation: "portrait" | "landscape" | "both" | "mixed";
  videoPortraitCount?: number;
  videoLandscapeCount?: number;
  videoInstructions: string;
}

const createDefaultProduct = (name: string, description: string = "", images: string[] = []): ProductRequest => ({
  name,
  description,
  images,
  isBespokeModel: false,
  modelsList: [{ ...DEFAULT_MODEL_PREFERENCE }],
  activeModelIndex: 0,
  productionScope: "single",
  singleLocation: {
    name: "Signature Studio Environment",
    description: "A serene, minimalist architectural studio with soft daylighting, neutral stone textures, and dramatic shadows.",
    images: []
  },
  multiLocations: [
    {
      name: "Architectural Concrete Pavilion",
      description: "A brutalist architectural concrete pavilion by the ocean during the overcast golden hour, showcasing direct hard lighting.",
      images: []
    },
    {
      name: "High-Fashion Desert Dunes",
      description: "Vast, sweeping minimalist white sand dunes under a clear twilight sky to capture deep contrasts and fluid fabric motion.",
      images: []
    }
  ],
  activeLocationIndex: 0,
  videoRequired: false,
  videoCount: 0,
  videoOrientation: "portrait",
  videoPortraitCount: 0,
  videoLandscapeCount: 0,
  videoInstructions: ""
});

interface ServicesProps {
  tiers?: ServiceTier[];
  onRequestTier?: (scopeName: string) => void;
  campaignRates?: CampaignBuilderRates;
}

export default function Services({ tiers, onRequestTier, campaignRates }: ServicesProps) {
  const activeTiers = tiers && tiers.length > 0 ? tiers : DEFAULT_SERVICE_TIERS;

  const defaultRates: CampaignBuilderRates = {
    basePriceTier1: 2000,
    basePriceTier2: 1750,
    basePriceTier3: 1500,
    additionalModelFee: 250,
    multiLocationFee: 3500,
    videoFee: 2500,
  };

  const rates = campaignRates || defaultRates;

  // Campaign request submission states
  const [clientEmail, setClientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // High-End Campaign Production Estimator State
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([
    createDefaultProduct(
      "Signature Handbag",
      "A luxury leather handbag. We want dramatic editorial close-ups, highlighting the polished gold clasp and the fine grain of the leather. Setup with high contrast studio lighting."
    ),
    createDefaultProduct(
      "Minimalist Linen Blazer",
      "An unstructured linen blazer. Focus on capturing natural organic textures, flowing drape movement, and soft, warm daylight casting subtle shadows."
    ),
    createDefaultProduct(
      "Architectural Sunglasses",
      "Acetate frame sunglasses. Sharp product-focused shot with dramatic geometric shadows on raw concrete background, crisp glass reflections."
    )
  ]);
  const [activeProductIndex, setActiveProductIndex] = useState<number>(0);
  const looksCount = productRequests.length;

  const activeProduct = productRequests[activeProductIndex] || productRequests[0] || createDefaultProduct("Product 1");

  // Collapsible Steps State - Neat & Tidy
  const [isProductBuilderOpen, setIsProductBuilderOpen] = useState<boolean>(false);
  const [isModelCurationOpen, setIsModelCurationOpen] = useState<boolean>(false);
  const [isProductionScopeOpen, setIsProductionScopeOpen] = useState<boolean>(false);
  const [isOutputRequirementsOpen, setIsOutputRequirementsOpen] = useState<boolean>(false);

  const handleSingleLocationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    
    files.slice(0, 3 - activeProduct.singleLocation.images.length).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProductRequests(prev => {
            const copy = [...prev];
            const prod = copy[activeProductIndex];
            if (prod) {
              prod.singleLocation = {
                ...prod.singleLocation,
                images: [...prod.singleLocation.images, reader.result as string].slice(0, 3)
              };
            }
            return copy;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSingleLocationImage = (imgIdx: number) => {
    setProductRequests(prev => {
      const copy = [...prev];
      const prod = copy[activeProductIndex];
      if (prod) {
        prod.singleLocation = {
          ...prod.singleLocation,
          images: prod.singleLocation.images.filter((_, i) => i !== imgIdx)
        };
      }
      return copy;
    });
  };

  const handleMultiLocationImageUpload = (locIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    
    files.slice(0, 3 - (activeProduct.multiLocations[locIdx]?.images?.length || 0)).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProductRequests(prev => {
            const copy = [...prev];
            const prod = copy[activeProductIndex];
            if (prod && prod.multiLocations[locIdx]) {
              const multiCopy = [...prod.multiLocations];
              multiCopy[locIdx] = {
                ...multiCopy[locIdx],
                images: [...multiCopy[locIdx].images, reader.result as string].slice(0, 3)
              };
              prod.multiLocations = multiCopy;
            }
            return copy;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMultiLocationImage = (locIdx: number, imgIdx: number) => {
    setProductRequests(prev => {
      const copy = [...prev];
      const prod = copy[activeProductIndex];
      if (prod && prod.multiLocations[locIdx]) {
        const multiCopy = [...prod.multiLocations];
        multiCopy[locIdx] = {
          ...multiCopy[locIdx],
          images: multiCopy[locIdx].images.filter((_, i) => i !== imgIdx)
        };
        prod.multiLocations = multiCopy;
      }
      return copy;
    });
  };

  const addMultiLocation = () => {
    setProductRequests(prev => {
      const copy = [...prev];
      const prod = copy[activeProductIndex];
      if (prod) {
        prod.multiLocations = [
          ...prod.multiLocations,
          {
            name: `Additional Campaign Set ${prod.multiLocations.length + 1}`,
            description: "",
            images: []
          }
        ];
        prod.activeLocationIndex = prod.multiLocations.length - 1;
      }
      return copy;
    });
  };

  const removeMultiLocation = (locIdx: number) => {
    setProductRequests(prev => {
      const copy = [...prev];
      const prod = copy[activeProductIndex];
      if (prod) {
        if (prod.multiLocations.length <= 1) return prev;
        prod.multiLocations = prod.multiLocations.filter((_, i) => i !== locIdx);
        prod.activeLocationIndex = Math.max(0, Math.min(prod.activeLocationIndex, prod.multiLocations.length - 1));
      }
      return copy;
    });
  };

  const updateMultiLocationField = (locIdx: number, field: keyof LocationPreference, value: string) => {
    setProductRequests(prev => {
      const copy = [...prev];
      const prod = copy[activeProductIndex];
      if (prod && prod.multiLocations[locIdx]) {
        const multiCopy = [...prod.multiLocations];
        multiCopy[locIdx] = {
          ...multiCopy[locIdx],
          [field]: value
        };
        prod.multiLocations = multiCopy;
      }
      return copy;
    });
  };

  const handleProductImageUpload = (prodIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    
    files.slice(0, 5 - (productRequests[prodIdx]?.images?.length || 0)).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProductRequests(prev => {
            const copy = [...prev];
            if (copy[prodIdx]) {
              copy[prodIdx] = {
                ...copy[prodIdx],
                images: [...(copy[prodIdx].images || []), reader.result as string].slice(0, 5)
              };
            }
            return copy;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeProductImage = (prodIdx: number, imgIdx: number) => {
    setProductRequests(prev => {
      const copy = [...prev];
      if (copy[prodIdx]) {
        copy[prodIdx] = {
          ...copy[prodIdx],
          images: (copy[prodIdx].images || []).filter((_, i) => i !== imgIdx)
        };
      }
      return copy;
    });
  };

  const addProductRequest = () => {
    setProductRequests(prev => [
      ...prev,
      createDefaultProduct(`Product ${prev.length + 1}`)
    ]);
    setActiveProductIndex(productRequests.length);
  };

  const removeProductRequest = (prodIdx: number) => {
    if (productRequests.length <= 1) return;
    setProductRequests(prev => prev.filter((_, i) => i !== prodIdx));
    setActiveProductIndex(prev => Math.max(0, Math.min(prev, productRequests.length - 2)));
  };

  const updateProductRequestField = (prodIdx: number, field: keyof ProductRequest, value: any) => {
    setProductRequests(prev => {
      const copy = [...prev];
      if (copy[prodIdx]) {
        copy[prodIdx] = {
          ...copy[prodIdx],
          [field]: value
        };
      }
      return copy;
    });
  };

  const updateActiveProductField = <K extends keyof ProductRequest>(field: K, value: ProductRequest[K]) => {
    updateProductRequestField(activeProductIndex, field, value);
  };

  const updateModelVariantsCount = (newCount: number) => {
    setProductRequests(prev => {
      const copy = [...prev];
      const prod = copy[activeProductIndex];
      if (prod) {
        const currentCount = prod.modelsList.length;
        let updatedModels = [...prod.modelsList];
        if (newCount > currentCount) {
          const added = Array.from({ length: newCount - currentCount }, () => ({ ...DEFAULT_MODEL_PREFERENCE }));
          updatedModels = [...updatedModels, ...added];
        } else if (newCount < currentCount) {
          updatedModels = updatedModels.slice(0, newCount);
        }
        prod.modelsList = updatedModels;
        prod.activeModelIndex = Math.min(prod.activeModelIndex, newCount - 1);
      }
      return copy;
    });
  };

  const updateActiveModelField = (field: Exclude<keyof ModelPreference, "images">, value: string) => {
    setProductRequests(prev => {
      const copy = [...prev];
      const prod = copy[activeProductIndex];
      if (prod && prod.modelsList[prod.activeModelIndex]) {
        const modelsCopy = [...prod.modelsList];
        modelsCopy[prod.activeModelIndex] = {
          ...modelsCopy[prod.activeModelIndex],
          [field]: value
        };
        prod.modelsList = modelsCopy;
      }
      return copy;
    });
  };

  const handleModelImageUpload = (modelIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    
    files.slice(0, 3 - (activeProduct.modelsList[modelIdx]?.images?.length || 0)).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProductRequests(prev => {
            const copy = [...prev];
            const prod = copy[activeProductIndex];
            if (prod && prod.modelsList[modelIdx]) {
              const modelsCopy = [...prod.modelsList];
              modelsCopy[modelIdx] = {
                ...modelsCopy[modelIdx],
                images: [...(modelsCopy[modelIdx].images || []), reader.result as string].slice(0, 3)
              };
              prod.modelsList = modelsCopy;
            }
            return copy;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeModelImage = (modelIdx: number, imgIdx: number) => {
    setProductRequests(prev => {
      const copy = [...prev];
      const prod = copy[activeProductIndex];
      if (prod && prod.modelsList[modelIdx]) {
        const modelsCopy = [...prod.modelsList];
        modelsCopy[modelIdx] = {
          ...modelsCopy[modelIdx],
          images: (modelsCopy[modelIdx].images || []).filter((_, i) => i !== imgIdx)
        };
        prod.modelsList = modelsCopy;
      }
      return copy;
    });
  };

  // Find active tier based on looks count
  // 1-3 = Atelier I, 4-8 = Atelier II, 9+ = Atelier III (Bespoke)
  let activeTier = activeTiers[0] || DEFAULT_SERVICE_TIERS[0];
  let tierIndex = 0;

  if (looksCount >= 4 && looksCount <= 8) {
    activeTier = activeTiers[1] || DEFAULT_SERVICE_TIERS[1];
    tierIndex = 1;
  } else if (looksCount >= 9) {
    activeTier = activeTiers[activeTiers.length - 1] || DEFAULT_SERVICE_TIERS[2];
    tierIndex = activeTiers.length - 1;
  }

  // Calculate high-fashion production math with per-product custom settings
  const calculatedDetails = productRequests.map(prod => {
    // Determine base rate per product look based on total count
    let basePriceNum = rates.basePriceTier1;
    if (looksCount >= 4 && looksCount <= 8) {
      basePriceNum = rates.basePriceTier2;
    } else if (looksCount >= 9) {
      basePriceNum = rates.basePriceTier3;
    }

    const modelAddon = prod.isBespokeModel && prod.modelsList.length > 1
      ? rates.additionalModelFee * (prod.modelsList.length - 1)
      : 0;

    const scopeAddon = prod.productionScope === "multi" ? rates.multiLocationFee : 0;
    
    const effectiveVideoCount = prod.videoCount !== undefined ? prod.videoCount : (prod.videoRequired ? 1 : 0);
    const videoAddon = effectiveVideoCount * rates.videoFee;

    const total = basePriceNum + modelAddon + scopeAddon + videoAddon;

    return {
      name: prod.name,
      basePriceNum,
      modelAddon,
      scopeAddon,
      videoAddon,
      total
    };
  });

  const grandTotal = calculatedDetails.reduce((sum, item) => sum + item.total, 0);

  // Format final price string
  const formattedInvestment = `$${grandTotal.toLocaleString()}`;

  // Calculated timeline estimate
  let daysMin = 5;
  let daysMax = 7;
  if (looksCount >= 4 && looksCount <= 8) {
    daysMin = 10;
    daysMax = 14;
  } else if (looksCount >= 9) {
    daysMin = 21;
    daysMax = 30;
  }

  // Add timeline increments based on per-product requirements
  productRequests.forEach(prod => {
    if (prod.productionScope === "multi") {
      daysMin += 1;
      daysMax += 1;
    }
    const effectiveVideoCount = prod.videoCount !== undefined ? prod.videoCount : (prod.videoRequired ? 1 : 0);
    if (effectiveVideoCount > 0) {
      daysMin += effectiveVideoCount * 1;
      daysMax += effectiveVideoCount * 2;
    }
    if (prod.isBespokeModel && prod.modelsList.length > 1) {
      daysMin += 1;
      daysMax += 1;
    }
  });

  const dynamicTimeline = `${daysMin}-${daysMax} Business Days`;

  const handleRequestConsultation = async () => {
    const trimmedEmail = clientEmail.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!isValid) {
      setSubmitError("Please enter a valid contact email address.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Process and upload all base64-encoded files in the productRequests state to Firebase Storage
      const uploadedProductRequests = JSON.parse(JSON.stringify(productRequests)); // Deep clone to avoid mutating local editor state immediately
      
      for (let i = 0; i < uploadedProductRequests.length; i++) {
        const prod = uploadedProductRequests[i];
        
        // 1.1 Upload product photos
        if (prod.images && prod.images.length > 0) {
          const uploadedImages = [];
          for (let j = 0; j < prod.images.length; j++) {
            const img = prod.images[j];
            if (img && img.startsWith("data:")) {
              const url = await uploadCampaignAsset(img, trimmedEmail, `product_${i}_image_${j}.jpg`);
              uploadedImages.push(url);
            } else {
              uploadedImages.push(img);
            }
          }
          prod.images = uploadedImages;
        }

        // 1.2 Upload bespoke model images
        if (prod.isBespokeModel && prod.modelsList) {
          for (let mIdx = 0; mIdx < prod.modelsList.length; mIdx++) {
            const model = prod.modelsList[mIdx];
            if (model.images && model.images.length > 0) {
              const uploadedModelImages = [];
              for (let j = 0; j < model.images.length; j++) {
                const img = model.images[j];
                if (img && img.startsWith("data:")) {
                  const url = await uploadCampaignAsset(img, trimmedEmail, `product_${i}_model_${mIdx}_image_${j}.jpg`);
                  uploadedModelImages.push(url);
                } else {
                  uploadedModelImages.push(img);
                }
              }
              model.images = uploadedModelImages;
            }
          }
        }

        // 1.3 Upload single location reference images
        if (prod.productionScope === "single" && prod.singleLocation && prod.singleLocation.images) {
          const uploadedLocImages = [];
          for (let j = 0; j < prod.singleLocation.images.length; j++) {
            const img = prod.singleLocation.images[j];
            if (img && img.startsWith("data:")) {
              const url = await uploadCampaignAsset(img, trimmedEmail, `product_${i}_single_loc_image_${j}.jpg`);
              uploadedLocImages.push(url);
            } else {
              uploadedLocImages.push(img);
            }
          }
          prod.singleLocation.images = uploadedLocImages;
        }

        // 1.4 Upload multi location reference images
        if (prod.productionScope === "multi" && prod.multiLocations) {
          for (let lIdx = 0; lIdx < prod.multiLocations.length; lIdx++) {
            const loc = prod.multiLocations[lIdx];
            if (loc.images && loc.images.length > 0) {
              const uploadedLocImages = [];
              for (let j = 0; j < loc.images.length; j++) {
                const img = loc.images[j];
                if (img && img.startsWith("data:")) {
                  const url = await uploadCampaignAsset(img, trimmedEmail, `product_${i}_multi_loc_${lIdx}_image_${j}.jpg`);
                  uploadedLocImages.push(url);
                } else {
                  uploadedLocImages.push(img);
                }
              }
              loc.images = uploadedLocImages;
            }
          }
        }
      }

      // 2. Prepare the consolidated inquiry document
      const campaignInquiry = {
        id: `inq-${Date.now()}`,
        name: "Campaign Client",
        brand: "Campaign Request",
        category: "Campaign Builder",
        scope: `${activeTier.name} — ${activeTier.tagline}`,
        submittedAt: new Date().toLocaleString(),
        email: trimmedEmail,
        isCampaign: true,
        campaignPayload: {
          products: uploadedProductRequests,
          estimatedInvestment: formattedInvestment,
          timeline: dynamicTimeline,
        }
      };

      // 3. Save to Firebase Firestore database
      await saveInquiry(campaignInquiry);

      // 4. Trigger the backend SMTP email engine
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(campaignInquiry),
        });
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
      }

      // 5. Save to local storage as fallback/quick sync
      const existingRaw = localStorage.getItem("vue_studio_inquiries");
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      existingList.unshift(campaignInquiry);
      localStorage.setItem("vue_studio_inquiries", JSON.stringify(existingList));

      setIsSubmitting(false);
      setIsSuccess(true);
      setClientEmail("");

      // Trigger standard callback if attached
      if (onRequestTier) {
        onRequestTier(`${activeTier.name} — ${activeTier.tagline} Campaign Photoshoot`);
      }
    } catch (err: any) {
      console.error("Error submitting campaign brief:", err);
      setIsSubmitting(false);
      setSubmitError("Failed to transmit campaign assets. Please verify database storage rules.");
    }
  };

  const hasBespokeModel = productRequests.some(p => p.isBespokeModel);
  const hasMultiLocation = productRequests.some(p => p.productionScope === "multi");
  const hasVideoRequired = productRequests.some(p => (p.videoCount !== undefined ? p.videoCount > 0 : p.videoRequired));

  return (
    <section
      id="services"
      className="bg-black text-white py-32 px-6 sm:px-12 border-b border-neutral-900"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="font-sans-luxury text-[10px] tracking-[0.4em] uppercase text-neutral-500 block mb-4">
              VUE FASHION STUDIO — DIGITAL PRODUCTION
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide text-white">
              Campaign Builder
            </h2>
          </div>
          <p className="max-w-md text-xs text-neutral-400 font-sans-luxury tracking-wide font-light leading-relaxed">
            We provide end-to-end fashion campaign photography. We handle the casting, set design, and editorial lighting to deliver high-resolution assets indistinguishable from a physical studio production.
          </p>
        </div>

        {/* Master Builder Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-7 flex flex-col justify-between border border-neutral-900 bg-neutral-950/40 p-8 md:p-12">
            <div className="space-y-12">
              
              {/* Step 1: Product Shot Requests & Collection Builder */}
              <div>
                <div 
                  onClick={() => setIsProductBuilderOpen(!isProductBuilderOpen)}
                  className="flex items-center justify-between cursor-pointer group py-2 select-none"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-neutral-500 tracking-widest block uppercase font-bold">
                      01 / PRODUCT SHOT REQUESTS & COLLECTION BUILDER
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif-luxury text-xl font-light tracking-wide text-white">
                        Configure Your Collection Pieces & Shot Requirements
                      </h3>
                      <span className="px-2 py-0.5 border border-neutral-900 bg-neutral-950/60 text-[9px] text-neutral-400 font-mono rounded-xs uppercase">
                        {looksCount} Product{looksCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-neutral-500 group-hover:text-white transition-colors p-2 shrink-0">
                    {isProductBuilderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isProductBuilderOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-6 pt-6"
                    >
                      <p className="text-xs text-neutral-400 font-light mb-8 leading-relaxed">
                        Add each garment, accessory, or physical product you would like photographed. Describe your visual request, upload up to 5 reference photos, and our dynamic system will automatically calculate your campaign scale, base production costs, and custom deliverables.
                      </p>

                {/* Products Configurator Container */}
                <div className="space-y-6 p-6 border border-neutral-900 bg-neutral-950/40 rounded-sm">
                  {/* Tabs header with Add Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
                        Collection Pieces ({productRequests.length})
                      </span>
                      <span className="text-[9px] text-neutral-500">
                        Select a product to edit its editorial direction and uploaded references.
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={addProductRequest}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-neutral-200 transition-colors text-[9px] font-mono tracking-wider uppercase font-semibold rounded-xs cursor-pointer"
                    >
                      <Plus size={10} />
                      Add Product
                    </button>
                  </div>

                  {/* Tabs selector */}
                  <div className="flex flex-wrap gap-1.5 border-b border-neutral-950 pb-2">
                    {productRequests.map((prod, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveProductIndex(idx)}
                        className={`px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase transition-all duration-300 border rounded-xs cursor-pointer flex items-center gap-2 ${
                          activeProductIndex === idx
                            ? "bg-white text-black border-white font-semibold"
                            : "bg-transparent text-neutral-400 border-neutral-900 hover:border-neutral-700"
                        }`}
                      >
                        <span>{prod.name || `Product ${idx + 1}`}</span>
                        {productRequests.length > 1 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProductRequest(idx);
                            }}
                            className={`hover:text-red-500 transition-colors px-1 text-sm ${
                              activeProductIndex === idx ? "text-neutral-500 hover:text-black" : "text-neutral-600 hover:text-white"
                            }`}
                          >
                            &times;
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Product Form details for current active product */}
                  {productRequests[activeProductIndex] && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase block">
                            Product / Item Name
                          </label>
                          <input
                            type="text"
                            value={productRequests[activeProductIndex].name}
                            onChange={(e) => updateProductRequestField(activeProductIndex, "name", e.target.value)}
                            placeholder="e.g. Signature Handbag, Classic Linen Blazer"
                            className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans text-xs py-2 px-3 focus:outline-none focus:border-white transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase block">
                            Visual Request & Scene Direction
                          </label>
                          <textarea
                            value={productRequests[activeProductIndex].description}
                            onChange={(e) => updateProductRequestField(activeProductIndex, "description", e.target.value)}
                            rows={3}
                            placeholder="Describe how the product should be styled, preferred angles, focus details, or light requirements..."
                            className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans text-xs py-2.5 px-3 focus:outline-none focus:border-white transition-colors resize-none leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Product Reference Images (Up to 5) with Drag & Drop */}
                      <div className="pt-4 border-t border-neutral-900/40">
                        <DragDropUpload
                          id={`product-${activeProductIndex}`}
                          images={productRequests[activeProductIndex].images || []}
                          maxFiles={5}
                          onUpload={(newImages) => {
                            setProductRequests(prev => {
                              const copy = [...prev];
                              if (copy[activeProductIndex]) {
                                copy[activeProductIndex] = {
                                  ...copy[activeProductIndex],
                                  images: [...(copy[activeProductIndex].images || []), ...newImages].slice(0, 5)
                                };
                              }
                              return copy;
                            });
                          }}
                          onRemove={(imgIdx) => {
                            setProductRequests(prev => {
                              const copy = [...prev];
                              if (copy[activeProductIndex]) {
                                copy[activeProductIndex] = {
                                  ...copy[activeProductIndex],
                                  images: (copy[activeProductIndex].images || []).filter((_, i) => i !== imgIdx)
                                };
                              }
                              return copy;
                            });
                          }}
                          label="Product Reference Images"
                          helperText="Drag & drop or select images"
                          aspectRatio="square"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Tier Readout */}
                <div className="mt-4 flex items-center justify-between p-3 border border-neutral-900/60 bg-neutral-950/20 text-[10px]">
                  <span className="font-mono text-neutral-400">
                    Total Products: <strong className="text-white font-medium">{looksCount}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-neutral-500 font-mono">Calculated Tier:</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-[9px] uppercase tracking-widest font-semibold text-white font-sans-luxury">
                      {activeTier.name} — {activeTier.tagline}
                    </span>
                  </span>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step 2: Model Curation */}
              <div className="pt-8 border-t border-neutral-900/60">
                <div 
                  onClick={() => setIsModelCurationOpen(!isModelCurationOpen)}
                  className="flex items-center justify-between cursor-pointer group py-2 select-none"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-neutral-500 tracking-widest block uppercase font-bold">
                      02 / MODEL CURATION & CUSTOMIZATION
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif-luxury text-xl font-light tracking-wide text-white">
                        Model Curation & Customization
                      </h3>
                      <span className="px-2 py-0.5 border border-neutral-900 bg-neutral-950/60 text-[9px] text-neutral-400 font-mono rounded-xs uppercase">
                        {activeProduct.isBespokeModel ? `Bespoke (${activeProduct.modelsList.length} Variant${activeProduct.modelsList.length > 1 ? "s" : ""})` : "Standard Model"}
                      </span>
                    </div>
                  </div>
                  <div className="text-neutral-500 group-hover:text-white transition-colors p-2 shrink-0">
                    {isModelCurationOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isModelCurationOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-6 pt-6"
                    >
                      <p className="text-xs text-neutral-400 font-light leading-relaxed">
                        From diverse body types to specific styling aesthetics, our studio offers bespoke model curation that ensures your campaign perfectly aligns with your brand’s demographic.
                      </p>

                {/* Curation Options Selector Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    id="btn-model-standard"
                    onClick={() => {
                      updateActiveProductField("isBespokeModel", false);
                      updateModelVariantsCount(1);
                    }}
                    className={`flex flex-col p-5 border text-left transition-all duration-300 cursor-pointer ${
                      !activeProduct.isBespokeModel
                        ? "bg-white border-white text-black"
                        : "bg-transparent border-neutral-900 hover:border-neutral-700 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className={!activeProduct.isBespokeModel ? "text-black" : "text-neutral-400"} />
                      <span className="font-sans-luxury text-[11px] font-semibold tracking-widest uppercase">
                        Standard Studio Model
                      </span>
                    </div>
                    <span className={`text-[10px] ${!activeProduct.isBespokeModel ? "text-neutral-700" : "text-neutral-500"} font-light block leading-relaxed`}>
                      Professional standard industry styling and curated features, fully inclusive in the base campaign tier.
                    </span>
                  </button>

                  <button
                    type="button"
                    id="btn-model-bespoke"
                    onClick={() => updateActiveProductField("isBespokeModel", true)}
                    className={`flex flex-col p-5 border text-left transition-all duration-300 cursor-pointer ${
                      activeProduct.isBespokeModel
                        ? "bg-white border-white text-black"
                        : "bg-transparent border-neutral-900 hover:border-neutral-700 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className={activeProduct.isBespokeModel ? "text-black" : "text-neutral-400"} />
                      <span className="font-sans-luxury text-[11px] font-semibold tracking-widest uppercase">
                        Bespoke Model Curation
                      </span>
                    </div>
                    <span className={`text-[10px] ${activeProduct.isBespokeModel ? "text-neutral-700" : "text-neutral-500"} font-light block leading-relaxed`}>
                      Fine-tune features, age, size, ethnicity, and styling elements tailored to your precise collection brief (Curation included; +${rates.additionalModelFee > 0 ? `$` + rates.additionalModelFee.toLocaleString() : "no extra charge"} per additional model variant).
                    </span>
                  </button>
                </div>

                {/* Customization Form Container */}
                <div className="space-y-6 pt-6 border-t border-neutral-900/40">
                  
                  {/* If Bespoke mode is active, show the count controller and the selector tabs */}
                  {activeProduct.isBespokeModel && (
                    <div className="space-y-6">
                      {/* Model Count Controller */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-neutral-900 bg-neutral-950/20">
                        <div>
                          <span className="font-sans-luxury text-[10px] tracking-widest text-white uppercase font-semibold">
                            Bespoke Model Variants
                          </span>
                          <p className="text-[10px] text-neutral-400 font-light mt-1">
                            How many unique model castings are required? (First curation included, +${rates.additionalModelFee > 0 ? `$` + rates.additionalModelFee.toLocaleString() : "no extra charge"} per additional variant)
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 bg-neutral-900 p-1.5 border border-neutral-800 rounded-sm">
                          <button
                            type="button"
                            onClick={() => updateModelVariantsCount(Math.max(1, activeProduct.modelsList.length - 1))}
                            className="w-8 h-8 flex items-center justify-center text-white hover:bg-neutral-800 transition-colors rounded-sm cursor-pointer border border-neutral-850"
                          >
                            -
                          </button>
                          <span className="font-mono text-sm text-white font-medium w-6 text-center">
                            {activeProduct.modelsList.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateModelVariantsCount(activeProduct.modelsList.length + 1)}
                            className="w-8 h-8 flex items-center justify-center text-white hover:bg-neutral-800 transition-colors rounded-sm cursor-pointer border border-neutral-850"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Model Variant Selector Tabs */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase block">
                          Configure Individual Model Preferences
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {activeProduct.modelsList.map((model, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => updateActiveProductField("activeModelIndex", idx)}
                              className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all duration-350 border rounded-sm cursor-pointer ${
                                activeProduct.activeModelIndex === idx
                                  ? "bg-white text-black border-white font-semibold"
                                  : "bg-transparent text-neutral-400 border-neutral-900 hover:border-neutral-700"
                              }`}
                            >
                              Model {idx + 1} ({model.ethnicity.split(" ")[0]})
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Label for Current Mode */}
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                      {activeProduct.isBespokeModel 
                        ? `Configuring Model ${activeProduct.activeModelIndex + 1} of ${activeProduct.modelsList.length}` 
                        : "Curating Studio Model (Included)"}
                    </span>
                    <span className="text-[9px] text-neutral-500 italic">
                      {activeProduct.isBespokeModel && activeProduct.activeModelIndex > 0 ? `+$${rates.additionalModelFee.toLocaleString()} variant surcharge` : "No additional cost"}
                    </span>
                  </div>

                  {/* Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Gender selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Gender / Casting Category</label>
                      <select
                        value={activeProduct.modelsList[activeProduct.activeModelIndex]?.gender || "Female"}
                        onChange={(e) => updateActiveModelField("gender", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans-luxury text-[11px] py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="Female">Female Casting</option>
                        <option value="Male">Male Casting</option>
                        <option value="Non-Binary / Unisex">Non-Binary / Unisex Casting</option>
                      </select>
                    </div>

                    {/* Ethnicity selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Ethnicity Demographics</label>
                      <select
                        value={activeProduct.modelsList[activeProduct.activeModelIndex]?.ethnicity || "Diverse Casting"}
                        onChange={(e) => updateActiveModelField("ethnicity", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans-luxury text-[11px] py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="Diverse Casting">Diverse / Global Mix</option>
                        <option value="East Asian">East Asian</option>
                        <option value="South Asian">South Asian</option>
                        <option value="Black / Afro-Descendant">Black / Afro-Descendant</option>
                        <option value="Caucasian">Caucasian</option>
                        <option value="Hispanic / Latine">Hispanic / Latine</option>
                        <option value="Middle Eastern">Middle Eastern</option>
                      </select>
                    </div>

                    {/* Body Size selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Body Silhouette / Size</label>
                      <select
                        value={activeProduct.modelsList[activeProduct.activeModelIndex]?.size || "Standard Sample Size"}
                        onChange={(e) => updateActiveModelField("size", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans-luxury text-[11px] py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="Standard Sample Size">Standard Sample Size</option>
                        <option value="Mid-Size">Mid-Size Silhouette</option>
                        <option value="Plus-Size / Curve">Plus-Size / Curve Casting</option>
                        <option value="Athletic / Muscular">Athletic / Muscular Silhouette</option>
                      </select>
                    </div>

                    {/* Height selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Height Range</label>
                      <select
                        value={activeProduct.modelsList[activeProduct.activeModelIndex]?.height || "Standard High-Fashion (175-180cm)"}
                        onChange={(e) => updateActiveModelField("height", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans-luxury text-[11px] py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="Standard High-Fashion (175-180cm)">Standard Runway (175-180cm)</option>
                        <option value="Petite (under 170cm)">Petite Curation (under 170cm)</option>
                        <option value="Tall (over 180cm)">Tall Curation (over 180cm)</option>
                      </select>
                    </div>

                    {/* Age selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Age Classification</label>
                      <select
                        value={activeProduct.modelsList[activeProduct.activeModelIndex]?.age || "Adult (20-35)"}
                        onChange={(e) => updateActiveModelField("age", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans-luxury text-[11px] py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="Adult (20-35)">Adult (20-35 Years)</option>
                        <option value="Teenager (13-19)">Teenager (13-19 Years)</option>
                        <option value="Elderly / Mature (45+)">Elderly / Mature (45+ Years)</option>
                        <option value="Child (4-12)">Child (4-12 Years)</option>
                      </select>
                    </div>

                    {/* Makeup Preference selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Makeup Aesthetics</label>
                      <select
                        value={activeProduct.modelsList[activeProduct.activeModelIndex]?.makeup || "Minimalist / Raw Skin"}
                        onChange={(e) => updateActiveModelField("makeup", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans-luxury text-[11px] py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="Minimalist / Raw Skin">Minimalist / Raw Skin</option>
                        <option value="High-Fashion Editorial Glaze">High-Fashion Editorial Glaze</option>
                        <option value="Classic Matte Runway">Classic Matte Runway</option>
                        <option value="Avant-Garde Graphic Art">Avant-Garde Graphic Art</option>
                      </select>
                    </div>

                    {/* Tattoos selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Tattoos / Skin Markings</label>
                      <select
                        value={activeProduct.modelsList[activeProduct.activeModelIndex]?.tattoos || "None"}
                        onChange={(e) => updateActiveModelField("tattoos", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans-luxury text-[11px] py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="None">No Tattoos (Clean Skin)</option>
                        <option value="Subtle Line Art">Subtle Minimalist Line Art</option>
                        <option value="Full Sleeves / Graphic sleeves">Full Sleeves / Extensive Canvas</option>
                      </select>
                    </div>

                    {/* Piercings selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Piercings Styling</label>
                      <select
                        value={activeProduct.modelsList[activeProduct.activeModelIndex]?.piercings || "None"}
                        onChange={(e) => updateActiveModelField("piercings", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans-luxury text-[11px] py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="None">No Piercings</option>
                        <option value="Subtle (Ears & Nose)">Subtle Piercings (Ears & Nose Only)</option>
                        <option value="Alternative Styling">Alternative / Multi-point Curation</option>
                      </select>
                    </div>

                    {/* Jewelry selection */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Jewelry styling</label>
                      <select
                        value={activeProduct.modelsList[activeProduct.activeModelIndex]?.jewelry || "None / Product-Focused"}
                        onChange={(e) => updateActiveModelField("jewelry", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans-luxury text-[11px] py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="None / Product-Focused">None / Strictly Product-Focused</option>
                        <option value="High Jewelry (Earrings, Necklaces)">High Fine Jewelry (Earrings, Necklaces, etc.)</option>
                        <option value="Streetwear Accessories (Chains, Rings)">Streetwear Accents (Rings, Industrial Chains, etc.)</option>
                      </select>
                    </div>

                    {/* Model reference images upload with Drag & Drop */}
                    <div className="space-y-2 sm:col-span-2 pt-4 border-t border-neutral-900/40">
                      <DragDropUpload
                        id={`model-${activeProductIndex}-${activeProduct.activeModelIndex}`}
                        images={activeProduct.modelsList[activeProduct.activeModelIndex]?.images || []}
                        maxFiles={3}
                        onUpload={(newImages) => {
                          setProductRequests(prev => {
                            const copy = [...prev];
                            const prod = copy[activeProductIndex];
                            if (prod && prod.modelsList[prod.activeModelIndex]) {
                              const modelsCopy = [...prod.modelsList];
                              modelsCopy[prod.activeModelIndex] = {
                                ...modelsCopy[prod.activeModelIndex],
                                images: [...(modelsCopy[prod.activeModelIndex].images || []), ...newImages].slice(0, 3)
                              };
                              prod.modelsList = modelsCopy;
                            }
                            return copy;
                          });
                        }}
                        onRemove={(imgIdx) => {
                          setProductRequests(prev => {
                            const copy = [...prev];
                            const prod = copy[activeProductIndex];
                            if (prod && prod.modelsList[prod.activeModelIndex]) {
                              const modelsCopy = [...prod.modelsList];
                              modelsCopy[prod.activeModelIndex] = {
                                ...modelsCopy[prod.activeModelIndex],
                                images: (modelsCopy[prod.activeModelIndex].images || []).filter((_, i) => i !== imgIdx)
                              };
                              prod.modelsList = modelsCopy;
                            }
                            return copy;
                          });
                        }}
                        label="Model Reference Images / Inspirations"
                        helperText="Drag & drop or select images"
                        aspectRatio="video"
                      />
                    </div>
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step 3: Production Scope */}
              <div className="pt-8 border-t border-neutral-900/60">
                <div 
                  onClick={() => setIsProductionScopeOpen(!isProductionScopeOpen)}
                  className="flex items-center justify-between cursor-pointer group py-2 select-none"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-neutral-500 tracking-widest block uppercase font-bold">
                      03 / PRODUCTION SCOPE
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif-luxury text-xl font-light tracking-wide text-white">
                        Select Your Preferred Environment
                      </h3>
                      <span className="px-2 py-0.5 border border-neutral-900 bg-neutral-950/60 text-[9px] text-neutral-400 font-mono rounded-xs uppercase">
                        {activeProduct.productionScope === "single" ? "Single Location" : `Multi-Location (${activeProduct.multiLocations.length} Set${activeProduct.multiLocations.length > 1 ? "s" : ""})`}
                      </span>
                    </div>
                  </div>
                  <div className="text-neutral-500 group-hover:text-white transition-colors p-2 shrink-0">
                    {isProductionScopeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isProductionScopeOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-6 pt-6"
                    >

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    id="btn-scope-single"
                    onClick={() => updateActiveProductField("productionScope", "single")}
                    className={`flex items-start p-5 border text-left transition-all duration-300 cursor-pointer ${
                      activeProduct.productionScope === "single"
                        ? "bg-white border-white text-black"
                        : "bg-transparent border-neutral-900 hover:border-neutral-700 text-white"
                    }`}
                  >
                    <div className="mt-0.5 mr-4">
                      <MapPin size={16} className={activeProduct.productionScope === "single" ? "text-black" : "text-neutral-400"} />
                    </div>
                    <div>
                      <span className="font-sans-luxury text-[11px] font-semibold tracking-widest uppercase block mb-1">
                        Single Signature Location
                      </span>
                      <span className={`text-[10px] ${activeProduct.productionScope === "single" ? "text-neutral-700" : "text-neutral-500"} font-light block leading-relaxed`}>
                        Perfect for unified editorial consistency. One meticulously curated studio or destination set.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="btn-scope-multi"
                    onClick={() => updateActiveProductField("productionScope", "multi")}
                    className={`flex items-start p-5 border text-left transition-all duration-300 cursor-pointer ${
                      activeProduct.productionScope === "multi"
                        ? "bg-white border-white text-black"
                        : "bg-transparent border-neutral-900 hover:border-neutral-700 text-white"
                    }`}
                  >
                    <div className="mt-0.5 mr-4">
                      <MapPin size={16} className={activeProduct.productionScope === "multi" ? "text-black" : "text-neutral-400"} />
                    </div>
                    <div>
                      <span className="font-sans-luxury text-[11px] font-semibold tracking-widest uppercase block mb-1">
                        Multi-Location Campaign
                      </span>
                      <span className={`text-[10px] ${activeProduct.productionScope === "multi" ? "text-neutral-700" : "text-neutral-500"} font-light block leading-relaxed`}>
                        Highly dynamic. Showcases your collection across diverse curated settings, studio arrangements, or landscapes (+ $${rates.multiLocationFee.toLocaleString()}).
                      </span>
                    </div>
                  </button>
                </div>

                {/* Customizable Location Fields based on selected production scope */}
                {activeProduct.productionScope === "single" ? (
                  <div className="mt-6 space-y-4 p-5 border border-neutral-900 bg-neutral-950/40 rounded-sm">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                        Signature Location Details
                      </span>
                      <span className="text-[9px] text-neutral-500 italic">Included in Base Tier</span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase block">
                        Describe Your Signature Location Style
                      </label>
                      <textarea
                        value={activeProduct.singleLocation.description}
                        onChange={(e) => updateActiveProductField("singleLocation", { ...activeProduct.singleLocation, description: e.target.value })}
                        rows={3}
                        placeholder="e.g. Minimalist Parisian apartment, soft morning light, raw parquet floors, neutral drape backdrops..."
                        className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans text-xs py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer resize-none leading-relaxed"
                      />
                    </div>

                    {/* Single Signature Location Reference Upload with Drag & Drop */}
                    <div className="pt-2 border-t border-neutral-900/40">
                      <DragDropUpload
                        id={`single-location-${activeProductIndex}`}
                        images={activeProduct.singleLocation.images || []}
                        maxFiles={3}
                        onUpload={(newImages) => {
                          setProductRequests(prev => {
                            const copy = [...prev];
                            const prod = copy[activeProductIndex];
                            if (prod) {
                              prod.singleLocation = {
                                ...prod.singleLocation,
                                images: [...prod.singleLocation.images, ...newImages].slice(0, 3)
                              };
                            }
                            return copy;
                          });
                        }}
                        onRemove={(imgIdx) => {
                          setProductRequests(prev => {
                            const copy = [...prev];
                            const prod = copy[activeProductIndex];
                            if (prod) {
                              prod.singleLocation = {
                                ...prod.singleLocation,
                                images: prod.singleLocation.images.filter((_, i) => i !== imgIdx)
                              };
                            }
                            return copy;
                          });
                        }}
                        label="Reference Moodboards / Images"
                        helperText="Drag & drop or select images"
                        aspectRatio="video"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-5 p-5 border border-neutral-900 bg-neutral-950/40 rounded-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-3">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
                          Configure Multi-Location Campaign Sets
                        </span>
                        <span className="text-[9px] text-neutral-500">
                          Add as many unique environments or sets as desired.
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addMultiLocation}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-neutral-200 transition-colors text-[9px] font-mono tracking-wider uppercase font-semibold rounded-xs cursor-pointer"
                      >
                        <Plus size={10} />
                        Add Set
                      </button>
                    </div>

                    {/* Tabs selector */}
                    <div className="flex flex-wrap gap-1.5 border-b border-neutral-950 pb-2">
                      {activeProduct.multiLocations.map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => updateActiveProductField("activeLocationIndex", idx)}
                          className={`px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase transition-all duration-300 border rounded-xs cursor-pointer flex items-center gap-2 ${
                            activeProduct.activeLocationIndex === idx
                              ? "bg-white text-black border-white font-semibold"
                              : "bg-transparent text-neutral-400 border-neutral-900 hover:border-neutral-700"
                          }`}
                        >
                          <span>{loc.name || `Set ${idx + 1}`}</span>
                          {activeProduct.multiLocations.length > 1 && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMultiLocation(idx);
                              }}
                              className={`hover:text-red-500 transition-colors px-1 text-sm ${
                                activeProduct.activeLocationIndex === idx ? "text-neutral-500 hover:text-black" : "text-neutral-600 hover:text-white"
                              }`}
                            >
                              &times;
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Form fields for current active tab index */}
                    {activeProduct.multiLocations[activeProduct.activeLocationIndex] && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase block">
                              Set / Location Name
                            </label>
                            <input
                              type="text"
                              value={activeProduct.multiLocations[activeProduct.activeLocationIndex].name}
                              onChange={(e) => updateMultiLocationField(activeProduct.activeLocationIndex, "name", e.target.value)}
                              placeholder="e.g. Brutalist Beach Pavilion"
                              className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans text-xs py-2 px-3 focus:outline-none focus:border-white transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase block">
                              Describe Set Style & Mood
                            </label>
                            <textarea
                              value={activeProduct.multiLocations[activeProduct.activeLocationIndex].description}
                              onChange={(e) => updateMultiLocationField(activeProduct.activeLocationIndex, "description", e.target.value)}
                              rows={3}
                              placeholder="e.g. Dramatic coastal cliffs, direct harsh midday lighting, heavy sea mist, architectural concrete pillars..."
                              className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans text-xs py-2.5 px-3 focus:outline-none focus:border-white transition-colors resize-none leading-relaxed"
                            />
                          </div>
                        </div>

                        {/* Multi-Location Reference Upload with Drag & Drop */}
                        <div className="pt-4 border-t border-neutral-900/40">
                          <DragDropUpload
                            id={`multi-location-${activeProductIndex}-${activeProduct.activeLocationIndex}`}
                            images={activeProduct.multiLocations[activeProduct.activeLocationIndex].images || []}
                            maxFiles={3}
                            onUpload={(newImages) => {
                              setProductRequests(prev => {
                                const copy = [...prev];
                                const prod = copy[activeProductIndex];
                                if (prod && prod.multiLocations[prod.activeLocationIndex]) {
                                  const multiCopy = [...prod.multiLocations];
                                  multiCopy[prod.activeLocationIndex] = {
                                    ...multiCopy[prod.activeLocationIndex],
                                    images: [...multiCopy[prod.activeLocationIndex].images, ...newImages].slice(0, 3)
                                  };
                                  prod.multiLocations = multiCopy;
                                }
                                return copy;
                              });
                            }}
                            onRemove={(imgIdx) => {
                              setProductRequests(prev => {
                                const copy = [...prev];
                                const prod = copy[activeProductIndex];
                                if (prod && prod.multiLocations[prod.activeLocationIndex]) {
                                  const multiCopy = [...prod.multiLocations];
                                  multiCopy[prod.activeLocationIndex] = {
                                    ...multiCopy[prod.activeLocationIndex],
                                    images: multiCopy[prod.activeLocationIndex].images.filter((_, i) => i !== imgIdx)
                                  };
                                  prod.multiLocations = multiCopy;
                                }
                                return copy;
                              });
                            }}
                            label={`Reference Moodboards / Images for ${activeProduct.multiLocations[activeProduct.activeLocationIndex].name || `Set ${activeProduct.activeLocationIndex + 1}`}`}
                            helperText="Drag & drop or select images"
                            aspectRatio="video"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step 4: Social & Video Requirements */}
              <div className="pt-8 border-t border-neutral-900/60">
                <div 
                  onClick={() => setIsOutputRequirementsOpen(!isOutputRequirementsOpen)}
                  className="flex items-center justify-between cursor-pointer group py-2 select-none"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-neutral-500 tracking-widest block uppercase font-bold">
                      04 / OUTPUT REQUIREMENTS
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif-luxury text-xl font-light tracking-wide text-white">
                        Cinematic Social Video Clips
                      </h3>
                      <span className="px-2 py-0.5 border border-neutral-900 bg-neutral-950/60 text-[9px] text-neutral-400 font-mono rounded-xs uppercase">
                        {(() => {
                          const vCount = activeProduct.videoCount !== undefined ? activeProduct.videoCount : (activeProduct.videoRequired ? 1 : 0);
                          if (vCount <= 0) return "Images Only";
                          let formatText = activeProduct.videoOrientation || "portrait";
                          if (activeProduct.videoOrientation === "mixed") {
                            formatText = `${activeProduct.videoPortraitCount || 0} Portrait / ${activeProduct.videoLandscapeCount || 0} Landscape`;
                          } else if (activeProduct.videoOrientation === "both") {
                            formatText = "Both Formats";
                          }
                          return `${vCount} Video${vCount > 1 ? "s" : ""} (${formatText}) Required`;
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="text-neutral-500 group-hover:text-white transition-colors p-2 shrink-0">
                    {isOutputRequirementsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOutputRequirementsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-6 pt-6"
                    >
                      <div className="space-y-6 p-5 border border-neutral-900 bg-neutral-950/40 rounded-sm">
                        
                        {/* Video Quantity Selector */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase font-semibold block">
                              Select Video Quantity
                            </label>
                            <span className="text-[9px] font-mono text-neutral-500 uppercase">
                              +${rates.videoFee > 0 ? `$` + rates.videoFee.toLocaleString() : "free"} per cinematic short
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-neutral-950 p-1 border border-neutral-900">
                            {[0, 1, 2, 3, 4, 5].map((count) => {
                              const isActive = (activeProduct.videoCount !== undefined ? activeProduct.videoCount : (activeProduct.videoRequired ? 1 : 0)) === count;
                              return (
                                <button
                                  key={count}
                                  type="button"
                                  onClick={() => {
                                    setProductRequests(prev => {
                                      const copy = [...prev];
                                      if (copy[activeProductIndex]) {
                                        const current = copy[activeProductIndex];
                                        let orientation = current.videoOrientation || "portrait";
                                        
                                        // If they transition to 1 video, reset orientation if it was both or mixed
                                        if (count === 1 && (orientation === "both" || orientation === "mixed")) {
                                          orientation = "portrait";
                                        }
                                        
                                        // Calculate split default counts
                                        const half = Math.floor(count / 2);
                                        const portraitCount = count - half;
                                        const landscapeCount = half;

                                        copy[activeProductIndex] = {
                                          ...current,
                                          videoCount: count,
                                          videoRequired: count > 0,
                                          videoOrientation: orientation,
                                          videoPortraitCount: count === 1 ? (orientation === "portrait" ? 1 : 0) : portraitCount,
                                          videoLandscapeCount: count === 1 ? (orientation === "landscape" ? 1 : 0) : landscapeCount,
                                        };
                                      }
                                      return copy;
                                    });
                                  }}
                                  className={`py-2 px-3 text-center transition-all duration-300 cursor-pointer border font-sans-luxury text-[11px] uppercase ${
                                    isActive
                                      ? "bg-white border-white text-black font-semibold shadow-md"
                                      : "bg-transparent border-transparent hover:border-neutral-800 text-neutral-400 hover:text-white"
                                  }`}
                                >
                                  {count === 0 ? "None" : `${count} Video${count > 1 ? "s" : ""}`}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* If they want videos, show Orientation & Description */}
                        {((activeProduct.videoCount !== undefined ? activeProduct.videoCount : (activeProduct.videoRequired ? 1 : 0)) > 0) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 pt-4 border-t border-neutral-900/40"
                          >
                            {/* Orientation selection */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase font-semibold block">
                                Choose Orientation & Format
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {activeProduct.videoCount === 1 ? (
                                  [
                                    {
                                      value: "portrait",
                                      label: "Portrait (9:16)",
                                      desc: "Perfect for social media reels, stories, TikTok, and vertical mobile screens."
                                    },
                                    {
                                      value: "landscape",
                                      label: "Landscape (16:9)",
                                      desc: "Ideal for website banners, wide screens, and landscape digital displays."
                                    }
                                  ].map((opt) => {
                                    const isSelected = activeProduct.videoOrientation === opt.value;
                                    return (
                                      <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                          setProductRequests(prev => {
                                            const copy = [...prev];
                                            const prod = copy[activeProductIndex];
                                            if (prod) {
                                              prod.videoOrientation = opt.value as any;
                                              prod.videoPortraitCount = opt.value === "portrait" ? 1 : 0;
                                              prod.videoLandscapeCount = opt.value === "landscape" ? 1 : 0;
                                            }
                                            return copy;
                                          });
                                        }}
                                        className={`flex flex-col items-start p-4 border text-left transition-all duration-300 cursor-pointer ${
                                          isSelected
                                            ? "bg-white border-white text-black shadow-md"
                                            : "bg-transparent border-neutral-900 hover:border-neutral-700 text-white"
                                        }`}
                                      >
                                        <span className="font-sans-luxury text-[11px] font-semibold tracking-widest uppercase block mb-1">
                                          {opt.label}
                                        </span>
                                        <span className={`text-[9px] ${isSelected ? "text-neutral-700" : "text-neutral-500"} font-light block leading-normal`}>
                                          {opt.desc}
                                        </span>
                                      </button>
                                    );
                                  })
                                ) : (
                                  [
                                    {
                                      value: "portrait",
                                      label: "All Portrait (9:16)",
                                      desc: `All ${activeProduct.videoCount} cinematic clips delivered in vertical 9:16 format.`
                                    },
                                    {
                                      value: "landscape",
                                      label: "All Landscape (16:9)",
                                      desc: `All ${activeProduct.videoCount} cinematic clips delivered in cinematic 16:9 format.`
                                    },
                                    {
                                      value: "mixed",
                                      label: "Custom Mixed Split",
                                      desc: "Tailor exactly how many clips are Portrait and how many are Landscape."
                                    }
                                  ].map((opt) => {
                                    const isSelected = activeProduct.videoOrientation === opt.value;
                                    return (
                                      <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                          setProductRequests(prev => {
                                            const copy = [...prev];
                                            const prod = copy[activeProductIndex];
                                            if (prod) {
                                              prod.videoOrientation = opt.value as any;
                                              if (opt.value === "portrait") {
                                                prod.videoPortraitCount = prod.videoCount;
                                                prod.videoLandscapeCount = 0;
                                              } else if (opt.value === "landscape") {
                                                prod.videoPortraitCount = 0;
                                                prod.videoLandscapeCount = prod.videoCount;
                                              } else {
                                                // Default mix ratio based on half split
                                                const half = Math.floor(prod.videoCount / 2);
                                                prod.videoPortraitCount = prod.videoCount - half;
                                                prod.videoLandscapeCount = half;
                                              }
                                            }
                                            return copy;
                                          });
                                        }}
                                        className={`flex flex-col items-start p-4 border text-left transition-all duration-300 cursor-pointer ${
                                          isSelected
                                            ? "bg-white border-white text-black shadow-md"
                                            : "bg-transparent border-neutral-900 hover:border-neutral-700 text-white"
                                        }`}
                                      >
                                        <span className="font-sans-luxury text-[11px] font-semibold tracking-widest uppercase block mb-1">
                                          {opt.label}
                                        </span>
                                        <span className={`text-[9px] ${isSelected ? "text-neutral-700" : "text-neutral-500"} font-light block leading-normal`}>
                                          {opt.desc}
                                        </span>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Custom Mixed Split Ratio Counters */}
                            {activeProduct.videoCount > 1 && activeProduct.videoOrientation === "mixed" && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 p-4 border border-neutral-900 bg-neutral-950/40 rounded-sm"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-900/40 pb-2">
                                  <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase font-semibold">
                                    Set Custom Ratio Breakdowns
                                  </span>
                                  <span className="text-[9px] font-mono text-neutral-500 uppercase">
                                    Total: {(activeProduct.videoPortraitCount || 0) + (activeProduct.videoLandscapeCount || 0)} / {activeProduct.videoCount} Videos
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Portrait count adjust */}
                                  <div className="flex items-center justify-between p-3 border border-neutral-900/60 bg-neutral-950/20 rounded-xs">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] font-mono tracking-wider text-white uppercase font-medium block">
                                        Portrait (9:16)
                                      </span>
                                      <span className="text-[8px] text-neutral-500 font-light block uppercase tracking-wider font-mono">
                                        Vertical Clips
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setProductRequests(prev => {
                                            const copy = [...prev];
                                            const prod = copy[activeProductIndex];
                                            if (prod) {
                                              const currentP = prod.videoPortraitCount || 0;
                                              const currentL = prod.videoLandscapeCount || 0;
                                              if (currentP > 0) {
                                                prod.videoPortraitCount = currentP - 1;
                                                prod.videoLandscapeCount = currentL + 1;
                                              }
                                            }
                                            return copy;
                                          });
                                        }}
                                        className="w-7 h-7 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer font-sans-luxury text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(activeProduct.videoPortraitCount || 0) <= 0}
                                      >
                                        -
                                      </button>
                                      <span className="w-6 text-center font-mono text-sm font-semibold text-white">
                                        {activeProduct.videoPortraitCount || 0}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setProductRequests(prev => {
                                            const copy = [...prev];
                                            const prod = copy[activeProductIndex];
                                            if (prod) {
                                              const currentP = prod.videoPortraitCount || 0;
                                              const currentL = prod.videoLandscapeCount || 0;
                                              if (currentL > 0) {
                                                prod.videoPortraitCount = currentP + 1;
                                                prod.videoLandscapeCount = currentL - 1;
                                              }
                                            }
                                            return copy;
                                          });
                                        }}
                                        className="w-7 h-7 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer font-sans-luxury text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(activeProduct.videoLandscapeCount || 0) <= 0}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Landscape count adjust */}
                                  <div className="flex items-center justify-between p-3 border border-neutral-900/60 bg-neutral-950/20 rounded-xs">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] font-mono tracking-wider text-white uppercase font-medium block">
                                        Landscape (16:9)
                                      </span>
                                      <span className="text-[8px] text-neutral-500 font-light block uppercase tracking-wider font-mono">
                                        Cinematic Wide
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setProductRequests(prev => {
                                            const copy = [...prev];
                                            const prod = copy[activeProductIndex];
                                            if (prod) {
                                              const currentP = prod.videoPortraitCount || 0;
                                              const currentL = prod.videoLandscapeCount || 0;
                                              if (currentL > 0) {
                                                prod.videoPortraitCount = currentP + 1;
                                                prod.videoLandscapeCount = currentL - 1;
                                              }
                                            }
                                            return copy;
                                          });
                                        }}
                                        className="w-7 h-7 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer font-sans-luxury text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(activeProduct.videoLandscapeCount || 0) <= 0}
                                      >
                                        -
                                      </button>
                                      <span className="w-6 text-center font-mono text-sm font-semibold text-white">
                                        {activeProduct.videoLandscapeCount || 0}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setProductRequests(prev => {
                                            const copy = [...prev];
                                            const prod = copy[activeProductIndex];
                                            if (prod) {
                                              const currentP = prod.videoPortraitCount || 0;
                                              const currentL = prod.videoLandscapeCount || 0;
                                              if (currentP > 0) {
                                                prod.videoPortraitCount = currentP - 1;
                                                prod.videoLandscapeCount = currentL + 1;
                                              }
                                            }
                                            return copy;
                                          });
                                        }}
                                        className="w-7 h-7 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer font-sans-luxury text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={(activeProduct.videoPortraitCount || 0) <= 0}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Custom Description / Request for Video */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase font-semibold block">
                                Video Scene Direction & Special Requests
                              </label>
                              <textarea
                                value={activeProduct.videoInstructions || ""}
                                onChange={(e) => updateActiveProductField("videoInstructions", e.target.value)}
                                rows={3}
                                placeholder="e.g. 15s seamless looping video with slow macro pans over fabric drapes, cinematic lens flares, soft camera shake, architectural shadow play..."
                                className="w-full bg-neutral-950 border border-neutral-900 text-white font-sans text-xs py-2.5 px-3 focus:outline-none focus:border-white transition-colors cursor-pointer resize-none leading-relaxed"
                              />
                            </div>
                          </motion.div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Quiet disclaimer */}
            <p className="text-[10px] text-neutral-500 font-light mt-12 leading-relaxed">
              * Rates are tailored directly to high-fashion production standards. All campaigns feature customized set development and professional model curation.
            </p>
          </div>

          {/* Right Column: Transparency Reveal Output */}
          <div className="lg:col-span-5 flex flex-col justify-between border border-white/15 bg-gradient-to-b from-neutral-950 to-black p-8 md:p-12 relative overflow-hidden">
            
            {/* Elegant visual line accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40" />

            {/* Step 5 Heading */}
            <div className="space-y-8">
              <div>
                <span className="font-mono text-[9px] text-neutral-400 tracking-[0.3em] block uppercase font-bold mb-1">
                  05 / TRANSPARENCY REVEAL
                </span>
                <h3 className="font-serif-luxury text-xl font-light tracking-wide text-white">
                  Proposed Campaign Path
                </h3>
              </div>

              {/* Dynamic Estimated Investment Display */}
              <div className="py-6 border-y border-neutral-900 flex justify-between items-baseline gap-4">
                <div>
                  <span className="font-sans-luxury text-[10px] tracking-widest text-neutral-500 uppercase block mb-1">
                    Estimated Studio Investment
                  </span>
                  <motion.div
                    key={formattedInvestment}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-wide"
                  >
                    {formattedInvestment}
                  </motion.div>
                </div>

                <div className="text-right">
                  <span className="font-sans-luxury text-[10px] tracking-widest text-neutral-500 uppercase block mb-1">
                    Estimated Production Timeline
                  </span>
                  <motion.div
                    key={dynamicTimeline}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="font-sans-luxury text-xs text-neutral-200 uppercase tracking-widest font-semibold flex items-center justify-end gap-1.5"
                  >
                    <Clock size={11} className="text-neutral-500" />
                    {dynamicTimeline}
                  </motion.div>
                </div>
              </div>

              {/* Suitability */}
              <div className="space-y-4">
                <div>
                  <span className="font-sans-luxury text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">
                    CAMPAIGN SUITABILITY
                  </span>
                  <p className="font-sans-luxury text-[11px] text-neutral-400 leading-relaxed font-light">
                    {activeTier.idealFor}
                  </p>
                </div>

                {/* Professional Standard Deliverables Checklist */}
                <div className="pt-4 border-t border-neutral-950">
                  <span className="font-sans-luxury text-[9px] tracking-widest text-neutral-500 uppercase block mb-3">
                    INCLUDED DELIVERABLES & ASSETS
                  </span>
                  
                  <ul className="space-y-2.5">
                    {/* Standard Required Campaign Package Deliverables */}
                    <li className="flex items-start space-x-2.5 text-neutral-300">
                      <Check size={12} className="text-white mt-0.5 shrink-0" />
                      <span className="font-sans-luxury text-xs font-light tracking-wide">
                        <strong>3+ Editorial Images per look</strong> (Hero, Lifestyle, Detail angles)
                      </span>
                    </li>

                     {hasBespokeModel ? (
                      <li className="flex items-start space-x-2.5 text-neutral-300">
                        <Check size={12} className="text-white mt-0.5 shrink-0" />
                        <span className="font-sans-luxury text-xs font-light tracking-wide">
                          <strong>Bespoke Model Casting & Styling</strong> (Inclusive of size, ethnicity, and aesthetic refinement)
                        </span>
                      </li>
                    ) : (
                      <li className="flex items-start space-x-2.5 text-neutral-300">
                        <Check size={12} className="text-white mt-0.5 shrink-0" />
                        <span className="font-sans-luxury text-xs font-light tracking-wide">
                          <strong>Professional Model Casting & Set Curation</strong>
                        </span>
                      </li>
                    )}

                    <li className="flex items-start space-x-2.5 text-neutral-300">
                      <Check size={12} className="text-white mt-0.5 shrink-0" />
                      <span className="font-sans-luxury text-xs font-light tracking-wide">
                        <strong>Cinematic Editorial Lighting & Color Grading</strong>
                      </span>
                    </li>

                    <li className="flex items-start space-x-2.5 text-neutral-300">
                      <Check size={12} className="text-white mt-0.5 shrink-0" />
                      <span className="font-sans-luxury text-xs font-light tracking-wide">
                        <strong>High-Resolution 4K Master Deliverables</strong>
                      </span>
                    </li>

                    {/* Dynamic Details based on scope selection */}
                    <li className="flex items-start space-x-2.5 text-neutral-300">
                      <Check size={12} className="text-neutral-400 mt-0.5 shrink-0" />
                      <span className="font-sans-luxury text-xs font-light tracking-wide text-neutral-400">
                        {!hasMultiLocation ? (
                          <span>Single Signature Location Set</span>
                        ) : (
                          <span>Multi-Location Campaign set package (Custom virtual environments)</span>
                        )}
                      </span>
                    </li>

                    {hasVideoRequired && (
                      <li className="flex items-start space-x-2.5 text-neutral-300">
                        <Check size={12} className="text-white mt-0.5 shrink-0" />
                        <span className="font-sans-luxury text-xs font-light tracking-wide">
                          <strong>High-end short-form social video clips</strong> (4K, social optimized)
                        </span>
                      </li>
                    )}

                    {/* Pull other dynamic CMS-defined deliverables if any */}
                    {activeTier.deliverables.filter(
                      d => !d.includes("Editorial Images") && 
                           !d.includes("Model Casting") && 
                           !d.includes("Lighting & Color") && 
                           !d.includes("High-Resolution 4K Master")
                    ).map((del, dIdx) => (
                      <li key={dIdx} className="flex items-start space-x-2.5 text-neutral-300">
                        <Check size={12} className="text-neutral-500 mt-0.5 shrink-0" />
                        <span className="font-sans-luxury text-xs font-light tracking-wide text-neutral-400">{del}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA action to pre-fill Inquiry Form and scroll to it */}
                  <div className="pt-6 mt-6 border-t border-neutral-900/60 text-left">
                    {isSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-neutral-950 border border-neutral-800 p-6 text-center space-y-4"
                      >
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 text-white">
                          <CheckCircle2 size={20} className="text-white" />
                        </div>
                        <h4 className="font-serif-luxury text-base font-light tracking-wider text-white">
                          Campaign Brief Transmitted
                        </h4>
                        <p className="font-sans-luxury text-xs text-neutral-400 font-light leading-relaxed">
                          Thank you. Your comprehensive campaign request and assets have been securely logged. An automated confirmation email with your campaign summary has been dispatched to your inbox. Our digital production team will coordinate with you shortly.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-6">
                        {/* Required Email Input */}
                        <div className="flex flex-col space-y-2">
                          <label htmlFor="campaign-email" className="font-sans-luxury text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-medium">
                            Contact Email Address *
                          </label>
                          <input
                            type="email"
                            id="campaign-email"
                            required
                            disabled={isSubmitting}
                            value={clientEmail}
                            onChange={(e) => {
                              setClientEmail(e.target.value);
                              if (submitError) setSubmitError(null);
                            }}
                            placeholder="e.g. creative@yourbrand.com"
                            className="bg-transparent border-b border-neutral-800 focus:border-white focus:outline-none py-3 text-xs font-sans-luxury font-light text-white tracking-wide transition-colors duration-300 w-full disabled:opacity-50"
                          />
                          {clientEmail.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim()) && (
                            <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest mt-1">
                              Please enter a valid email address.
                            </span>
                          )}
                        </div>

                        {submitError && (
                          <div className="bg-red-950/20 border border-red-900/50 p-3 flex items-start gap-2.5">
                            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                            <span className="text-[10px] font-mono text-red-400 tracking-wider uppercase leading-relaxed">
                              {submitError}
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          id="btn-estimator-cta"
                          disabled={isSubmitting || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())}
                          onClick={handleRequestConsultation}
                          className="w-full inline-flex items-center justify-between group bg-white text-black font-sans-luxury text-[10px] tracking-[0.25em] uppercase font-semibold px-6 py-4.5 transition-all duration-300 hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <span>
                            {isSubmitting ? "TRANSMITTING CAMPAIGN BRIEF..." : "Request Campaign Photoshoot"}
                          </span>
                          {isSubmitting ? (
                            <Loader2 size={12} className="animate-spin text-neutral-500" />
                          ) : (
                            <span className="group-hover:translate-x-1.5 transition-transform duration-300 text-lg">→</span>
                          )}
                        </button>
                        
                        <div className="flex items-center justify-center space-x-1 text-[9px] text-neutral-500 tracking-wider uppercase font-mono">
                          <Sparkles size={10} className="text-white animate-pulse" />
                          <span>Uploads brief and assets to Studio Portal</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
