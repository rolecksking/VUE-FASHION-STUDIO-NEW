import React from "react";
import { PartnerLogosConfig } from "../types";

interface PartnerLogosProps {
  config: PartnerLogosConfig;
}

export default function PartnerLogos({ config }: PartnerLogosProps) {
  if (!config || !config.enabled || !config.logos || config.logos.length === 0) {
    return null;
  }

  // To make a seamless infinite loop, we double the logos in the marquee
  const doubledLogos = [...config.logos, ...config.logos, ...config.logos];

  return (
    <section className="relative border-y border-neutral-900 bg-neutral-950/20 py-10 overflow-hidden font-sans-luxury">
      {/* Title */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <h3 className="text-center text-[9px] tracking-[0.25em] text-neutral-500 uppercase font-medium">
          Editorial Collaborations & Studio Partners
        </h3>
      </div>

      {/* Marquee Wrapper with side gradients */}
      <div className="relative w-full overflow-hidden flex items-center py-2">
        {/* Left Edge Fade */}
        <div className="absolute left-0 top-0 bottom-0 z-10 w-20 sm:w-36 bg-gradient-to-r from-black to-transparent pointer-events-none" />

        {/* Scrolling Inner Row */}
        <div className="flex w-max">
          <div className="animate-marquee flex items-center space-x-12 sm:space-x-24 pr-12 sm:pr-24">
            {doubledLogos.map((partner, index) => {
              const uniqueKey = `${partner.id}-${index}`;
              return (
                <div
                  key={uniqueKey}
                  className="flex-shrink-0 flex items-center justify-center transition-all duration-500 grayscale opacity-45 hover:grayscale-0 hover:opacity-100 hover:scale-105 cursor-pointer"
                  title={partner.name}
                >
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={`${partner.name} logo`}
                      className="h-7 sm:h-10 w-auto object-contain max-w-[120px] sm:max-w-[180px]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-base sm:text-lg tracking-[0.3em] font-serif font-light text-neutral-300 uppercase whitespace-nowrap">
                      {partner.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Edge Fade */}
        <div className="absolute right-0 top-0 bottom-0 z-10 w-20 sm:w-36 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
