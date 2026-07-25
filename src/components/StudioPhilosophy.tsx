import React from "react";
import { motion } from "motion/react";

interface StudioPhilosophyProps {
  manifesto?: any;
}

export default function StudioPhilosophy({ manifesto }: StudioPhilosophyProps) {
  const activeTagline = manifesto?.philosophyTagline || "STUDIO PHILOSOPHY";
  const activeTitle = manifesto?.philosophyTitle || "Bespoke Artistry, Digital Scale";
  const activeBody = manifesto?.philosophyBody || "We combine traditional editorial art direction with modern virtual production. We don't just “generate” assets—we curate models, design environments, and light each look to your brand's unique specification. The result is the editorial polish you expect, with the agility your business demands.";

  return (
    <section 
      id="philosophy" 
      className="border-b border-neutral-800/60 dark:border-neutral-900 bg-neutral-950/5 dark:bg-neutral-950/10 py-10 sm:py-14 md:py-16 px-6 sm:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center"
    >
      <div className="max-w-4xl mx-auto space-y-6 relative z-10 flex flex-col items-center">
        
        {/* Section Tagline - Opacity is fully 1 for proper contrast and visibility */}
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-sans-luxury text-[10px] sm:text-[11px] tracking-[0.4em] uppercase text-neutral-600 dark:text-neutral-400 font-semibold block"
        >
          {activeTagline}
        </motion.span>
        
        {/* Centered Heading using Campaign Builder's exact font-serif-luxury & size */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide text-white leading-tight max-w-none whitespace-nowrap"
        >
          {activeTitle}
        </motion.h2>

        {/* Philosophy Statement Paragraph */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-sans-luxury text-sm sm:text-base md:text-lg font-light leading-relaxed text-neutral-500 dark:text-neutral-400 tracking-wide max-w-2xl mx-auto"
        >
          {activeBody}
        </motion.p>
        
      </div>
      
      {/* Ambient backdrop glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neutral-500/[0.02] dark:bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
