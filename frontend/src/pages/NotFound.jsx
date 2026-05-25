import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-4">404</h1>
      <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm mb-8">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="bg-primary text-primary-foreground px-8 py-3 font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors rounded">
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
