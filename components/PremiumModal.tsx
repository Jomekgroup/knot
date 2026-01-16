import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { HeartIcon } from './icons/HeartIcon';
import { VerifiedIcon } from './icons/VerifiedIcon';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 relative animate-slide-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-100 z-10">
            <CloseIcon className="w-6 h-6" />
        </button>
        <div className="p-6 text-center">
            <div className="relative inline-block">
                <HeartIcon className="w-16 h-16 text-brand-primary mx-auto mb-4" />
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-brand-accent text-brand-dark text-xs font-bold shadow-md">★</span>
            </div>
            <h2 className="text-2xl font-bold text-brand-dark">Unlock "Likes You"</h2>
            <p className="text-gray-600 mt-2 mb-6">Upgrade to Knot Premium to see everyone who has already liked your profile.</p>
            
            <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center"><VerifiedIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> <span className="font-semibold">See Who Likes You</span> &mdash; Match instantly.</li>
                <li className="flex items-center"><VerifiedIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> <span className="font-semibold">Advanced Filters</span> &mdash; Find your perfect partner.</li>
                <li className="flex items-center"><VerifiedIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> <span className="font-semibold">Read Receipts</span> &mdash; Know when they've read your message.</li>
            </ul>

            <button onClick={onUpgrade} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg text-lg hover:bg-brand-secondary transition-colors shadow-lg">
                Go Premium - $9.99/mo
            </button>
            <button onClick={onClose} className="text-sm text-gray-500 mt-4 hover:underline">
                Maybe Later
            </button>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0.8; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default PremiumModal;