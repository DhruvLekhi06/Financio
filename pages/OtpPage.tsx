import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Icons';
import Button from '../components/shared/Button';
import AnimatedBackground from '../components/landing/VeoBackground';
import Spinner from '../components/shared/Spinner';

const OtpPage: React.FC = () => {
  const { verifyOtp, tempAuthDetails, isLoading, error, signUp } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // If there's no temporary user data, redirect to sign-up
    if (!tempAuthDetails) {
      navigate('/signup');
    }
  }, [tempAuthDetails, navigate]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!otp.trim()) return;

    const success = await verifyOtp(otp);
    if (success) {
      // The router in App.tsx will handle redirecting to the dashboard
      // because isAuthenticated will become true.
    }
  };
  
  const handleResendCode = async () => {
    // In a real app, this would trigger the backend to send a new OTP.
    // Here we can just re-run the signUp logic to simulate it.
    if(tempAuthDetails) {
        await signUp(tempAuthDetails);
        alert("A new OTP has been sent (Hint: it's still 123456)");
    }
  }

  return (
    <div className="bg-black text-gray-300 font-sans antialiased relative min-h-screen flex items-center justify-center isolate">
      <AnimatedBackground />
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Logo className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">FinancioAI</span>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full max-w-md p-8 space-y-6 bg-black/50 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl z-10"
      >
        <div className="text-center">
          <h1 className="text-3xl font-plex font-bold text-white">Verify Your Account</h1>
          <p className="mt-2 text-gray-400">
            We sent a 6-digit code to {tempAuthDetails?.phoneNumber || 'your phone'}.
            <br />
            (For demo purposes, the code is <strong>123456</strong>)
          </p>
        </div>
        
        <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div>
                <label htmlFor="otp" className="sr-only">Verification Code</label>
                <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 text-center text-2xl tracking-[1em] bg-gray-900/50 border border-gray-700 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="------"
                    maxLength={6}
                />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div>
                <Button 
                    type="submit"
                    className="w-full py-3 text-base font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-400/40 transition-all duration-300"
                    disabled={isLoading || otp.length < 6}
                >
                    {isLoading ? <Spinner /> : 'Verify'}
                </Button>
            </div>
        </form>
        <div className="text-sm text-center">
            <span className="text-gray-400">Didn't receive the code? </span>
            <button onClick={handleResendCode} className="font-medium text-orange-500 hover:text-orange-400 disabled:opacity-50" disabled={isLoading}>
                Resend
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpPage;