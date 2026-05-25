import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const quickLinks = [
  { label: 'Cricket', path: '/category/cricket', emoji: '🏏' },
  { label: 'Football', path: '/category/football', emoji: '⚽' },
  { label: 'Badminton', path: '/category/badminton', emoji: '🏸' },
  { label: 'Fitness', path: '/category/fitness', emoji: '💪' },
  { label: 'Running', path: '/category/running', emoji: '🏃' },
  { label: 'Accessories', path: '/category/accessories', emoji: '🎒' },
  { label: 'Indoor', path: '/category/indoor-sports', emoji: '🏀' },
  { label: 'All Gear', path: '/category/all', emoji: '✨' },
];

const QuickShop = () => {
  return (
    <section className="py-14 bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            Quick <span className="text-primary">Shop</span>
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
            Jump straight into your sport
          </p>
        </motion.div>

        <div
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible lg:justify-center
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {quickLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="snap-center shrink-0 flex items-center gap-2 bg-card border border-border px-5 py-3 rounded-full hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="text-lg" aria-hidden>{item.emoji}</span>
              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-foreground whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickShop;
