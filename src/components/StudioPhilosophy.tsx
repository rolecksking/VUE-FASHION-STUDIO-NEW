import React from "react";
import { motion } from "motion/react";

export default function StudioPhilosophy() {
  return (
    <section 
      id="philosophy" 
      className="border-b border-neutral-800/60 dark:border-neutral-900 bg-neutral-950/5 dark:bg-neutral-950/10 py-16 sm:py-20 md:py-24 px-6 sm:px-12 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          
          {/* Section Title Column */}
          <div className="lg:col-span-5 space-y-4">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 0.5, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-sans-luxury text-[10px] tracking-[0.4em] uppercase text-neutral-500 block"
            >
              01 / STUDIO PHILOSOPHY
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 }}
              className="font-header-logo text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-white leading-tight"
            >
              Bespoke Artistry, <br className="hidden sm:inline" />
              Digital Scale
            </motion.h2>
          </div>

          {/* Philosophy Statement Paragraph */}
          <div className="lg:col-span-7 lg:pt-6">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-sans-luxury text-sm sm:text-base md:text-lg font-light leading-relaxed text-neutral-300 dark:text-neutral-300 tracking-wide"
            >
              We combine traditional editorial art direction with modern virtual production. We don't just &ldquo;generate&rdquo; assets&mdash;we curate models, design environments, and light each look to your brand's unique specification. The result is the editorial polish you expect, with the agility your business demands.
            </motion.p>
          </div>
          
        </div>
      </div>
      
      {/* Decorative vertical guide line */}
      <div className="absolute top-0 bottom-0 left-12 w-[1px] bg-white/5 pointer-events-none hidden lg:block" />
      
      {/* Ambient glow backing */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
