import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HorizontalSnapCarousel from './HorizontalSnapCarousel';

const promos = [
  {
    title: 'Team & Academy',
    subtitle: 'Bulk orders for squads & schools',
    cta: 'Get a Quote',
    link: '/category/team-academy',
    bg: 'from-primary to-blue-700',
  },
  {
    title: 'Pro Accessories',
    subtitle: 'Bags, guards, bottles & more',
    cta: 'Shop Tech',
    link: '/category/accessories',
    bg: 'from-foreground to-gray-800',
  },
];

const PromoCTA = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HorizontalSnapCarousel desktopCols={2} mobileWidth="w-[88vw] max-w-md" gapClass="gap-4 lg:gap-6">
          {promos.map((promo) => (
            <Link
              key={promo.title}
              to={promo.link}
              className={`block relative overflow-hidden rounded-xl p-8 md:p-10 min-h-[200px] bg-gradient-to-br ${promo.bg} text-white group`}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70 mb-2">
                  Sportsync
                </p>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
                  {promo.title}
                </h3>
                <p className="text-sm text-white/80 mb-6 max-w-xs">{promo.subtitle}</p>
                <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-white pb-1 group-hover:translate-x-1 transition-transform">
                  {promo.cta} →
                </span>
              </motion.div>
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </Link>
          ))}
        </HorizontalSnapCarousel>
      </div>
    </section>
  );
};

export default PromoCTA;
