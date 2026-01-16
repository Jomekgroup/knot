
import React, { useState } from 'react';
import { User, SmokingHabits, DrinkingHabits, MaritalStatus, ChildrenStatus, WillingToRelocate, ChildrenPreference, TravelFrequency, SocialActivity } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface EditProfileScreenProps {
  user: User;
  onBack: () => void;
  onSave: (updatedUser: User) => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ user, onBack, onSave }) => {
  const [formData, setFormData] = useState<User>(user);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof User) => {
    const value = e.target.value.split(',').map(item => item.trim());
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    onSave(formData);
  };
  
  const inputClass = "w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-brand-text focus:bg-white focus:ring-2 focus:ring-brand-secondary focus:outline-none";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const sectionClass = "p-4 bg-white rounded-lg shadow-sm border border-gray-200";

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-brand-dark">Edit Profile</h1>
        <button onClick={onBack} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className={sectionClass}>
          <h2 className="text-lg font-bold mb-4 text-brand-primary">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>Name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={inputClass} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="maritalStatus" className={labelClass}>Marital Status</label>
                <select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputClass}>
                    {Object.values(MaritalStatus).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="childrenStatus" className={labelClass}>Children Status</label>
                <select id="childrenStatus" name="childrenStatus" value={formData.childrenStatus} onChange={handleChange} className={inputClass}>
                    {Object.values(ChildrenStatus).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

             <div>
              <label htmlFor="age" className={labelClass}>Age</label>
              <input id="age" name="age" type="number" value={formData.age} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="nationality" className={labelClass}>Nationality</label>
              <input id="nationality" name="nationality" type="text" value={formData.nationality} onChange={handleChange} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label htmlFor="city" className={labelClass}>City</label>
                  <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="country" className={labelClass}>Country</label>
                  <input id="country" name="country" type="text" value={formData.country} onChange={handleChange} className={inputClass} />
                </div>
            </div>
            <div>
              <label htmlFor="languages" className={labelClass}>Languages Spoken</label>
              <input id="languages" name="languages" type="text" value={formData.languages.join(', ')} onChange={(e) => handleArrayChange(e, 'languages')} className={inputClass} placeholder="English, Spanish, etc."/>
            </div>
            <div>
              <label htmlFor="bio" className={labelClass}>Bio</label>
              <textarea id="bio" name="bio" rows={4} value={formData.bio} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-lg font-bold mb-4 text-brand-primary">Education & Career</h2>
           <div className="space-y-4">
             <div>
              <label htmlFor="education" className={labelClass}>Educational Qualification</label>
              <input id="education" name="education" type="text" value={formData.education} onChange={handleChange} className={inputClass} />
            </div>
             <div>
              <label htmlFor="occupation" className={labelClass}>Occupation</label>
              <input id="occupation" name="occupation" type="text" value={formData.occupation} onChange={handleChange} className={inputClass} />
            </div>
             <div>
              <label htmlFor="careerGoals" className={labelClass}>Career Goals</label>
              <textarea id="careerGoals" name="careerGoals" rows={2} value={formData.careerGoals} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>
        
        <div className={sectionClass}>
          <h2 className="text-lg font-bold mb-4 text-brand-primary">Lifestyle & Values</h2>
           <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="smoking" className={labelClass}>Smoking</label>
                <select id="smoking" name="smoking" value={formData.smoking} onChange={handleChange} className={inputClass}>
                  {Object.values(SmokingHabits).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="drinking" className={labelClass}>Drinking</label>
                <select id="drinking" name="drinking" value={formData.drinking} onChange={handleChange} className={inputClass}>
                  {Object.values(DrinkingHabits).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="religion" className={labelClass}>Religion / Spiritual Beliefs</label>
              <input id="religion" name="religion" type="text" value={formData.religion} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="culturalBackground" className={labelClass}>Cultural / Ethnic Background</label>
              <input id="culturalBackground" name="culturalBackground" type="text" value={formData.culturalBackground} onChange={handleChange} className={inputClass} />
            </div>
             <div>
              <label htmlFor="personalValues" className={labelClass}>Core Values</label>
              <input id="personalValues" name="personalValues" type="text" value={formData.personalValues.join(', ')} onChange={(e) => handleArrayChange(e, 'personalValues')} className={inputClass} placeholder="Honesty, Family, etc."/>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-lg font-bold mb-4 text-brand-primary">Marriage Expectations</h2>
          <div className="space-y-4">
             <div>
              <label htmlFor="marriageTimeline" className={labelClass}>How soon to get married?</label>
              <input id="marriageTimeline" name="marriageTimeline" type="text" value={formData.marriageTimeline} onChange={handleChange} className={inputClass} placeholder="e.g., 1-2 years" />
            </div>
             <div>
              <label htmlFor="childrenPreference" className={labelClass}>Future Children Preferences</label>
              <select id="childrenPreference" name="childrenPreference" value={formData.childrenPreference} onChange={handleChange} className={inputClass}>
                  {Object.values(ChildrenPreference).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="willingToRelocate" className={labelClass}>Willingness to Relocate</label>
              <select id="willingToRelocate" name="willingToRelocate" value={formData.willingToRelocate} onChange={handleChange} className={inputClass}>
                  {Object.values(WillingToRelocate).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="preferredMarryFrom" className={labelClass}>Desired Partner Location</label>
              <input id="preferredMarryFrom" name="preferredMarryFrom" type="text" value={formData.preferredMarryFrom} onChange={handleChange} className={inputClass} placeholder="e.g., USA, Canada, anywhere"/>
            </div>
            <div>
              <label htmlFor="idealPartnerTraits" className={labelClass}>Ideal Partner Traits</label>
              <input id="idealPartnerTraits" name="idealPartnerTraits" type="text" value={formData.idealPartnerTraits.join(', ')} onChange={(e) => handleArrayChange(e, 'idealPartnerTraits')} className={inputClass} placeholder="Kind, Ambitious, etc."/>
            </div>
            <div>
              <label htmlFor="marriageExpectations" className={labelClass}>Detailed Expectations</label>
              <textarea id="marriageExpectations" name="marriageExpectations" rows={3} value={formData.marriageExpectations} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

      </main>

      <footer className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <button onClick={handleSave} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-secondary transition-colors">
          Save Changes
        </button>
      </footer>
    </div>
  );
};

export default EditProfileScreen;
