import * as React from 'react';
import { cn } from '../../utils/formatting';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'indigo' | 'cyan';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'sm', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#f3f4f6] text-[#252733] border-[#e5e7eb]',
    secondary: 'bg-white text-slate-600 border-[#e5e7eb]',
    outline: 'border-[#e5e7eb] text-slate-700 bg-transparent',
    success: 'bg-[#e8f7ee] text-[#16a34a] border-[#d1f2dd]',
    warning: 'bg-[#fef3e9] text-[#d97706] border-[#fde4cf]',
    destructive: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-[#f5eff3] text-[#714b67] border-[#ecdfe8]',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium transition-colors select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
