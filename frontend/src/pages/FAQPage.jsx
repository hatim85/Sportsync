import React, { useState } from 'react';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { FaPlus, FaMinus, FaQuestionCircle, FaShieldAlt, FaTruck, FaUndo, FaCreditCard, FaHome } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { SPORTSYNC_CONTACT } from '../constants/shopCategories.js';

const FaqPage = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            icon: <FaQuestionCircle />,
            question: 'What is Sportsync?',
            answer: 'Sportsync is an online sports store based in India. We sell cricket, football, badminton, fitness, running, and other sports gear with secure checkout and delivery across India.',
        },
        {
            icon: <FaCreditCard />,
            question: 'What payment methods do you accept?',
            answer: 'You can pay online via Razorpay (UPI, cards, net banking) or choose Cash on Delivery (COD) where available. Online payments are verified instantly; COD is collected when your order is delivered.',
        },
        {
            icon: <FaTruck />,
            question: 'How long does delivery take?',
            answer: 'Orders are confirmed immediately after payment. Delivery is estimated within 24 hours of placing your order. You can track status (Confirmed → Processing → Shipped → Out for Delivery → Delivered) in Profile → Orders.',
        },
        {
            icon: <FaUndo />,
            question: 'Can I return a product?',
            answer: 'Yes. After delivery, you have 15 days to request a return from your order page. Online payments are refunded via Razorpay after pickup; COD refunds are processed to your bank/UPI within 5–7 business days.',
        },
        {
            icon: <FaShieldAlt />,
            question: 'Is my payment information secure?',
            answer: 'Yes. Card and UPI payments are processed by Razorpay. Sportsync does not store your full card details. We use secure connections and follow standard e-commerce privacy practices.',
        },
        {
            icon: <FaQuestionCircle />,
            question: 'How do I cancel an order?',
            answer: 'You may cancel before your order is out for delivery from Profile → Orders. Online orders receive an automatic refund initiation; COD cancellations do not require a payment refund.',
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
                        <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground font-bold block">Support</span>
                        <h1 className="text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                            Orders, payments, delivery, returns, and account help for Sportsync customers.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`border rounded-sm transition-all duration-300 ${openIndex === index ? 'border-primary bg-secondary shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex justify-between items-center px-8 py-7 text-left"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className={`text-xl ${openIndex === index ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {faq.icon}
                                        </div>
                                        <span className="text-lg font-bold text-foreground">{faq.question}</span>
                                    </div>
                                    {openIndex === index ? <FaMinus className="h-3 w-3" /> : <FaPlus className="h-3 w-3 text-muted-foreground" />}
                                </button>

                                {openIndex === index && (
                                    <div className="px-8 pb-8">
                                        <p className="pl-14 text-muted-foreground leading-relaxed max-w-2xl">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 bg-secondary p-12 text-center rounded-sm border border-border">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground mb-4">Still need help?</h3>
                        <p className="text-muted-foreground mb-8">Reach us by email or WhatsApp — we typically respond within one business day.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a
                                href={`mailto:${SPORTSYNC_CONTACT.email}?subject=Sportsync%20Support`}
                                onClick={() => toast.success(`Email: ${SPORTSYNC_CONTACT.email}`)}
                                className="bg-card border border-primary text-foreground px-8 py-3 uppercase tracking-widest font-bold text-[10px] hover:bg-primary hover:text-primary-foreground transition-all rounded-sm"
                            >
                                Email Support
                            </a>
                            <a
                                href={`https://wa.me/${SPORTSYNC_CONTACT.phoneWa}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-widest font-bold text-[10px] hover:opacity-90 transition-all rounded-sm"
                            >
                                WhatsApp Chat
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <FloatingWhatsApp />
            <Footer />
        </div>
    );
};

export default FaqPage;
