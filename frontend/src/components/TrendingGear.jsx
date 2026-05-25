import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import HorizontalSnapCarousel from './HorizontalSnapCarousel';

const TrendingGear = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_PORT}/api/products/getAllproducts`, {
          params: { sort: 'trending', page: 1, limit: 8 },
        });
        const list = res.data?.products || (Array.isArray(res.data) ? res.data : []);
        setProducts(list.filter(Boolean).slice(0, 8));
      } catch (error) {
        console.error('Error fetching trending gear:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-secondary/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 border-b border-border pb-6"
        >
          <div>
            <span className="text-primary font-black tracking-[0.2em] uppercase text-[10px] mb-2 block">
              Most Popular
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">
              Trending <span className="text-primary">Gear</span>
            </h2>
          </div>
          <Link
            to="/search"
            className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary border-b-2 border-foreground hover:border-primary pb-1 w-fit"
          >
            View All
          </Link>
        </motion.div>

        {loading ? (
          <HorizontalSnapCarousel desktopCols={4} showSwipeHint={false}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-card h-[360px] animate-pulse rounded-xl border border-border" />
            ))}
          </HorizontalSnapCarousel>
        ) : products.length > 0 ? (
          <HorizontalSnapCarousel desktopCols={4} mobileWidth="w-[82vw] max-w-[300px]">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </HorizontalSnapCarousel>
        ) : (
          <p className="text-muted-foreground text-center py-10 text-sm font-bold uppercase tracking-widest">
            No trending gear available right now.
          </p>
        )}
      </div>
    </section>
  );
};

export default TrendingGear;
