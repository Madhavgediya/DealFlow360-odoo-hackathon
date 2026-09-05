import * as React from 'react';
import { cn } from '../../utils/formatting';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#714b67] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#714b67] text-white shadow-sm hover:bg-[#5e3c54] shadow-[#714b67]/20 active:bg-[#4e3347]',
      secondary:
        'bg-white text-[#252733] hover:bg-[#f3f4f6] active:bg-slate-100 border border-[#e5e7eb] shadow-sm',
      outline:
        'border border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] text-[#252733] shadow-sm',
      ghost:
        'bg-transparent hover:bg-[#f5eff3] text-slate-700 hover:text-[#714b67]',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-600/20 active:bg-rose-700',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-600/20 active:bg-emerald-700',
      link: 'text-[#714b67] underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
