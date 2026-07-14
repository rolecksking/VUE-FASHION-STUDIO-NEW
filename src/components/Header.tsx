import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Globe } from "lucide-react";

interface HeaderProps {
  lang?: string;
  setLang?: (lang: string) => void;
}

const TRANSLATIONS = {
  EN: {
    campaigns: "Campaigns",
    services: "Services",
    specifications: "Specifications",
    inquire: "Inquire",
  },
  FR: {
    campaigns: "Campagnes",
    services: "Prestations",
    specifications: "Spécifications",
    inquire: "Demander",
  },
  IT: {
    campaigns: "Campagne",
    services: "Servizi",
    specifications: "Specifiche",
    inquire: "Richiedi",
  }
};

type LangType = "EN" | "FR" | "IT";

export default function Header({ lang = "EN", setLang }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[lang as LangType] || TRANSLATIONS.EN;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectLanguage = (selected: string) => {
    if (setLang) {
      setLang(selected);
    }
  };

  return (
    <>
      <header
        id="main-header"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
          scrolled
            ? "bg-black/95 backdrop-blur-md border-neutral-900/90 py-4 shadow-xl"
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          
          {/* Left Side: Brand Logo */}
          <div className="flex items-center min-w-[180px] justify-start">
            <a
              href="#"
              id="logo"
              className="flex items-center space-x-3 group"
            >
              <span className="font-serif-luxury text-xl font-light tracking-widest text-white border border-white/30 px-2 py-0.5 group-hover:border-white transition-colors duration-300">
                VF
              </span>
              <span className="font-serif-luxury text-xs sm:text-sm tracking-[0.25em] font-light text-white uppercase block pt-0.5 group-hover:opacity-80 transition-opacity">
                VUE FASHION STUDIO
              </span>
            </a>
          </div>

          {/* Middle: Desktop Navigation (Perfectly centered) */}
          <nav id="nav-menu" className="hidden lg:flex items-center justify-center space-x-10">
            <a
              href="#services"
              id="nav-services"
              className="font-sans-luxury text-[10px] tracking-[0.25em] uppercase font-medium text-neutral-400 hover:text-white transition-colors py-1"
            >
              {t.services}
            </a>
            <a
              href="#specifications"
              id="nav-specifications"
              className="font-sans-luxury text-[10px] tracking-[0.25em] uppercase font-medium text-neutral-400 hover:text-white transition-colors py-1"
            >
              {t.specifications}
            </a>
            <a
              href="#portfolio"
              id="nav-portfolio"
              className="font-sans-luxury text-[10px] tracking-[0.25em] uppercase font-medium text-neutral-400 hover:text-white transition-colors py-1"
            >
              {t.campaigns}
            </a>
            <a
              href="#inquire"
              id="nav-inquire"
              className="font-sans-luxury text-[10px] tracking-[0.25em] uppercase font-medium text-neutral-400 hover:text-white transition-colors py-1"
            >
              {t.inquire}
            </a>
          </nav>

          {/* Right Side: Language Selector & Mobile Toggle (Symmetrically balanced) */}
          <div className="flex items-center justify-end space-x-6 min-w-[180px]">
            {/* Desktop Language Selector */}
            <div className="hidden sm:flex items-center space-x-2 font-mono text-[9px] tracking-widest uppercase text-neutral-500">
              <Globe size={11} className="text-neutral-600 mr-1" />
              <button
                onClick={() => selectLanguage("EN")}
                className={`transition-colors duration-300 cursor-pointer ${
                  lang === "EN" ? "text-white font-semibold" : "hover:text-white"
                }`}
              >
                EN
              </button>
              <span className="text-neutral-800">/</span>
              <button
                onClick={() => selectLanguage("FR")}
                className={`transition-colors duration-300 cursor-pointer ${
                  lang === "FR" ? "text-white font-semibold" : "hover:text-white"
                }`}
              >
                FR
              </button>
              <span className="text-neutral-800">/</span>
              <button
                onClick={() => selectLanguage("IT")}
                className={`transition-colors duration-300 cursor-pointer ${
                  lang === "IT" ? "text-white font-semibold" : "hover:text-white"
                }`}
              >
                IT
              </button>
            </div>

            {/* Mobile/Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="btn-mobile-menu"
              className="p-1 text-neutral-400 hover:text-white transition-colors lg:hidden focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/98 backdrop-blur-lg lg:hidden flex flex-col justify-between pt-24 pb-12 px-8"
          >
            {/* Navigation links */}
            <div className="flex flex-col space-y-8 my-auto text-center">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif-luxury text-xl tracking-[0.2em] uppercase font-light text-neutral-400 hover:text-white transition-colors"
              >
                {t.services}
              </a>
              <a
                href="#specifications"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif-luxury text-xl tracking-[0.2em] uppercase font-light text-neutral-400 hover:text-white transition-colors"
              >
                {t.specifications}
              </a>
              <a
                href="#portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif-luxury text-xl tracking-[0.2em] uppercase font-light text-neutral-400 hover:text-white transition-colors"
              >
                {t.campaigns}
              </a>
              <a
                href="#inquire"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif-luxury text-xl tracking-[0.2em] uppercase font-light text-neutral-400 hover:text-white transition-colors"
              >
                {t.inquire}
              </a>
            </div>

            {/* Mobile Language Selector at bottom */}
            <div className="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-900">
              <span className="font-sans-luxury text-[8px] tracking-[0.3em] uppercase text-neutral-500">
                Select Language / Sélectionner la langue
              </span>
              <div className="flex items-center space-x-6 font-mono text-xs tracking-[0.2em] uppercase text-neutral-400">
                <button
                  onClick={() => {
                    selectLanguage("EN");
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors py-2 px-3 ${
                    lang === "EN" ? "text-white border-b border-white" : "hover:text-white"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    selectLanguage("FR");
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors py-2 px-3 ${
                    lang === "FR" ? "text-white border-b border-white" : "hover:text-white"
                  }`}
                >
                  Français
                </button>
                <button
                  onClick={() => {
                    selectLanguage("IT");
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors py-2 px-3 ${
                    lang === "IT" ? "text-white border-b border-white" : "hover:text-white"
                  }`}
                >
                  Italiano
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
