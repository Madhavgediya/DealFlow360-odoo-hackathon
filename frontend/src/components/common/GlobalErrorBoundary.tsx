import React from 'react';
import { Button } from '../ui/button';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught runtime error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
          <div className="max-w-md w-full p-6 rounded-2xl border border-rose-500/30 bg-slate-900 shadow-2xl text-center space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              DealFlow360 encountered an unexpected application error. You can refresh or return to the executive dashboard.
            </p>
            {this.state.error && (
              <pre className="text-[11px] text-rose-300 font-mono bg-black/40 p-3 rounded text-left overflow-x-auto border border-slate-800">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
                className="gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reload Page
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/login';
                }}
                className="gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
