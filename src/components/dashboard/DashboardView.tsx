/**
 * Main AETHER PDF Workspace Dashboard View
 * Features:
 * - Dramatic realistic Black Hole background (Gargantua accretion disk & gravitational lensing)
 * - Glassmorphic header with live search & category filters
 * - Horizontally moving tool carousel (12 featured tools)
 * - Interactive local PDF tool workbench modal
 */

import React, { useState, useMemo } from 'react';
import { User } from '../../lib/firebase';
import { ToolItem, ToolCategory } from '../../types/tools';
import { TOOLS_DATA } from './toolsData';
import { BlackHoleBackground } from './BlackHoleBackground';
import { DashboardHeader } from './DashboardHeader';
import { ToolCarousel } from './ToolCarousel';
import { ToolModal } from './ToolModal';
import { SearchX, Sparkles } from 'lucide-react';

interface DashboardViewProps {
  user: User;
  onSignOut: () => Promise<void>;
  reducedMotion?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onSignOut,
  reducedMotion = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [activeModalTool, setActiveModalTool] = useState<ToolItem | null>(null);

  // Filter tools based on search query and category
  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tagline.toLowerCase().includes(query) ||
        tool.tag.toLowerCase().includes(query) ||
        tool.inputFormat.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-white font-sans animate-[fadeIn_1.2s_ease-out]">
      {/* 1. Cinematic Black Hole Background with Differential Accretion Disk */}
      <BlackHoleBackground reducedMotion={reducedMotion} />

      {/* 2. Top Header Navigation */}
      <DashboardHeader
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSignOut={onSignOut}
      />

      {/* 3. Main Horizontal Tool Carousel Showcase */}
      <main className="flex-1 flex flex-col justify-center py-4">
        {filteredTools.length > 0 ? (
          <ToolCarousel
            tools={filteredTools}
            onSelectTool={(tool) => setActiveModalTool(tool)}
            reducedMotion={reducedMotion}
          />
        ) : (
          <div className="w-full max-w-md mx-auto px-6 py-16 text-center rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
            <SearchX className="w-10 h-10 text-white/40 mx-auto mb-3" />
            <h3 className="text-lg font-light text-white font-sans">No tools found</h3>
            <p className="mt-1 text-xs text-white/50 font-sans">
              No PDF instruments match &quot;{searchQuery}&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono tracking-wider uppercase text-white transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      {/* 4. Minimal Architectural Status Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono tracking-widest text-white/40 uppercase border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>AETHER RELATIVISTIC WORKSPACE // 100% IN-BROWSER MEMORY</span>
        </div>
        <div className="flex items-center gap-4 text-white/30">
          <span>ALL 12 INSTRUMENTS ACTIVE</span>
          <span>//</span>
          <span>NO TELEMETRY EXPORT</span>
        </div>
      </footer>

      {/* 5. Tool Processing Modal Workbench */}
      {activeModalTool && (
        <ToolModal
          tool={activeModalTool}
          onClose={() => setActiveModalTool(null)}
        />
      )}
    </div>
  );
};
