import React, { useState } from 'react';
import { KnotLogo } from './KnotLogo';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { GmailIcon } from './icons/GmailIcon';
import { AppleIcon } from './icons/AppleIcon';
// --- AUTH INTEGRATION ---
import { supabase } from '../services/supabaseClient';
import { useToast } from './feedback/useToast';

const AuthScreen: React.FC<{ onLogin: (name?: string) => void }> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setShowEmailForm(false);
    };
    
    const handleEmailContinue = () => {
        setShowEmailForm(true);
    };
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // --- LOG IN LOGIC ---
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                addToast("Welcome back!", "success");
                onLogin();
            } else {
                // --- SIGN UP LOGIC ---
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        }
                    }
                });
                if (error) throw error;
                addToast("Account created! Check your email for verification.", "success");
                // Switch to login mode after signup
                setIsLogin(true);
                setShowEmailForm(true);
            }
        } catch (error: any) {
            addToast(error.message || "An error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    // Social login placeholder logic
    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
        });
        if (error) addToast(error.message, "error");
    };

    return (
        <div className="min-h-screen bg-brand-light flex flex-col justify-center items-center p-6">
            <KnotLogo className="text-4xl mb-8" />
            
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-brand-dark mb-6">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>

                {showEmailForm ? (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {!isLogin && (
                             <div>
                                <label className="text-sm font-medium text-gray-700" htmlFor="name">Name</label>
                                <input 
                                    id="name"
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                                    placeholder="Your Name"
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                            <input 
                                id="email"
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                            <input 
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                                placeholder="••••••••"
                            />
                        </div>
                         <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-secondary transition-colors mt-2 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <button 
                            onClick={() => handleSocialLogin('google')} 
                            className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <GmailIcon className="w-5 h-5" />
                            Continue with Gmail
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('apple')} 
                            className="w-full flex items-center justify-center gap-3 bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <AppleIcon className="w-5 h-5" />
                            Continue with Apple
                        </button>
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                        <button onClick={handleEmailContinue} className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors">
                            <EnvelopeIcon className="w-5 h-5" />
                            Continue with Email
                        </button>
                    </div>
                )}

                <p className="text-center text-sm text-gray-500 mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={toggleAuthMode} className="font-semibold text-brand-primary hover:underline">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;