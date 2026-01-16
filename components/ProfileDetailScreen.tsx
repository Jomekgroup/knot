
import React, { useState, useEffect } from 'react';
import { Match, User } from '../types';
import { VerifiedIcon } from './icons/VerifiedIcon';
import { MessageIcon } from './icons/MessageIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { getCompatibilityInsight } from '../services/matchingService';

interface ProfileDetailScreenProps {
  match: Match;
  user: User;
  onBack: () => void;
  onStartChat: (match: Match) => void;
  onStartCall: (match: Match) => void;
}

interface ProfileSectionProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children, isOpen, onToggle }) => (
    <div className="border-b border-gray-200 px-4">
        <button onClick={onToggle} className="w-full flex justify-between items-center py-4 text-left">
            <h3 className="font-semibold text-lg text-brand-dark">{title}</h3>
            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && <div className="pb-4 space-y-4 text-sm text-gray-700">{children}</div>}
    </div>
);

const ProfileDataItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
        <div className="text-md text-brand-text mt-1">{value}</div>
    </div>
);


const ProfileDetailScreen: React.FC<ProfileDetailScreenProps> = ({ match: initialMatch, user, onBack, onStartChat, onStartCall }) => {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    about: true,
    lifestyle: true,
    marriage: true,
  });

  useEffect(() => {
    const fetchInsight = async () => {
        if (!match.compatibilityInsight) {
            setIsAnalyzing(true);
            const { score, insight } = await getCompatibilityInsight(user, match);
            setMatch(prev => ({ ...prev, compatibilityScore: score, compatibilityInsight: insight }));
            setIsAnalyzing(false);
        }
    };
    fetchInsight();
  }, [match.id, user.id]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({...prev, [section]: !prev[section]}));
  };

  const handlePhotoTap = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const isRightSide = clientX > left + width / 2;

    if (isRightSide) {
      setCurrentPhotoIndex(prev => Math.min(prev + 1, match.profileImageUrls.length - 1));
    } else {
      setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Image Carousel */}
        <div className="relative aspect-square w-full flex-shrink-0">
          <div className="absolute top-4 left-2 right-2 z-20 flex items-center gap-1">
            {match.profileImageUrls.map((_, index) => (
              <div key={index} className={`h-1 flex-1 rounded-full ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
          <button onClick={onBack} className="absolute top-8 left-4 z-20 text-white bg-black/30 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="absolute inset-0" onClick={handlePhotoTap}>
              <img 
                  src={match.profileImageUrls[currentPhotoIndex]} 
                  alt={`${match.name}'s photo ${currentPhotoIndex + 1}`} 
                  className="w-full h-full object-cover" 
              />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Profile Info */}
        <div className="bg-white -mt-10 rounded-t-3xl z-10 relative">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center">
                        <h1 className="text-3xl font-bold text-brand-dark">{match.name}, {match.age}</h1>
                        {match.isVerified && <VerifiedIcon className="w-7 h-7 ml-2 text-blue-500" />}
                    </div>
                    <p className="text-md text-gray-500">{match.city}, {match.country}</p>
                </div>
                {match.compatibilityScore && (
                    <div className="bg-brand-accent/20 px-4 py-2 rounded-2xl flex flex-col items-center">
                        <span className="text-xs font-bold text-brand-dark uppercase">Match</span>
                        <span className="text-2xl font-black text-brand-primary">{match.compatibilityScore}%</span>
                    </div>
                )}
            </div>

            {/* AI Insight Box */}
            <div className="mt-6 bg-brand-light p-4 rounded-2xl border border-brand-primary/10">
                <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-5 h-5 text-brand-primary" />
                    <span className="text-sm font-bold text-brand-primary uppercase tracking-wider">Knot AI Insight</span>
                </div>
                {isAnalyzing ? (
                    <div className="flex items-center gap-3 py-2">
                        <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-600 animate-pulse">Analyzing marriage compatibility...</p>
                    </div>
                ) : (
                    <p className="text-sm text-brand-text leading-relaxed">
                        {match.compatibilityInsight || "Connecting to compatibility engine..."}
                    </p>
                )}
            </div>
          </div>
          
          <div className="space-y-0">
              <ProfileSection title={`About ${match.name}`} isOpen={openSections.about} onToggle={() => toggleSection('about')}>
                  <div className="grid grid-cols-2 gap-4">
                      <ProfileDataItem label="Marital Status" value={match.maritalStatus} />
                      <ProfileDataItem label="Children" value={match.childrenStatus} />
                  </div>
                  <ProfileDataItem label="Bio" value={match.bio} />
                  <ProfileDataItem label="Occupation" value={match.occupation} />
                  <ProfileDataItem label="Education" value={match.education} />
                  <ProfileDataItem label="Languages" value={match.languages.join(', ')} />
              </ProfileSection>

              <ProfileSection title="Lifestyle & Values" isOpen={openSections.lifestyle} onToggle={() => toggleSection('lifestyle')}>
                  <ProfileDataItem label="Religion" value={match.religion} />
                  <ProfileDataItem label="Cultural Background" value={match.culturalBackground} />
                  <ProfileDataItem label="Personal Values" value={
                      <div className="flex flex-wrap gap-2 mt-1">
                          {match.personalValues.map(v => <span key={v} className="bg-brand-light text-brand-secondary text-xs font-medium px-2 py-1 rounded-full">{v}</span>)}
                      </div>
                  } />
                  <ProfileDataItem label="Smoking / Drinking" value={`${match.smoking} / ${match.drinking}`} />
              </ProfileSection>

              <ProfileSection title="Marriage Expectations" isOpen={openSections.marriage} onToggle={() => toggleSection('marriage')}>
                  <ProfileDataItem label="Marriage Timeline" value={match.marriageTimeline} />
                  <ProfileDataItem label="Willing to Relocate" value={match.willingToRelocate} />
                  <ProfileDataItem label="Desired Partner Location" value={match.preferredMarryFrom} />
                  <ProfileDataItem label="Children Preference" value={match.childrenPreference} />
                  <ProfileDataItem label="Ideal Partner Traits" value={
                      <div className="flex flex-wrap gap-2 mt-1">
                          {match.idealPartnerTraits.map(t => <span key={t} className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">{t}</span>)}
                      </div>
                  } />
              </ProfileSection>
          </div>
        </div>
      </div>
      
       {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => onStartChat(match)} className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 rounded-lg text-lg hover:bg-brand-secondary transition-colors">
              <MessageIcon className="w-6 h-6" />
              <span>Chat</span>
          </button>
           <button onClick={() => onStartCall(match)} className="flex-1 flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-3 rounded-lg text-lg hover:bg-purple-800 transition-colors">
              <VideoCameraIcon className="w-6 h-6" />
              <span>Video Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailScreen;
