import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/formatting';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav className={cn('flex items-center gap-1.5 text-xs text-slate-400 select-none', className)}>
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((it, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            {it.href && !isLast ? (
              <Link
                to={it.href}
                className="hover:text-slate-700 transition-colors py-0.5 px-1 rounded hover:bg-slate-100"
              >
                {it.label}
              </Link>
            ) : (
              <span className={cn('font-semibold', isLast ? 'text-slate-900' : 'text-slate-400')}>
                {it.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
