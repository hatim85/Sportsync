import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { FaFutbol, FaRunning, FaMedal, FaUsers, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const About = () => {
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

      <main className="flex-grow">
        <section className="relative py-24 bg-secondary overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground font-bold mb-4 block">Our Story</span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-foreground mb-8 leading-tight">
              Built for<br />Every Athlete
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Sportsync is an Indian sports retail brand helping players and fitness enthusiasts find reliable gear — from cricket and football to badminton, running, and training equipment.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed text-lg border-l-4 border-primary pl-6">
                To make quality sports equipment accessible across India — with honest pricing, fast delivery, and support you can reach on WhatsApp.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you play competitively or train for fitness, we curate products that match real playing conditions: durable balls, proper footwear, racquets, protective gear, and accessories from trusted brands.
              </p>
            </div>
            <div className="aspect-[4/5] bg-gradient-to-br from-primary/20 via-secondary to-background rounded-sm border border-border flex items-center justify-center p-12">
              <div className="text-center space-y-4">
                <FaFutbol className="h-24 w-24 text-primary mx-auto opacity-80" />
                <p className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Play Hard. Train Smart.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary py-24 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { icon: <FaMedal />, title: 'Quality Gear', desc: 'Curated for performance and durability.' },
                { icon: <FaRunning />, title: 'Wide Range', desc: 'Cricket, football, badminton, fitness & more.' },
                { icon: <FaFutbol />, title: 'Fair Pricing', desc: 'Transparent prices with secure checkout.' },
                { icon: <FaUsers />, title: 'Real Support', desc: 'Email & WhatsApp help when you need it.' },
              ].map((value, idx) => (
                <div key={idx} className="text-center space-y-4">
                  <div className="text-3xl mb-6 flex justify-center opacity-90">{value.icon}</div>
                  <h3 className="text-sm font-black tracking-widest uppercase">{value.title}</h3>
                  <p className="text-primary-foreground/80 text-sm leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-32 text-center space-y-8">
          <p className="text-muted-foreground text-xl leading-relaxed">
            Thank you for choosing Sportsync. We are proud to equip the next generation of Indian athletes — on the pitch, court, track, and gym.
          </p>
          <div className="h-px w-24 bg-primary mx-auto opacity-30" />
          <Link
            to="/explore"
            className="inline-block bg-foreground text-background px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-opacity"
          >
            Explore Sports Gear
          </Link>
        </section>
      </main>

      <FloatingWhatsApp />
      <Footer />
    </div>
  );
};

export default About;
