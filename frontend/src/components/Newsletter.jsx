import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Please enter your email address');
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!emailValid) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Successfully subscribed to the Sportsync newsletter!');
    setEmail('');
  };

  return (
    <section className="py-24 bg-foreground text-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <FaEnvelope className="text-2xl text-primary-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Join the <span className="text-primary">Squad</span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive drops, pro training tips, and early access to sales.
          </p>
          <form className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-grow bg-card text-foreground border border-border px-6 py-4 rounded placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium tracking-wide text-sm"
              required
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-8 py-4 font-black uppercase tracking-widest text-sm hover:opacity-90 transition-colors rounded whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
