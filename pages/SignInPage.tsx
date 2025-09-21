import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Logo, GoogleIcon } from '../components/Icons';
import Button from '../components/shared/Button';
import AnimatedBackground from '../components/landing/VeoBackground';
import Spinner from '../components/shared/Spinner';

const SignInPage: React.FC = () => {
  const { signIn, signInWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const credentials = Object.fromEntries(formData.entries());
    
    await signIn({
        email: credentials.email as string,
        password: credentials.password as string,
    });
    // Successful login is handled by the router in App.tsx
  };
  
  const handleLogoClick = () => {
      navigate('/');
  }

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
        <div className="text-center">
          <h1 className="text-3xl font-plex font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Sign in to access your dashboard.</p>
        </div>
        
        <div className="space-y-4">
            <Button 
                onClick={signInWithGoogle}
                variant="light"
                className="w-full py-3 text-base font-semibold"
                disabled={isLoading}
            >
                {isLoading ? <Spinner className="text-gray-800" /> : (
                    <>
                        <GoogleIcon className="w-5 h-5" />
                        <span>Sign in with Google</span>
                    </>
                )}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#111111] text-gray-500">Or continue with email</span>
                </div>
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
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Email address"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Password"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} className="font-medium text-orange-500 hover:text-orange-400">
                            Forgot your password?
                        </a>
                    </div>
                </div>

                {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                <div>
                    <Button 
                        type="submit"
                        className="w-full py-3 text-base font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-400/40 transition-all duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner /> : 'Sign in'}
                    </Button>
                </div>
            </form>
            <div className="text-sm text-center">
                <span className="text-gray-400">Don't have an account? </span>
                <a href="#" onClick={(e) => {e.preventDefault(); navigate('/signup')}} className="font-medium text-orange-500 hover:text-orange-400">
                    Sign up
                </a>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignInPage;
