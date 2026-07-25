import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Globe, ChevronDown, Moon, Sun } from "lucide-react";

interface HeaderProps {
  lang?: string;
  setLang?: (lang: string) => void;
  theme?: "light" | "dark";
  setTheme?: (theme: "light" | "dark") => void;
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

export default function Header({ lang = "EN", setLang, theme = "light", setTheme }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = TRANSLATIONS[lang as LangType] || TRANSLATIONS.EN;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!langDropdownOpen) return;
    const closeDropdown = () => setLangDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, [langDropdownOpen]);

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
            : "bg-black/45 backdrop-blur-md border-neutral-800/20 py-5 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          
          {/* Left Side: Brand Logo */}
          <div className="flex items-center min-w-max sm:min-w-[180px] justify-start">
            <a
              href="#"
              id="logo"
              className="flex items-center space-x-3 group"
            >
              <span className="font-header-logo text-xl font-light tracking-widest text-white border border-white/30 px-2 py-0.5 group-hover:border-white transition-colors duration-300">
                VF
              </span>
              <span className="font-header-logo text-xs sm:text-sm tracking-[0.25em] font-light text-white uppercase block pt-0.5 group-hover:opacity-80 transition-opacity">
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
          <div className="flex items-center justify-end space-x-4 sm:space-x-6 min-w-max sm:min-w-[180px]">
            {/* Language Selector Dropdown (Visible on BOTH mobile and desktop headers to declutter) */}
            <div className="relative z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLangDropdownOpen(!langDropdownOpen);
                }}
                className="flex items-center space-x-1.5 font-mono text-[10px] tracking-widest uppercase text-neutral-400 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded border border-neutral-800/40 bg-neutral-900/20 hover:bg-neutral-900/45"
                aria-label="Select language"
              >
                <Globe size={11} className="text-neutral-500" />
                <span className="font-semibold text-white">{lang}</span>
                <ChevronDown size={10} className={`text-neutral-500 transition-transform duration-300 ${langDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-32 rounded bg-neutral-950/95 border border-neutral-800 shadow-2xl py-1 z-50 backdrop-blur-md"
                  >
                    <button
                      onClick={() => {
                        selectLanguage("EN");
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors duration-150 ${
                        lang === "EN" ? "text-white bg-neutral-900 font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        selectLanguage("FR");
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors duration-150 ${
                        lang === "FR" ? "text-white bg-neutral-900 font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                      }`}
                    >
                      Français
                    </button>
                    <button
                      onClick={() => {
                        selectLanguage("IT");
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors duration-150 ${
                        lang === "IT" ? "text-white bg-neutral-900 font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                      }`}
                    >
                      Italiano
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Theme Switcher */}
            <div className="hidden sm:flex items-center space-x-2 font-mono text-[9px] tracking-widest uppercase text-neutral-500 border-l border-neutral-800 pl-4">
              <button
                onClick={() => setTheme && setTheme(theme === "dark" ? "light" : "dark")}
                className="transition-colors duration-300 cursor-pointer hover:text-white font-light"
              >
                {theme === "dark" ? "LIGHT" : "DARK"}
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
                className="font-sans-luxury text-sm tracking-[0.25em] uppercase font-medium text-neutral-300 hover:text-white transition-colors"
              >
                {t.services}
              </a>
              <a
                href="#specifications"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans-luxury text-sm tracking-[0.25em] uppercase font-medium text-neutral-300 hover:text-white transition-colors"
              >
                {t.specifications}
              </a>
              <a
                href="#portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans-luxury text-sm tracking-[0.25em] uppercase font-medium text-neutral-300 hover:text-white transition-colors"
              >
                {t.campaigns}
              </a>
              <a
                href="#inquire"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans-luxury text-sm tracking-[0.25em] uppercase font-medium text-neutral-300 hover:text-white transition-colors"
              >
                {t.inquire}
              </a>
            </div>

            {/* Mobile Theme Switcher at bottom (Language switcher is removed to declutter as requested) */}
            <div className="flex flex-col items-center space-y-3 pt-6 border-t border-neutral-900 w-full mt-auto">
              <span className="font-sans-luxury text-[8px] tracking-[0.3em] uppercase text-neutral-500">
                Appearance / Thème
              </span>
              <button
                onClick={() => {
                  setTheme && setTheme(theme === "dark" ? "light" : "dark");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-5 py-2.5 rounded-full border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 transition-colors font-mono text-xs tracking-[0.2em] uppercase text-neutral-300 hover:text-white cursor-pointer"
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={14} className="text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-indigo-400" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
