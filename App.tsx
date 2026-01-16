import React, { useState, useEffect, useCallback } from 'react';
import { User, Match, Screen, FilterState } from './types';
import { INITIAL_FILTERS } from './constants';
// --- AUTH INTEGRATION ---
import { supabase } from './services/supabaseClient'; 
import { db } from './services/databaseService';
import { queryGlobalRegistry } from './services/matchingService';
// ------------------------
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MatchCard from './components/MatchCard';
import ProfileDetailScreen from './components/ProfileDetailScreen';
import ChatScreen from './components/ChatScreen';
import VideoCallScreen from './components/VideoCallScreen';
import ProfileCard from './components/ProfileCard';
import VerificationScreen from './components/VerificationScreen';
import EditProfileScreen from './components/EditProfileScreen';
import PhotoManagerScreen from './components/PhotoManagerScreen';
import AuthScreen from './components/AuthScreen';
import LikesScreen from './components/LikesScreen';
import PremiumModal from './components/PremiumModal';
import MessagesScreen from './components/MessagesScreen';
import ResourceCard from './components/ResourceCard';
import FilterModal from './components/FilterModal';
import PaymentScreen from './components/PaymentScreen';
import GlobalActivityTicker from './components/GlobalActivityTicker';
import { FilterIcon } from './components/icons/FilterIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { RESOURCES_DATA } from './constants';
import { ToastProvider, useToast } from './components/feedback/useToast';

