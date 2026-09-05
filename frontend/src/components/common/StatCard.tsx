import * as React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../utils/formatting';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. +14.8
  changeLabel?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  subtitle,
  onClick,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden transition-all duration-200 border-[#eceef5] bg-white text-[#252733] shadow-sm',
        onClick && 'cursor-pointer hover:border-[#714b67]/40 hover:shadow-md group',
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">{title}</p>
          {icon && (
            <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 group-hover:text-[#714b67] group-hover:bg-[#f5eff3] transition-colors">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252733] font-display">
            {value}
          </h3>
          {onClick && (
            <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-[#714b67] transition-all -translate-y-1 translate-x-1" />
          )}
        </div>

        {(change !== undefined || subtitle) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {change !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded text-[11px]',
                  isPositive
                    ? 'bg-[#e8f7ee] text-[#16a34a]'
                    : 'bg-rose-50 text-rose-600'
                )}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? `+${change}%` : `${change}%`}
              </span>
            )}
            <span className="text-slate-400 truncate">{subtitle || changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
