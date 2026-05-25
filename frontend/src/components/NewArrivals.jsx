import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import HorizontalSnapCarousel from './HorizontalSnapCarousel';
import { sortByNewest } from '../utils/sortProducts';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_PORT}/api/products/getAllproducts`, {
          params: { sort: 'newest', page: 1, limit: 12 },
        });
        const list = res.data?.products || (Array.isArray(res.data) ? res.data : []);
        setProducts(sortByNewest(list.filter(Boolean)).slice(0, 8));
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-border pb-6"
        >
          <div>
            <span className="text-primary font-black tracking-[0.2em] uppercase text-[10px] mb-2 block">
              Just Dropped
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">
              New <span className="text-primary">Arrivals</span>
            </h2>
          </div>
          <Link
            to="/search?sort=newest"
            className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary border-b-2 border-foreground hover:border-primary pb-1 w-fit"
          >
            Shop All New
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
          <p className="text-muted-foreground text-center py-10 text-sm uppercase tracking-widest font-bold">
            New gear coming soon
          </p>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
