import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HERO_SLIDES = [
  {
    src: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=1920',
    fallback: 'https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    src: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=1920',
    fallback: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    src: 'https://images.unsplash.com/photo-1518605368461-1e1292234955?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    fallback: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    src: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    fallback: 'https://images.pexels.com/photos/47730/the-ball-stadion-football-47730.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    src: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    fallback: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
];

const HeroBanner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideSrcs, setSlideSrcs] = useState(HERO_SLIDES.map((s) => s.src));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleImageError = (index) => {
    setSlideSrcs((prev) => {
      const next = [...prev];
      if (next[index] !== HERO_SLIDES[index].fallback) {
        next[index] = HERO_SLIDES[index].fallback;
      }
      return next;
    });
  };

  return (
    <div className="relative w-full h-[85vh] bg-black overflow-hidden flex items-center justify-center">
      {slideSrcs.map((src, index) => (
        <motion.div
          key={`${index}-${src}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentImageIndex === index ? 1 : 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            onError={() => handleImageError(index)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute right-0 top-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] pointer-events-none z-10"
      />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white flex flex-col md:flex-row items-center">
        <div className="flex-1 w-full text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-3 mb-6"
          >
            <div className="w-12 h-1 bg-primary"></div>
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">New Collection 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, type: 'spring' }}
            className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter mb-4 leading-[0.85]"
          >
            Defy <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Limits</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="max-w-xl text-lg md:text-2xl font-medium mb-10 text-gray-300 border-l-2 border-primary pl-4"
          >
            Equip yourself with pro-grade gear engineered for maximum performance. Push harder. Run faster. Go further.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link to="/search?sort=newest" className="group relative bg-primary text-primary-foreground px-8 py-4 font-black uppercase tracking-widest text-sm overflow-hidden flex justify-center">
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center">
                Shop New Arrivals
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>

            <Link to="/category/accessories" className="group bg-transparent border border-white/30 text-white hover:border-white px-8 py-4 font-bold uppercase tracking-widest text-sm transition-all text-center flex items-center justify-center backdrop-blur-sm">
              Explore Tech
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="hidden lg:flex flex-1 justify-end relative h-full items-center"
        >
          <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl w-64 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Performance</p>
                <p className="text-lg font-black text-white">+42% Output</p>
              </div>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1.5, delay: 1 }}
                className="bg-primary h-full"
              ></motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroBanner;
