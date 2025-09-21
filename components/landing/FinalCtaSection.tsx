
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../shared/Button';
import { useNavigate } from 'react-router-dom';

const FinalCtaSection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="py-20 bg-black/70 backdrop-blur-sm">
            <div className="container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl font-plex font-bold text-white">Ready to Supercharge Your Finances with AI?</h2>
                    <p className="text-lg text-gray-400 mt-4 mb-8 max-w-xl mx-auto">
                        Get started in minutes. No credit card required.
                    </p>
                    <Button 
                        type="button"
                        onClick={() => navigate('/signup')} 
                        className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-400/40 transition-all duration-300"
                    >
                       Get Started
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCtaSection;