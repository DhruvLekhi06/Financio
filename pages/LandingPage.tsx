import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Logo, MenuIcon, XIcon } from '../components/Icons';
import Button from '../components/shared/Button';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ValuePropsSection from '../components/landing/ValuePropsSection';
import PricingSection from '../components/landing/PricingSection';
import FaqSection from '../components/landing/FaqSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import AnimatedBackground from '../components/landing/VeoBackground';

const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About Us" },
    { href: "#services", label: "Services" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(targetId.substring(1));
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-black text-gray-300 font-sans antialiased relative isolate">
      <AnimatedBackground />
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Logo className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">FinancioAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300">
            {navLinks.map(link => (
                 <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors">{link.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/signin')} 
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-400/40 transition-all duration-300"
            >
              Sign In
            </Button>
            <div className="md:hidden">
                <Button variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    {isMobileMenuOpen ? <XIcon className="w-6 h-6 text-white" /> : <MenuIcon className="w-6 h-6 text-white" />}
                </Button>
            </div>
          </div>
        </div>
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-black/80 backdrop-blur-lg border-t border-white/10"
                >
                    <nav className="flex flex-col items-center gap-2 py-6 text-lg">
                        {navLinks.map(link => (
                            <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="px-4 py-2 rounded-md hover:bg-white/10 transition-colors w-full text-center">{link.label}</a>
                        ))}
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
      </header>

      <main>
        <div id="home"><HeroSection /></div>
        <div id="services"><FeaturesSection /></div>
        <div id="about"><ValuePropsSection /></div>
        <div id="pricing"><PricingSection /></div>
        <div id="faq"><FaqSection /></div>
        <FinalCtaSection />
      </main>
    </div>
  );
};

export default LandingPage;