import React from 'react';
import { cn } from '../../utils/formatting';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className,
  textClassName,
  onClick,
}) => {
  const sizeMap = {
    sm: { imgH: 'h-6', iconW: 24, iconH: 16, text: 'text-base font-bold' },
    md: { imgH: 'h-8', iconW: 34, iconH: 22, text: 'text-lg font-bold' },
    lg: { imgH: 'h-11', iconW: 48, iconH: 32, text: 'text-2xl font-extrabold' },
    xl: { imgH: 'h-14', iconW: 64, iconH: 42, text: 'text-3xl font-extrabold' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2.5 select-none transition-transform active:scale-95',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Precision Interlocking Double-Ring Brand Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={currentSize.iconW}
          height={currentSize.iconH}
          viewBox="0 0 100 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_1px_2px_rgba(113,75,103,0.15)]"
        >
          {/* Left Ring: Deep Plum (#714b67) */}
          <circle
            cx="32.5"
            cy="32.5"
            r="23"
            stroke="#714b67"
            strokeWidth="11"
            className="transition-colors duration-300"
          />
          {/* Right Ring: Vivid Berry Plum (#9b3370) */}
          <circle
            cx="67.5"
            cy="32.5"
            r="23"
            stroke="#9b3370"
            strokeWidth="11"
            className="transition-colors duration-300"
          />
          {/* Interlocking blend arc in center */}
          <path
            d="M 49 14.5 A 23 23 0 0 1 51 50.5"
            stroke="#714b67"
            strokeWidth="11"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'tracking-tight font-display text-[#714b67] transition-colors',
              currentSize.text,
              textClassName
            )}
            style={{ fontFamily: "'Unbounded', 'Josefin Sans', sans-serif" }}
          >
            DealFlow<span className="text-[#9b3370]">360</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
