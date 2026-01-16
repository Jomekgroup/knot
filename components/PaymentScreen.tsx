import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { LockIcon } from './icons/LockIcon';
import { useToast } from './feedback/useToast';
import { supabase } from '../services/supabaseClient';

interface PaymentScreenProps {
  onBack: () => void;
  onSubscribe: () => void;
  userEmail?: string;
}

// Typing for the Paystack window object
declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ onBack, onSubscribe, userEmail: initialEmail }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [email, setEmail] = useState(initialEmail || "");
    const { addToast } = useToast();

    // 1. Fetch current user if email wasn't provided as a prop
    useEffect(() => {
        const getUser = async () => {
            if (!email) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.email) setEmail(user.email);
            }
        };
        getUser();
    }, [email]);

    const handlePaystackPayment = async () => {
        if (!email) {
            addToast("User email not found. Please log in again.", "error");
            return;
        }

        setIsProcessing(true);

        const handlePaystackPayment = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const handler = window.PaystackPop.setup({
        key: 'pk_test_your_key',
        email: userEmail,
        amount: 9.99 * 100,
        currency: 'USD',
        // ADD THIS METADATA BLOCK
        metadata: {
            user_id: user?.id, // This is what the webhook looks for!
        },
        callback: (response) => {
            verifyAndComplete(response.reference);
        }
    });
    handler.openIframe();
};
        handler.openIframe();
    };

    const verifyAndComplete = async (reference: string) => {
        try {
            // In a production app, you should call a backend/Edge function here
            // to verify the payment status with Paystack before upgrading the user.
            
            // MOCK VERIFICATION FOR PROTOTYPE:
            console.log("Verifying payment reference:", reference);
            
            // Update user profile in Supabase (Optional: depends on your schema)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ is_premium: true })
                    .eq('id', user.id);
            }

            addToast("Payment Successful! Premium activated.", "success");
            onSubscribe(); 
        } catch (error) {
            addToast("Payment recorded but verification failed.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full h-screen bg-gray-100 flex flex-col">
            <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
                <h1 className="text-xl font-bold text-brand-dark">Premium Membership</h1>
                <button onClick={onBack} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-1 p-4">
                <div className="bg-brand-primary text-white p-8 rounded-2xl shadow-lg mb-6 text-center overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Knot Premium</h2>
                        <p className="opacity-90">Find your soulmate faster with advanced tools.</p>
                        <div className="mt-6 flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-black">$9.99</span>
                            <span className="opacity-70">/ month</span>
                        </div>
                    </div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-accent/20 rounded-full"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                     <h2 className="text-lg font-bold text-brand-primary">Why go Premium?</h2>
                     <ul className="space-y-3">
                         <li className="flex items-center gap-3 text-sm text-gray-700">
                             <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px]">✓</div>
                             See who liked your profile instantly
                         </li>
                         <li className="flex items-center gap-3 text-sm text-gray-700">
                             <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px]">✓</div>
                             Unlimited global registry searches
                         </li>
                         <li className="flex items-center gap-3 text-sm text-gray-700">
                             <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px]">✓</div>
                             Priority badge on your profile
                         </li>
                     </ul>
                </div>
            </main>

            <footer className="p-6 bg-white border-t border-gray-200 sticky bottom-0">
                <button 
                    onClick={handlePaystackPayment} 
                    disabled={isProcessing} 
                    className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-secondary transition-all flex items-center justify-center gap-3 disabled:bg-gray-400 active:scale-95 shadow-lg"
                >
                    {isProcessing ? (
                        <>
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         <span>Processing...</span>
                        </>
                    ) : (
                        <>
                        <LockIcon className="w-5 h-5"/>
                        Pay with Paystack
                        </>
                    )}
                </button>
                <div className="mt-4 flex flex-col items-center gap-2">
                    <img src="https://files.readme.io/656515c-paystack-badge.png" alt="Paystack" className="h-6 opacity-60" />
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">Secure Bank-Level Encryption</p>
                </div>
            </footer>
        </div>
    );
};

export default PaymentScreen;