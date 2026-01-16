
import React, { useState } from 'react';
import { User } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { CameraIcon } from './icons/CameraIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { VerifiedIcon } from './icons/VerifiedIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface ProfileCardProps {
  user: User;
  onEditProfile: () => void;
  onManagePhotos: () => void;
  onVerifyProfile: () => void;
}

interface ProfileSectionProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children, isOpen, onToggle }) => (
    <div className="border-b border-gray-200">
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


const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEditProfile, onManagePhotos, onVerifyProfile }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    about: true,
    lifestyle: false,
    marriage: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({...prev, [section]: !prev[section]}));
  };

  return (
    <div className="bg-white">
        <div className="relative">
            <img className="h-48 w-full object-cover" src={user.profileImageUrls[0]} alt={user.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold">{user.name}, {user.age}</h1>
                    {user.isVerified && <VerifiedIcon className="w-7 h-7 ml-2 text-white" />}
                </div>
                <p className="text-sm">{user.city}, {user.country}</p>
            </div>
        </div>
        <div className="p-6">
            <div className="flex justify-around items-center text-center -mt-16 mb-6">
                 <button onClick={onManagePhotos} className="flex flex-col items-center justify-center bg-white rounded-full shadow-md w-24 h-24 text-gray-600 hover:text-brand-primary transition-colors">
                    <CameraIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs font-semibold">Photos</span>
                </button>
                 <button onClick={onEditProfile} className="flex flex-col items-center justify-center bg-white rounded-full shadow-lg w-32 h-32 border-4 border-brand-primary text-brand-primary hover:bg-brand-light transition-colors">
                    <PencilIcon className="w-10 h-10 mb-1" />
                    <span className="text-sm font-bold">Edit Profile</span>
                </button>
                 <button onClick={onVerifyProfile} disabled={user.isVerified} className="flex flex-col items-center justify-center bg-white rounded-full shadow-md w-24 h-24 text-gray-600 hover:text-brand-primary transition-colors disabled:opacity-50 disabled:hover:text-gray-600">
                    {user.isVerified ? <VerifiedIcon className="w-8 h-8 mb-1 text-blue-500" /> : <ShieldCheckIcon className="w-8 h-8 mb-1" />}
                    <span className="text-xs font-semibold">{user.isVerified ? 'Verified' : 'Verify'}</span>
                </button>
            </div>

            <div className="-mx-6">
                <ProfileSection title="About Me" isOpen={openSections.about} onToggle={() => toggleSection('about')}>
                    <div className="grid grid-cols-2 gap-4">
                        <ProfileDataItem label="Marital Status" value={user.maritalStatus} />
                        <ProfileDataItem label="Children" value={user.childrenStatus} />
                    </div>
                    <ProfileDataItem label="Bio" value={user.bio} />
                    <ProfileDataItem label="Occupation" value={user.occupation} />
                    <ProfileDataItem label="Education" value={user.education} />
                    <ProfileDataItem label="Languages" value={user.languages.join(', ')} />
                </ProfileSection>

                <ProfileSection title="Lifestyle & Values" isOpen={openSections.lifestyle} onToggle={() => toggleSection('lifestyle')}>
                    <ProfileDataItem label="Religion" value={user.religion} />
                    <ProfileDataItem label="Cultural Background" value={user.culturalBackground} />
                    <ProfileDataItem label="Personal Values" value={
                        <div className="flex flex-wrap gap-2 mt-1">
                            {user.personalValues.map(v => <span key={v} className="bg-brand-light text-brand-secondary text-xs font-medium px-2 py-1 rounded-full">{v}</span>)}
                        </div>
                    } />
                    <ProfileDataItem label="Smoking / Drinking" value={`${user.smoking} / ${user.drinking}`} />
                </ProfileSection>

                <ProfileSection title="Marriage Expectations" isOpen={openSections.marriage} onToggle={() => toggleSection('marriage')}>
                    <ProfileDataItem label="Marriage Timeline" value={user.marriageTimeline} />
                    <ProfileDataItem label="Willing to Relocate" value={user.willingToRelocate} />
                    <ProfileDataItem label="Desired Partner Location" value={user.preferredMarryFrom} />
                    <ProfileDataItem label="Children Preference" value={user.childrenPreference} />
                    <ProfileDataItem label="Ideal Partner Traits" value={
                        <div className="flex flex-wrap gap-2 mt-1">
                            {user.idealPartnerTraits.map(t => <span key={t} className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">{t}</span>)}
                        </div>
                    } />
                </ProfileSection>
            </div>
        </div>
    </div>
  );
};

export default ProfileCard;
