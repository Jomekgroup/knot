import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { MessageIcon } from './icons/MessageIcon';
import { BookIcon } from './icons/BookIcon';
import { UserIcon } from './icons/UserIcon';
import { HeartIcon } from './icons/HeartIcon';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const NavItem: React.FC<{
  label: string;
  screen: Screen;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (screen: Screen) => void;
}> = ({ label, screen, icon, isActive, onClick }) => {
  const activeColor = 'text-brand-primary';
  const inactiveColor = 'text-gray-500';

  return (
    <button
      onClick={() => onClick(screen)}
      className="flex flex-col items-center justify-center w-1/5 h-full transition-colors duration-200"
    >
      <div className={`w-6 h-6 ${isActive ? activeColor : inactiveColor}`}>{icon}</div>
      <span className={`text-xs mt-1 ${isActive ? `${activeColor} font-bold` : inactiveColor}`}>
        {label}
      </span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const navItems = [
    { label: 'Matches', screen: 'home' as Screen, icon: <HomeIcon /> },
    { label: 'Likes', screen: 'likes' as Screen, icon: <HeartIcon /> },
    { label: 'Messages', screen: 'messages' as Screen, icon: <MessageIcon /> },
    { label: 'Resources', screen: 'resources' as Screen, icon: <BookIcon /> },
    { label: 'Profile', screen: 'profile' as Screen, icon: <UserIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-white border-t border-gray-200 flex items-center justify-around z-20">
      {navItems.map(item => (
        <NavItem
          key={item.screen}
          label={item.label}
          screen={item.screen}
          icon={item.icon}
          isActive={activeScreen === item.screen}
          onClick={onNavigate}
        />
      ))}
    </nav>
  );
};

export default BottomNav;