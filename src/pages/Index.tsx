import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Catalog from '@/components/Catalog';
import Features from '@/components/Features';
import SocialProof from '@/components/SocialProof';
import TrustBadges from '@/components/TrustBadges';
import Testimonials from '@/components/Testimonials';
import Delivery from '@/components/Delivery';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';
import FloatingContacts from '@/components/FloatingContacts';
import TelegramButton from '@/components/TelegramButton';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Catalog />
        <TrustBadges />
        <SocialProof />
        <Features />
        <Testimonials />
        <Delivery />
        <ContactForm />
      </main>
      <Footer />
      <FloatingCart />
      <FloatingContacts />
      <TelegramButton />
    </div>
  );
};

export default Index;
