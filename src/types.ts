export interface ShowcaseItem {
  url: string;
  type: "image" | "video";
}

export interface CampaignItem {
  id: string;
  title: string;
  category: "Hats" | "Outfits" | "Bags" | "Eyewear" | "Footwear" | "Outerwear";
  imageUrl: string;
  innerImageUrl?: string;
  year: string;
  description?: string;
  showcaseItems?: ShowcaseItem[];
}

export interface ServiceTier {
  id: string;
  name: string;
  tagline: string;
  volume: string;
  deliverables: string[];
  timeline: string;
  idealFor: string;
  priceEstimate?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  brand: string;
  category: string;
  scope: string;
  link?: string;
  submittedAt: string;
  email: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  auth: boolean;
  tls: boolean;
  fromEmail: string;
  toEmail: string;
}

export interface AssetSpecItem {
  category: string;
  specs: {
    label: string;
    value: string;
  }[];
}

export interface PartnerLogo {
  id: string;
  name: string;
  logoUrl?: string; // Optional image URL; if omitted, we render a highly-stylized text brand
}

export interface PartnerLogosConfig {
  enabled: boolean;
  logos: PartnerLogo[];
}

export interface PreProductionStep {
  id: string;
  title: string;
  description: string;
}

export interface PreProductionConfig {
  title: string;
  subtitle: string;
  introText: string;
  steps: PreProductionStep[];
  images: string[];
  calibrationQuote?: string;
  calibrationAuthor?: string;
  downloadBriefUrl?: string;
  downloadBriefFilename?: string;
}

export interface PricingRates {
  basePrice: number;
  extraModelPrice: number;
  extraLocationPrice: number;
  videoPrice: number;
}


