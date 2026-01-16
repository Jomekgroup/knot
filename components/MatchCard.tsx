import React, { useState } from 'react';
import { Match } from '../types';
import { VerifiedIcon } from './icons/VerifiedIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface MatchCardProps {
  match: Match;
  onCardClick: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onCardClick }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // FIX: Safety check for profileImageUrls to prevent "reading 0 of undefined"
  const images = match?.profileImageUrls || [];
  const currentImage = images[currentPhotoIndex] || 'https://via.placeholder.com/400x500?text=No+Image';
  const hasMultipleImages = images.length > 1;

  const isGlobal = match.id?.startsWith('global_');

  const handlePhotoTap = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation(); 
    if (images.length === 0) return; // FIX: Don't calculate if no images exist

    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const isRightSide = clientX > left + width / 2;

    if (isRightSide) {
      setCurrentPhotoIndex(prev => Math.min(prev + 1, images.length - 1));
    } else {
      setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
      <div
        className="relative aspect-[4/5] bg-gray-200 cursor-pointer"
        onClick={() => onCardClick(match)}
      >
        <img
          src={currentImage} // FIX: Uses the safe currentImage variable
          alt={`${match.name || 'User'}'s photo`}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x500?text=Error+Loading'; }}
        />

        {isGlobal && (
            <div className="absolute top-12 left-3 z-20 flex items-center gap-1 bg-brand-primary/80 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-white/20">
                <SparklesIcon className="w-3 h-3" />
                <span>Cloud Match</span>
            </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

        {/* FIX: Safe mapping using images variable */}
        {hasMultipleImages && (
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-1.5">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0" onClick={handlePhotoTap} />
        
        <div className="absolute bottom-0 left-0 p-4 text-white w-full">
            <div className="flex items-center">
                <h3 className="text-2xl font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {match.name}, {match.age}
                </h3>
                {match.isVerified && <VerifiedIcon className="w-6 h-6 ml-2 text-white" />}
            </div>
            <p className="text-sm font-medium text-white/90" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{match.occupation}</p>
            <p className="text-xs font-light text-white/80" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{match.city}, {match.country}</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-700 italic line-clamp-2">
          "{match.marriageExpectations || match.bio || 'No bio provided'}"
        </p>
        <div className="flex justify-between items-center mt-4">
          <div className="text-[10px] text-gray-400 font-bold uppercase">{match.marriageTimeline || 'Flexible'} Timeline</div>
          <button 
            onClick={() => onCardClick(match)}
            className="bg-brand-primary text-white font-bold px-6 py-2 rounded-lg text-xs hover:bg-brand-secondary transition-all shadow active:scale-95"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;