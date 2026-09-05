import React from 'react';
import { cn } from '../../utils/formatting';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass';
}

export const Panel: React.FC<PanelProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-subtle transition-all duration-200',
        variant === 'elevated' && 'shadow-md hover:shadow-lg border-[#ecdfe8]',
        variant === 'glass' && 'glass-panel shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Panel;
