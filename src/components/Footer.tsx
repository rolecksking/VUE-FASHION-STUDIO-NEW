import React from "react";
import { ArrowUp, Mail, Linkedin, Instagram } from "lucide-react";

interface FooterProps {
  onOpenPortal?: () => void;
  lang?: string;
}

const TRANSLATIONS = {
  EN: {
    rights: "ALL RIGHTS RESERVED.",
    backToTop: "BACK TO TOP",
    studioPortal: "Studio Portal"
  },
  FR: {
    rights: "TOUS DROITS RÉSERVÉS.",
    backToTop: "RETOUR EN HAUT",
    studioPortal: "Portail Studio"
  },
  IT: {
    rights: "TUTTI I DIRITTI RISERVATI.",
    backToTop: "TORNA SU",
    studioPortal: "Portale Studio"
  }
};

export default function Footer({ onOpenPortal, lang = "EN" }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const t = TRANSLATIONS[lang as "EN" | "FR" | "IT"] || TRANSLATIONS.EN;

  return (
    <footer
      id="main-footer"
      className="bg-black text-neutral-400 py-16 px-6 sm:px-12 border-t border-neutral-950 font-sans-luxury"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-12">
        
        {/* Left: Brand / Copyright */}
        <div className="space-y-3">
          <p className="font-serif-luxury text-sm tracking-[0.2em] text-white uppercase font-light">
            VUE FASHION STUDIO
          </p>
          <p className="text-[10px] tracking-widest text-neutral-600 uppercase font-light">
            © MMXXVI VUE FASHION STUDIO. {t.rights}
          </p>
        </div>

        {/* Center: Connect Links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
          
          {/* Email */}
          <a
            href="mailto:contact@vuefashionstudio.com"
            id="footer-email-link"
            className="flex items-center space-x-3 group hover:text-white transition-colors duration-300"
          >
            <Mail size={12} strokeWidth={1.5} className="text-neutral-600 group-hover:text-white transition-colors" />
            <span className="text-[10px] tracking-[0.2em] uppercase font-light">
              contact@vuefashionstudio.com
            </span>
          </a>

          {/* Socials */}
          <div className="flex items-center space-x-6">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-linkedin-link"
              className="flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase font-light hover:text-white transition-colors duration-300"
            >
              <Linkedin size={12} strokeWidth={1.5} className="text-neutral-600" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-instagram-link"
              className="flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase font-light hover:text-white transition-colors duration-300"
            >
              <Instagram size={12} strokeWidth={1.5} className="text-neutral-600" />
              <span>Instagram</span>
            </a>
          </div>

        </div>

        {/* Right: Studio Portal & Scroll to top */}
        <div className="flex flex-row items-center gap-4">
          {onOpenPortal && (
            <button
              onClick={onOpenPortal}
              id="btn-studio-portal"
              className="font-sans-luxury text-[9px] tracking-[0.2em] uppercase border border-neutral-900 hover:border-white px-5 py-3 transition-all duration-300 text-neutral-400 hover:text-white bg-neutral-950/20 hover:bg-white hover:text-black cursor-pointer"
            >
              {t.studioPortal}
            </button>
          )}

          <button
            onClick={scrollToTop}
            id="btn-scroll-top"
            className="flex items-center space-x-2 group hover:text-white transition-colors duration-300 border border-neutral-900 hover:border-neutral-800 px-4 py-3 cursor-pointer"
          >
            <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-500 group-hover:text-white transition-colors">
              {t.backToTop}
            </span>
            <ArrowUp size={12} strokeWidth={1.5} className="text-neutral-500 group-hover:text-white group-hover:-translate-y-0.5 transition-all duration-300" />
          </button>
        </div>

      </div>
    </footer>
  );
}
