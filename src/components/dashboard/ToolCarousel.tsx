/**
 * Horizontally Moving Tool Carousel
 * Features:
 * - Fluid horizontal scrolling with ~3-4 cards on desktop, 1-2 on mobile
 * - Glassmorphic Left/Right arrow buttons
 * - Touch and mouse pointer swipe/drag gesture support
 * - Keyboard Left / Right arrow navigation
 * - 6-second smooth autoplay with hover / focus / drag pause and idle resume
 * - Active card elevation and position indicator pills
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ToolItem } from '../../types/tools';
import { ToolCard } from './ToolCard';

interface ToolCarouselProps {
  tools: ToolItem[];
  onSelectTool: (tool: ToolItem) => void;
  reducedMotion?: boolean;
}

export const ToolCarousel: React.FC<ToolCarouselProps> = ({
  tools,
  onSelectTool,
  reducedMotion = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute scroll offset for index
  const scrollToCard = useCallback((index: number, smooth = true) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cards = container.children;
    if (!cards || !cards[index]) return;

    const targetCard = cards[index] as HTMLElement;
    const containerWidth = container.clientWidth;
    const cardWidth = targetCard.offsetWidth;
    const cardLeft = targetCard.offsetLeft;

    // Center target card or place comfortably
    const scrollTarget = cardLeft - (containerWidth - cardWidth) / 2;

    container.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: smooth ? 'smooth' : 'auto',
    });

    setActiveIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    if (tools.length === 0) return;
    const nextIdx = (activeIndex + 1) % tools.length;
    scrollToCard(nextIdx);
  }, [activeIndex, tools.length, scrollToCard]);

  const handlePrev = useCallback(() => {
    if (tools.length === 0) return;
    const prevIdx = (activeIndex - 1 + tools.length) % tools.length;
    scrollToCard(prevIdx);
  }, [activeIndex, tools.length, scrollToCard]);

  // Autoplay handler (every 6 seconds unless paused/hovered/focused/dragged)
  useEffect(() => {
    if (reducedMotion || isHovered || isFocused || isAutoplayPaused || isDragging) {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
      return;
    }

    autoplayTimerRef.current = setInterval(() => {
      handleNext();
    }, 6000);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [reducedMotion, isHovered, isFocused, isAutoplayPaused, isDragging, handleNext]);

  // Update active card on manual scroll
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const cards = container.children;

    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(containerCenter - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx !== activeIndex) {
      setActiveIndex(closestIdx);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  // Mouse drag & touch gesture handling
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollStartLeft(container.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.4;
    container.scrollLeft = scrollStartLeft - walk;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Briefly pause autoplay after user interaction, then resume
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        setIsAutoplayPaused(false);
      }, 4000);
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || !e.touches[0]) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - container.offsetLeft);
    setScrollStartLeft(container.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX) * 1.2;
    container.scrollLeft = scrollStartLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseUp();
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="PDF Tools Showcase"
    >
      {/* Top Carousel Bar: Navigation Arrows & Indicator Pills */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.25em] text-white/50 uppercase">
            ACTIVE TOOL // {String(activeIndex + 1).padStart(2, '0')} OF {tools.length}
          </span>
          <button
            type="button"
            onClick={() => setIsAutoplayPaused(!isAutoplayPaused)}
            title={isAutoplayPaused ? 'Resume autoplay' : 'Pause autoplay'}
            className="p-1 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
          >
            {isAutoplayPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous tool card"
            className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/10 active:bg-white/15 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next tool card"
            className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/10 active:bg-white/15 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Horizontal Carousel Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`flex items-center gap-5 sm:gap-6 overflow-x-auto scrollbar-none py-6 px-2 sm:px-4 cursor-${
          isDragging ? 'grabbing' : 'grab'
        } scroll-smooth`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tools.map((tool, idx) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            index={idx}
            isActive={idx === activeIndex}
            onSelect={onSelectTool}
          />
        ))}
      </div>

      {/* Bottom Pagination Indicators */}
      <div className="mt-6 flex items-center justify-center gap-1.5">
        {tools.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            onClick={() => scrollToCard(idx)}
            aria-label={`Jump to tool ${t.name}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === activeIndex
                ? 'w-7 bg-amber-400'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
