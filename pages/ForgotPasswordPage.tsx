import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Icons';
import Button from '../components/shared/Button';
import AnimatedBackground from '../components/landing/VeoBackground';
import Spinner from '../components/shared/Spinner';

const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordResetEmail, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendPasswordResetEmail(email);
    // This check is a bit simplified, but in our mock case, if there's no error, it succeeded.
    if (!error) {
        setIsSubmitted(true);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="bg-black text-gray-300 font-sans antialiased relative min-h-screen flex items-center justify-center isolate">
      <AnimatedBackground />
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
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
        {isSubmitted ? (
          <div className="text-center">
            <h1 className="text-3xl font-plex font-bold text-white">Check Your Email</h1>
            <p className="mt-2 text-gray-400">
              If an account with that email exists, we've sent instructions to reset your password.
            </p>
            <Button
              onClick={() => navigate('/signin')}
              className="w-full mt-6 py-3 text-base font-semibold"
              variant="light"
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-plex font-bold text-white">Reset Your Password</h1>
              <p className="mt-2 text-gray-400">Enter your email and we'll send you a link to get back into your account.</p>
            </div>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Email address"
                />
              </div>

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}

              <div>
                <Button
                  type="submit"
                  className="w-full py-3 text-base font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-400/40 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : 'Send Reset Link'}
                </Button>
              </div>
            </form>
            <div className="text-sm text-center">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signin') }} className="font-medium text-orange-500 hover:text-orange-400">
                Back to Sign in
              </a>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
