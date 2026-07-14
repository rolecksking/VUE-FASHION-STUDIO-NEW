import React from "react";
import { motion } from "motion/react";

interface ManifestoProps {
  tagline?: string;
  title?: string;
  body?: string;
  signature?: string;
}

export default function Manifesto({ tagline, title, body, signature }: ManifestoProps) {
  const activeTagline = tagline || "Our Manifesto";
  const activeTitle = title || "The Future of Production";
  const activeBody = body || "Vue Fashion Studio is a global virtual production house. We merge high-fidelity 3D rendering with advanced AI to produce world-class editorial fashion content. We provide a full-service production experience without the logistics of a physical set.";
  const activeSignature = signature || "— Paris / Milan / Tokyo / New York";

  return (
    <section
      id="manifesto"
      className="relative bg-black text-white py-32 md:py-48 px-6 sm:px-12 overflow-hidden border-b border-neutral-900"
    >
      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
        {/* Subtle Section Tag */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.4, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="font-sans-luxury text-[10px] tracking-[0.4em] uppercase text-white mb-8"
        >
          {activeTagline}
        </motion.span>

        {/* Large, Beautiful Serif Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide leading-tight mb-12 max-w-3xl text-white"
        >
          {activeTitle}
        </motion.h2>

        {/* Thick, Editorial Styled Spacer Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-20 h-[1px] bg-neutral-600 mb-12 origin-center"
        />

        {/* Body Text */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="font-sans-luxury text-base sm:text-lg md:text-xl font-light leading-relaxed text-neutral-300 max-w-2xl tracking-wide whitespace-pre-wrap"
        >
          {activeBody}
        </motion.p>

        {/* Elegant Signature Detail */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="mt-16 font-serif-luxury italic text-xs tracking-widest text-neutral-400"
        >
          {activeSignature}
        </motion.div>
      </div>

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
