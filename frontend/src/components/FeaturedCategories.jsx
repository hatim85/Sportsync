import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HorizontalSnapCarousel from './HorizontalSnapCarousel';

const categories = [
  {
    title: 'Cricket',
    image: 'https://images.pexels.com/photos/5069315/pexels-photo-5069315.jpeg?auto=compress&cs=tinysrgb&w=1740',
    fallback: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    link: '/category/cricket',
  },
  {
    title: 'Fitness',
    image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1740',
    fallback: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    link: '/category/fitness',
  },
  {
    title: 'Football',
    image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=1740',
    fallback: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    link: '/category/football',
  },
  {
    title: 'Badminton',
    image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1740',
    fallback: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1740',
    link: '/category/badminton',
  },
];

function CategoryCard({ cat }) {
  const [src, setSrc] = useState(cat.image);

  return (
    <Link
      to={cat.link}
      className="group relative h-[380px] md:h-[420px] lg:h-[450px] overflow-hidden bg-card block rounded-xl shadow-lg border border-border/50"
    >
      <img
        src={src}
        alt={cat.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        onError={() => {
          if (src !== cat.fallback) setSrc(cat.fallback);
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <span className="inline-block px-3 py-1 mb-3 text-[10px] font-black tracking-widest uppercase bg-primary text-primary-foreground rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            Explore
          </span>
          <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight leading-none mb-2">
            {cat.title}
          </h3>
          <div className="flex items-center space-x-2 text-gray-300 group-hover:text-primary transition-colors duration-300">
            <span className="text-xs uppercase tracking-widest font-bold">Shop Now</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

const FeaturedCategories = () => {
  return (
    <section className="py-16 md:py-24 bg-background overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16"
        >
          <div>
            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-foreground leading-none">
              Focus <span className="text-primary">Sports</span>
            </h2>
            <p className="mt-3 md:mt-4 text-muted-foreground font-bold uppercase tracking-widest text-xs md:text-sm max-w-xl">
              Equip yourself with pro-grade gear for the games that matter most.
            </p>
          </div>
          <Link
            to="/category/all"
            className="mt-4 md:mt-0 hidden md:inline-flex items-center text-xs font-black uppercase tracking-widest hover:text-primary transition-colors border-b-2 border-foreground hover:border-primary pb-1"
          >
            View All Categories
          </Link>
        </motion.div>

        <HorizontalSnapCarousel desktopCols={4} mobileWidth="w-[88vw] max-w-[360px]">
          {categories.map((cat) => (
            <CategoryCard key={cat.title} cat={cat} />
          ))}
        </HorizontalSnapCarousel>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/category/all"
            className="inline-flex items-center text-xs font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors border-b-2 border-foreground hover:border-primary pb-1"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
