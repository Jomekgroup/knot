
import React from 'react';
import { KnotLogo } from './KnotLogo';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 relative z-10 shadow-sm">
      <KnotLogo />
      <div className="ml-auto">
          <div className="flex -space-x-2">
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=64&auto=format&fit=crop" alt="" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=64&auto=format&fit=crop" alt="" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=64&auto=format&fit=crop" alt="" />
          </div>
      </div>
    </header>
  );
};

export default Header;
