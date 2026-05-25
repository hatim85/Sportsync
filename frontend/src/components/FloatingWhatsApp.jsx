import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const FloatingWhatsApp = () => {
    const phoneNumber = "919924559125";
    const message = encodeURIComponent("Hello Sportsync! I need help with sports gear or my order.");
    
    return (
        <a 
            href={`https://wa.me/${phoneNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[999] bg-[#25D366] text-primary-foreground py-2 px-3 md:py-3 md:px-5 rounded-full shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] hover:scale-105 hover:bg-[#20bd5a] transition-all duration-300 flex items-center space-x-2 md:space-x-3 group"
            title="Chat with us on WhatsApp"
        >
            <div className="relative">
                <FaWhatsapp className="h-5 w-5 md:h-7 md:w-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2 md:h-3 md:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-card opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-white/20"></span>
                </span>
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase opacity-90">Sportsync</span>
                <span className="text-[10px] md:text-[11px] font-medium">+91 93164 02819</span>
            </div>
        </a>
    );
};

export default FloatingWhatsApp;
