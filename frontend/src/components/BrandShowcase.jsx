import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Nike', logo: 'N' },
  { name: 'Adidas', logo: 'A' },
  { name: 'Puma', logo: 'P' },
  { name: 'Under Armour', logo: 'UA' },
  { name: 'Reebok', logo: 'R' },
  { name: 'Asics', logo: 'AS' },
  { name: 'Yonex', logo: 'YX' },
  { name: 'Kookaburra', logo: 'KB' }
];

const BrandShowcase = () => {
  return (
    <section className="py-16 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary-foreground opacity-80">
          Trusted by Athletes Worldwide
        </h2>
      </div>
      
      {/* Infinite scrolling marquee effect */}
      <div className="relative w-full flex overflow-x-hidden">
        <motion.div 
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        >
          {/* We duplicate the brands array to create a seamless loop */}
          {[...brands, ...brands].map((brand, index) => (
            <div 
              key={index} 
              className="mx-8 md:mx-16 flex items-center justify-center text-primary-foreground font-black text-4xl md:text-5xl lg:text-7xl opacity-50 hover:opacity-100 transition-opacity duration-300 select-none italic tracking-tighter"
            >
              {brand.name.toUpperCase()}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BrandShowcase;