const AppContent: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeScreen, setActiveScreen] = useState<Screen>('home');
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const { addToast } = useToast();

    // --- NEW: FETCH PROFILE FROM SUPABASE ---
    const fetchUserProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            return;
        }
        if (data) setUser(data as User);
    };

    // --- NEW: AUTH STATE LISTENER ---
    useEffect(() => {
        // Check current session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsLoggedIn(true);
                fetchUserProfile(session.user.id);
            }
        });

        // Listen for Login/Logout events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsLoggedIn(true);
                fetchUserProfile(session.user.id);
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load matches separately
    useEffect(() => {
        if (isLoggedIn) {
            db.getMatches().then(setMatches);
        }
    }, [isLoggedIn]);

    const fetchMoreFromGlobalRegistry = useCallback(async (isSilent = false) => {
        if (isSyncing) return;
        setIsSyncing(true);
        if (!isSilent) addToast("Updating from Global Registry...", "info");
        
        try {
            const newMatches = await queryGlobalRegistry(3);
            if (newMatches.length > 0) {
                await db.addGlobalMatches(newMatches);
                const updatedMatches = await db.getMatches();
                setMatches(updatedMatches);
                if (!isSilent) addToast(`Found ${newMatches.length} new profiles.`, "success");
            }
        } catch (e) {
            if (!isSilent) addToast("Registry sync failed.", "error");
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, addToast]);

    const handleLogin = () => {
        // Supabase onAuthStateChange handles the logic now.
        // This just ensures the UI transitions.
        setActiveScreen('home');
        setTimeout(() => fetchMoreFromGlobalRegistry(true), 500);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setActiveScreen('home');
    };

    const handleNavigate = (screen: Screen) => {
        if (screen === 'likes' && user && !user.isPremium) {
            setIsPremiumModalOpen(true);
        } else {
            setActiveScreen(screen);
        }
    };
    
    const handleCardClick = (match: Match) => {
        setSelectedMatch(match);
        setActiveScreen('profileDetail');
    };

    const handleStartChat = (match: Match) => {
        setSelectedMatch(match);
        setActiveScreen('chat');
    };

    const handleStartCall = (match: Match) => {
        setSelectedMatch(match);
        setActiveScreen('videoCall');
    };

    const handleBack = () => {
        if (activeScreen === 'chat' || activeScreen === 'videoCall') {
            setActiveScreen('profileDetail');
        } else if (activeScreen === 'profileDetail' || activeScreen === 'payment') {
            setActiveScreen('home');
            setSelectedMatch(null);
        } else if (['verification', 'editProfile', 'managePhotos'].includes(activeScreen)) {
            setActiveScreen('profile');
            setSelectedMatch(null);
        } else {
            setActiveScreen('home');
            setSelectedMatch(null);
        }
    };
    
    const handleUpgradeClick = () => {
        setIsPremiumModalOpen(false);
        setActiveScreen('payment');
    };

    const handleSubscribe = async () => {
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({ isPremium: true })
                .eq('id', user.id);
            
            if (!error) {
                setUser({ ...user, isPremium: true });
                addToast('Welcome to Premium!', 'success');
                setActiveScreen('likes'); 
            }
        }
    };

    const handleSaveProfile = async (updatedUser: User) => {
        const { error } = await supabase
            .from('profiles')
            .update(updatedUser)
            .eq('id', user?.id);

        if (!error) {
            setUser(updatedUser);
            addToast('Profile saved successfully!', 'success');
            handleBack();
        }
    };

    const handleVerificationComplete = async () => {
        if (user) {
            await supabase.from('profiles').update({ isVerified: true }).eq('id', user.id);
            setUser({...user, isVerified: true});
        }
        setActiveScreen('profile');
    };

    const handleUpdatePhotos = async (photos: string[]) => {
        if (user) {
            await supabase.from('profiles').update({ profileImageUrls: photos }).eq('id', user.id);
            setUser({...user, profileImageUrls: photos});
        }
        addToast('Photos updated!', 'success');
        handleBack();
    };
    
    const filteredMatches = matches.filter(match => {
        const ageMatch = match.age >= filters.ageRange[0] && match.age <= filters.ageRange[1];
        const locationMatch = filters.location ? (match.city?.toLowerCase().includes(filters.location.toLowerCase()) || match.country?.toLowerCase().includes(filters.location.toLowerCase())) : true;
        const verifiedMatch = filters.showVerifiedOnly ? match.isVerified : true;
        return ageMatch && locationMatch && verifiedMatch;
    });

    if (!isLoggedIn) {
        return <AuthScreen onLogin={handleLogin} />;
    }

    if (!user) return <div className="h-screen flex items-center justify-center">Loading Knot Registry...</div>;

    const renderScreen = () => {
        if (selectedMatch) {
            switch(activeScreen) {
                case 'profileDetail':
                    return <ProfileDetailScreen match={selectedMatch} user={user} onBack={handleBack} onStartChat={handleStartChat} onStartCall={handleStartCall} />;
                case 'chat':
                    return <ChatScreen match={selectedMatch} user={user} onBack={handleBack} onStartCall={handleStartCall} />;
                case 'videoCall':
                    return <VideoCallScreen match={selectedMatch} user={user} onEndCall={handleBack} />;
            }
        }

        switch (activeScreen) {
            case 'home':
                return (
                    <div className="p-4 space-y-4 pb-32">
                        {filteredMatches.map(match => (
                            <MatchCard key={match.id} match={match} onCardClick={handleCardClick} />
                        ))}
                        
                        <div className="pt-8 pb-4 flex flex-col items-center">
                            <button 
                                onClick={() => fetchMoreFromGlobalRegistry(false)} 
                                disabled={isSyncing}
                                className="flex items-center gap-2 bg-white border border-brand-primary/20 text-brand-primary font-bold px-8 py-3 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSyncing ? (
                                    <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <SparklesIcon className="w-5 h-5" />
                                )}
                                <span>{isSyncing ? 'Synchronizing...' : 'Discover More Globally'}</span>
                            </button>
                        </div>
                    </div>
                );
            case 'likes':
                 return <LikesScreen likedMatches={[]} onMatchClick={handleCardClick} />;
            case 'messages':
                return <MessagesScreen onChatSelect={handleStartChat} user={user} />;
            case 'resources':
                return (
                    <div className="p-4 space-y-4 pb-24">
                        <h1 className="text-2xl font-bold text-brand-dark text-center py-4">Marriage & Commitment</h1>
                        {RESOURCES_DATA.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                    </div>
                );
            case 'profile':
                return <ProfileCard 
                    user={user} 
                    onEditProfile={() => setActiveScreen('editProfile')} 
                    onManagePhotos={() => setActiveScreen('managePhotos')}
                    onVerifyProfile={() => setActiveScreen('verification')}
                />;
            case 'verification':
                return <VerificationScreen onVerificationComplete={handleVerificationComplete} onBack={handleBack} />;
            case 'editProfile':
                return <EditProfileScreen user={user} onBack={handleBack} onSave={handleSaveProfile} />;
            case 'managePhotos':
                return <PhotoManagerScreen user={user} onBack={handleBack} onUpdatePhotos={handleUpdatePhotos} />;
            case 'payment':
                return <PaymentScreen onBack={handleBack} onSubscribe={handleSubscribe} />;
            default:
                return <div>Home</div>;
        }
    };
    
    const showHeader = ['home', 'likes', 'messages', 'resources', 'profile'].includes(activeScreen);
    const showBottomNav = ['home', 'likes', 'messages', 'resources', 'profile'].includes(activeScreen);

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen font-sans">
            {showHeader && (
                <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-20">
                    <GlobalActivityTicker />
                    <Header />
                    {isSyncing && (
                        <div className="h-0.5 w-full bg-brand-light relative overflow-hidden">
                            <div className="absolute inset-0 bg-brand-primary animate-progress-ind"></div>
                        </div>
                    )}
                </div>
            )}
            
            {activeScreen === 'home' && (
                <div className="fixed top-[5.75rem] left-0 right-0 max-w-md mx-auto z-10 bg-white p-2 border-b h-[3.25rem] flex items-center shadow-sm">
                    <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center gap-2 text-sm text-gray-600 font-semibold p-2 rounded-md hover:bg-gray-100">
                        <FilterIcon className="w-5 h-5" />
                        <span>Filter Matches</span>
                    </button>
                    <div className="ml-auto flex items-center gap-1.5 px-3">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Connected</span>
                    </div>
                </div>
            )}
            
            <main className={`${showHeader ? 'pt-[5.75rem]' : ''} ${activeScreen === 'home' ? 'pt-[3.25rem]' : ''}`}>
                {renderScreen()}
            </main>

            {showBottomNav && (
                <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
            )}

            <FilterModal 
                isOpen={isFilterModalOpen} 
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={filters}
                onApplyFilters={(newFilters) => {
                    setFilters(newFilters);
                    addToast('Filters updated.', 'info');
                }}
                initialFilters={INITIAL_FILTERS}
            />
            
            <PremiumModal 
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                onUpgrade={handleUpgradeClick}
            />
            
            <style>{`
                @keyframes progress-ind {
                    0% { left: -100%; width: 100%; }
                    100% { left: 100%; width: 100%; }
                }
                .animate-progress-ind { animation: progress-ind 1.5s infinite linear; }
            `}</style>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
};

export default App;