
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../shared/Button';
import { useNavigate } from 'react-router-dom';
import { MastercardIcon, PaypalIcon, VisaIcon } from '../Icons';

const PaymentIcon: React.FC<{ children: React.ReactNode, className?: string, [key: string]: any }> = ({ children, className, ...props }) => (
    <motion.div 
        className={`absolute w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 ${className}`}
        {...props}
    >
        <div className="w-12 h-12 bg-[#1C1C1C] rounded-full flex items-center justify-center">
            {children}
        </div>
    </motion.div>
);

const HeroSection: React.FC = () => {
    const navigate = useNavigate();
    
    const floatAnimation = (delay: number) => ({
        y: ["0rem", "-0.75rem", "0rem"],
        transition: {
            duration: 4 + delay * 2,
            ease: "easeInOut",
            repeat: Infinity,
            delay: delay
        }
    });

    return (
        <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center text-center overflow-hidden bg-transparent">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
            
            <div className="relative z-20 container mx-auto px-6 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <h1 className="text-5xl md:text-7xl font-plex font-bold text-white mb-6 leading-tight max-w-4xl tracking-tight">
                        Empower Your Finances with <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">AI-Driven Insights</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        The all-in-one AI finance platform for modern businesses. Gain AI-powered clarity and control over your cash flow.
                    </p>
                    <div className="flex items-center justify-center">
                        <Button 
                            type="button"
                            onClick={() => navigate('/signup')} 
                            className="px-8 py-3 text-base font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-400/40 transition-all duration-300"
                        >
                           Get Started
                        </Button>
                    </div>
                </motion.div>
            </div>
            
            <div className="absolute inset-x-0 bottom-0 h-1/2 w-full overflow-hidden">
                <motion.div 
                    className="absolute inset-x-0 bottom-[-30%] h-[500px] w-full"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black to-transparent z-10"></div>
                    <div className="absolute w-[1200px] h-[600px] left-1/2 -translate-x-1/2 bottom-0">
                        {/* Glowing heart */}
                        <div className="absolute w-48 h-48 left-1/2 top-1/2 -translate-x-1/2 -translate-y-[80%] bg-white/40 rounded-full blur-3xl"
                         style={{
                             clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                             transform: 'rotate(45deg) translate(-50%, -50%)',
                             left: '50%',
                             top: '50%',
                             transformOrigin: 'center'
                         }}
                        ></div>
                        <div className="absolute w-full h-full [mask-image:radial-gradient(ellipse_40%_30%_at_50%_100%,#000_40%,transparent_100%)]">
                            <div className="absolute w-full h-full bg-orange-500/30 rounded-[50%]"></div>
                        </div>

                         <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-[1000px] h-[500px] left-1/2 -translate-x-1/2 bottom-0 border-t border-white/10 rounded-[50%]"
                        ></motion.div>
                        <motion.div
                             animate={{ rotate: -360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-[800px] h-[400px] left-1/2 -translate-x-1/2 bottom-0 border-t border-white/10 rounded-[50%]"
                        ></motion.div>
                        <div className="absolute w-[600px] h-[300px] left-1/2 -translate-x-1/2 bottom-0 border-t border-white/10 rounded-[50%]"></div>
                        
                        <PaymentIcon animate={floatAnimation(0.2)} className="left-[15%] bottom-[30%] hidden sm:flex">
                            <MastercardIcon className="w-8 h-8" />
                        </PaymentIcon>
                        <PaymentIcon animate={floatAnimation(0)} className="left-1/2 -translate-x-1/2 bottom-[10%]">
                            <PaypalIcon className="w-8 h-8" />
                        </PaymentIcon>
                        <PaymentIcon animate={floatAnimation(0.4)} className="right-[15%] bottom-[30%] hidden sm:flex">
                             <VisaIcon className="w-8 h-8" />
                        </PaymentIcon>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;