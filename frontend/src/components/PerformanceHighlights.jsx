import React from 'react';
import { motion } from 'framer-motion';

const PerformanceHighlights = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative bg elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Our Philosophy</span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mb-6">
            Equipping <span className="text-primary">Champions</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            Discover a comprehensive selection of premium sports gear tailored for athletes at all levels. We deliver the performance, you bring the passion.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16"
        >
          {/* Tech 1 */}
          <motion.div variants={itemVariants} className="text-center group flex flex-col items-center">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-500 shadow-xl border border-border group-hover:border-primary group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-foreground group-hover:text-primary-foreground transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-wider mb-4 text-foreground">Ultra-Lightweight</h3>
            <p className="text-muted-foreground leading-relaxed">
              Advanced aerospace-grade materials shed unnecessary ounces without sacrificing durability, keeping you agile on your feet during critical moments.
            </p>
          </motion.div>

          {/* Tech 2 */}
          <motion.div variants={itemVariants} className="text-center group flex flex-col items-center">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-500 shadow-xl border border-border group-hover:border-primary group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-foreground group-hover:text-primary-foreground transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-wider mb-4 text-foreground">Maximum Impact</h3>
            <p className="text-muted-foreground leading-relaxed">
              Responsive kinetic cushioning absorbs shock and returns energy back to you, delivering explosive power exactly when you need it most.
            </p>
          </motion.div>

          {/* Tech 3 */}
          <motion.div variants={itemVariants} className="text-center group flex flex-col items-center">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-500 shadow-xl border border-border group-hover:border-primary group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-foreground group-hover:text-primary-foreground transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-wider mb-4 text-foreground">Breathable Tech</h3>
            <p className="text-muted-foreground leading-relaxed">
              Strategic hyper-ventilation zones and premium moisture-wicking fabrics regulate temperature, keeping you cool under extreme pressure.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PerformanceHighlights;
