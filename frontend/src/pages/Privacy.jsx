import React from 'react';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { FaShieldAlt, FaLock, FaUserShield, FaEye, FaSync, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { SPORTSYNC_CONTACT } from '../constants/shopCategories.js';

const Privacy = () => {
  const sections = [
    {
      icon: <FaUserShield />,
      title: 'Information We Collect',
      content:
        'When you register, we collect your name, email, and account details. When you order, we collect delivery address, phone number, order history, and payment references. Payments via Razorpay are processed on their secure platform.',
    },
    {
      icon: <FaEye />,
      title: 'How We Use Your Data',
      content:
        'We use your information to process orders, send order updates, improve our sports catalogue, prevent fraud, and respond to support requests. We do not sell your personal data to third parties.',
    },
    {
      icon: <FaLock />,
      title: 'Payment & Security',
      content:
        'Online payments are handled by Razorpay (PCI-DSS compliant). Sportsync stores order and delivery data on secured servers. Always use a strong password and sign out on shared devices.',
    },
    {
      icon: <FaSync />,
      title: 'Cookies & Updates',
      content:
        'We use cookies for sign-in sessions and cart functionality. This policy may be updated; the latest version will always be published on this page with a revised date.',
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Last updated: May 2026 · Sportsync · {SPORTSYNC_CONTACT.city}
            </p>
          </div>

          <div className="bg-secondary p-10 rounded-sm border border-border mb-16">
            <div className="flex items-start space-x-6">
              <div className="bg-primary text-primary-foreground p-4 rounded-full shrink-0">
                <FaShieldAlt className="h-6 w-6" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Your Privacy Matters</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sportsync (&quot;we&quot;, &quot;us&quot;) operates sportsync.com and related services. This policy explains what data we collect when you shop for sports equipment, how we use it, and your rights as a customer in India.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-4 p-8 border border-border rounded-sm bg-card">
                <div className="text-2xl text-primary">{section.icon}</div>
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground">{section.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6 text-sm leading-relaxed">
            <p>
              <strong className="text-foreground">Third-party services:</strong> We use Razorpay for payments, and may use analytics or hosting providers that process limited technical data (IP address, browser type) under their own policies.
            </p>
            <p>
              <strong className="text-foreground">Data retention:</strong> Order records are kept as required for tax, refunds, and customer support. You may request account deletion by emailing us; some transactional data may be retained where legally required.
            </p>
            <p>
              <strong className="text-foreground">Contact:</strong> For privacy questions or data requests, email{' '}
              <a href={`mailto:${SPORTSYNC_CONTACT.email}`} className="text-primary font-bold hover:underline">
                {SPORTSYNC_CONTACT.email}
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <FloatingWhatsApp />
      <Footer />
    </div>
  );
};

export default Privacy;
