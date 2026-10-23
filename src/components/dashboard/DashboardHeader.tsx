/**
 * Dashboard Header Component
 * Minimal AE logo, search bar with live filtering, category pills,
 * and authenticated user profile menu with working sign-out action.
 */

import React, { useState } from 'react';
import { Search, LogOut, User as UserIcon, Shield, Sparkles, ChevronDown } from 'lucide-react';
import { User } from '../../lib/firebase';
import { ToolCategory } from '../../types/tools';

interface DashboardHeaderProps {
  user: User;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onSignOut,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const email = user.email || 'Authenticated User';

  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'organize', label: 'Organize' },
    { id: 'create_edit', label: 'Create & Edit' },
    { id: 'convert', label: 'Convert' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      {/* Top Navbar */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/25 flex items-center justify-center font-mono text-xs tracking-widest text-white font-semibold backdrop-blur-md shadow-lg">
            AE
          </div>
          <div>
            <span className="font-mono text-sm tracking-[0.28em] text-white font-semibold uppercase block">
              AETHER
            </span>
            <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase block">
              WORKSPACE
            </span>
          </div>
        </div>

        {/* Search Field */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search PDF tools (e.g. merge, compress, protect)..."
              className="w-full h-10 pl-9 pr-4 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.09] border border-white/15 focus:border-white/40 focus:outline-none rounded-xl text-xs font-mono text-white placeholder:text-white/30 transition-all backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-[10px] font-mono text-white/40 hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-white/10"
              >
                ESC
              </button>
            )}
          </div>
        </div>

        {/* User Profile & Sign-out Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white text-xs font-mono transition-all cursor-pointer backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-mono text-[11px]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-sans text-xs text-white/90 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-64 p-4 rounded-2xl bg-[#090d16]/95 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 animate-[fadeIn_0.15s_ease-out]"
            >
              <div className="pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2 text-white font-medium text-xs font-sans">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">{displayName}</span>
                </div>
                <div className="text-[11px] font-mono text-white/50 truncate mt-1">
                  {email}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  <Shield className="w-3 h-3" />
                  <span>Session Protected</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onSignOut();
                }}
                className="w-full h-9 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Title & Subtitle Section */}
      <div className="pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-amber-400/90 uppercase mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>ORBITAL DOCUMENT MATRIX</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-white font-sans">
              Your workspace
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-white/60 font-sans font-light">
              Everything you need to work with documents.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-medium shadow-md shadow-white/10'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-4 md:hidden">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search PDF tools..."
              className="w-full h-10 pl-9 pr-4 bg-white/[0.04] border border-white/15 focus:border-white/40 focus:outline-none rounded-xl text-xs font-mono text-white placeholder:text-white/30"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
