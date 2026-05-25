import React from 'react';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { FaBalanceScale, FaUserCheck, FaCopyright, FaExclamationTriangle, FaGavel, FaTruck, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { SPORTSYNC_CONTACT } from '../constants/shopCategories.js';

const Terms = () => {
    const sections = [
        {
            icon: <FaUserCheck />,
            title: '1. Acceptance & Eligibility',
            content:
                'By using Sportsync you agree to these terms. You must be 18 years or older to place orders. We reserve the right to refuse service for fraud, abuse, or violation of these terms.',
        },
        {
            icon: <FaTruck />,
            title: '2. Orders, Pricing & Delivery',
            content:
                'Product prices and availability may change without notice. Orders are confirmed after successful payment (online) or placement (COD). Estimated delivery is shown at checkout; actual timelines may vary due to logistics or force majeure.',
        },
        {
            icon: <FaBalanceScale />,
            title: '3. Returns & Refunds',
            content:
                'Returns may be requested within 15 days of delivery for eligible products in original condition. Online refunds are processed via Razorpay after return pickup. COD refunds are paid to your bank/UPI after verification. See FAQs for full process.',
        },
        {
            icon: <FaExclamationTriangle />,
            title: '4. Limitation of Liability',
            content:
                'Sportsync is not liable for indirect or consequential damages arising from use of the site or products. Our liability is limited to the amount paid for the specific order in dispute, to the extent permitted by Indian law.',
        },
        {
            icon: <FaCopyright />,
            title: '5. Intellectual Property',
            content:
                'Sportsync branding, website content, and product descriptions are protected. You may not copy, scrape, or resell our catalogue without written permission.',
        },
        {
            icon: <FaGavel />,
            title: '6. Governing Law',
            content:
                'These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Ahmedabad, Gujarat.',
        },
    ];

    return (
        <div className="bg-background text-foreground min-h-screen flex flex-col">
            <nav className="max-w-7xl mx-auto w-full px-4 py-8 flex items-center relative border-b border-border">
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Home">
                    <FaHome className="h-6 w-6" />
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2">
                    <Link to="/" className="text-2xl font-black tracking-[0.2em] uppercase text-foreground">
                        Sportsync
                    </Link>
                </div>
            </nav>

            <main className="flex-grow pt-24 pb-32">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-20 space-y-4">
                        <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground font-bold block">Legal</span>
                        <h1 className="text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
                            Terms &amp; Conditions
                        </h1>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Please read before shopping on Sportsync.
                        </p>
                    </div>

                    <div className="bg-secondary p-10 rounded-sm border border-border mb-16 text-muted-foreground leading-relaxed">
                        Welcome to <strong className="text-foreground">Sportsync</strong>, an e-commerce platform for sports equipment and accessories in India. By accessing our website or placing an order, you agree to these Terms &amp; Conditions and our Privacy Policy.
                    </div>

                    <div className="space-y-12">
                        {sections.map((section, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="bg-card border border-border p-4 rounded-full text-primary shrink-0">
                                    <div className="text-xl">{section.icon}</div>
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{section.title}</h2>
                                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 pt-12 border-t border-border text-center">
                        <p className="text-muted-foreground mb-6">
                            Questions? Contact{' '}
                            <a href={`mailto:${SPORTSYNC_CONTACT.email}`} className="text-primary font-bold hover:underline">
                                {SPORTSYNC_CONTACT.email}
                            </a>{' '}
                            or WhatsApp {SPORTSYNC_CONTACT.phone}.
                        </p>
                    </div>
                </div>
            </main>

            <FloatingWhatsApp />
            <Footer />
        </div>
    );
};

export default Terms;
