/**
 * Tall Vertical Glassmorphism Tool Card
 * Inspired by Reference Image 3: vertical phone/story format, translucent deep blue/black
 * glass surfaces, fine borders, soft ambient glow, and grounded floor reflections.
 */

import React from 'react';
import {
  Layers,
  Scissors,
  FilePlus,
  Minimize2,
  Image as ImageIcon,
  Images,
  RotateCw,
  LayoutGrid,
  Edit3,
  ShieldCheck,
  FileText,
  FileCode,
  ArrowUpRight,
} from 'lucide-react';
import { ToolItem } from '../../types/tools';

interface ToolCardProps {
  tool: ToolItem;
  isActive: boolean;
  onSelect: (tool: ToolItem) => void;
  index: number;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, isActive, onSelect, index }) => {
  // Map icons
  const getIcon = () => {
    const props = { className: 'w-5 h-5' };
    switch (tool.id) {
      case 'merge_pdf':
        return <Layers {...props} />;
      case 'split_pdf':
        return <Scissors {...props} />;
      case 'pdf_maker':
        return <FilePlus {...props} />;
      case 'compress_pdf':
        return <Minimize2 {...props} />;
      case 'images_to_pdf':
        return <Images {...props} />;
      case 'pdf_to_images':
        return <ImageIcon {...props} />;
      case 'rotate_pdf':
        return <RotateCw {...props} />;
      case 'organize_pages':
        return <LayoutGrid {...props} />;
      case 'edit_pdf':
        return <Edit3 {...props} />;
      case 'protect_pdf':
        return <ShieldCheck {...props} />;
      case 'pdf_to_word':
        return <FileText {...props} />;
      case 'word_to_pdf':
        return <FileCode {...props} />;
      default:
        return <FileText {...props} />;
    }
  };

  const getAccentStyles = () => {
    switch (tool.accent) {
      case 'amber':
        return {
          border: isActive ? 'border-amber-400/40' : 'border-white/10 group-hover:border-amber-400/25',
          glow: 'from-amber-500/10 via-transparent to-transparent',
          badge: 'text-amber-300 bg-amber-500/10 border-amber-400/20',
          btn: 'group-hover:bg-amber-400 group-hover:text-black',
          dot: 'bg-amber-400',
        };
      case 'cyan':
        return {
          border: isActive ? 'border-cyan-400/40' : 'border-white/10 group-hover:border-cyan-400/25',
          glow: 'from-cyan-500/10 via-transparent to-transparent',
          badge: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/20',
          btn: 'group-hover:bg-cyan-400 group-hover:text-black',
          dot: 'bg-cyan-400',
        };
      case 'emerald':
        return {
          border: isActive ? 'border-emerald-400/40' : 'border-white/10 group-hover:border-emerald-400/25',
          glow: 'from-emerald-500/10 via-transparent to-transparent',
          badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20',
          btn: 'group-hover:bg-emerald-400 group-hover:text-black',
          dot: 'bg-emerald-400',
        };
      case 'violet':
        return {
          border: isActive ? 'border-violet-400/40' : 'border-white/10 group-hover:border-violet-400/25',
          glow: 'from-violet-500/10 via-transparent to-transparent',
          badge: 'text-violet-300 bg-violet-500/10 border-violet-400/20',
          btn: 'group-hover:bg-violet-400 group-hover:text-black',
          dot: 'bg-violet-400',
        };
      case 'blue':
      default:
        return {
          border: isActive ? 'border-blue-400/40' : 'border-white/10 group-hover:border-blue-400/25',
          glow: 'from-blue-500/10 via-transparent to-transparent',
          badge: 'text-blue-300 bg-blue-500/10 border-blue-400/20',
          btn: 'group-hover:bg-blue-400 group-hover:text-black',
          dot: 'bg-blue-400',
        };
    }
  };

  const accent = getAccentStyles();

  return (
    <div
      role="group"
      aria-label={`${tool.name} tool panel`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(tool);
        }
      }}
      onClick={() => onSelect(tool)}
      className={`group relative flex-shrink-0 w-[280px] sm:w-[310px] md:w-[330px] h-[460px] sm:h-[500px] flex flex-col justify-between p-6 sm:p-7 rounded-2xl cursor-pointer select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
        isActive
          ? 'scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(255,200,90,0.08)] bg-gradient-to-b from-[#0a0f1d]/90 via-[#060913]/90 to-[#03050a]/95'
          : 'scale-[0.98] hover:scale-[1.0] hover:shadow-[0_15px_35px_rgba(0,0,0,0.7)] bg-gradient-to-b from-[#080d19]/75 via-[#050811]/80 to-[#020408]/90'
      } backdrop-blur-2xl border ${accent.border}`}
    >
      {/* Top subtle inner reflection line */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Ambient background accent glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${accent.glow} opacity-60 pointer-events-none transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Top Section: Card Index, Badge & Icon */}
      <div className="relative z-10">
        {/* Story Progress Indicators (Reference 3 visual styling) */}
        <div className="flex items-center gap-1.5 mb-5">
          <div className="h-[2px] w-6 bg-white/60 rounded-full" />
          <div className="h-[2px] w-2 bg-white/20 rounded-full" />
          <div className="h-[2px] w-2 bg-white/20 rounded-full" />
          <span className="ml-auto font-mono text-[10px] tracking-widest text-white/40">
            {String(index + 1).padStart(2, '0')} // 12
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/90 group-hover:text-white group-hover:scale-105 transition-all duration-200">
            {getIcon()}
          </div>

          {tool.badge && (
            <span
              className={`px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded-full border ${accent.badge}`}
            >
              {tool.badge}
            </span>
          )}
        </div>

        {/* Category Tag */}
        <div className="mt-6 flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
          <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase">
            {tool.tag}
          </span>
        </div>

        {/* Tool Name */}
        <h3 className="mt-2 text-2xl font-light text-white tracking-tight font-sans group-hover:text-white transition-colors">
          {tool.name}
        </h3>

        {/* Short Tagline */}
        <p className="mt-2 text-xs font-sans text-white/70 leading-relaxed font-light">
          {tool.tagline}
        </p>
      </div>

      {/* Middle: Format Specs */}
      <div className="relative z-10 py-3 border-y border-white/[0.07] my-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
          <span>INPUT: <strong className="text-white/70 font-normal">{tool.inputFormat}</strong></span>
          <span>OUTPUT: <strong className="text-white/70 font-normal">{tool.outputFormat}</strong></span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(tool);
          }}
          className={`w-full h-11 rounded-xl border border-white/20 bg-white/5 text-white text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${accent.btn}`}
        >
          <span>LAUNCH TOOL</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Floor reflection effect underneath the card (Reference 3) */}
      <div
        className="absolute -bottom-8 left-4 right-4 h-7 rounded-full bg-gradient-to-b from-white/[0.04] to-transparent blur-md pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
      />
    </div>
  );
};
