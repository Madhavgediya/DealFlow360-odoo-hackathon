import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '../../types/auth';
import { hasRole } from '../../utils/permissions';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isInitializing } = useAuthStore();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#714b67]"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500 font-sans tracking-wide">Restoring secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated visitors to login and save the location they tried to reach
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific role access is required
  if (
    requiredRole &&
    !hasRole(user, requiredRole) &&
    user.role !== 'ADMIN' &&
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'SUPERADMIN'
  ) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-md">
          Your current account role (<strong>{user.roleTitle || user.role}</strong>) does not have authorization to view this administrative workspace.
        </p>
        <Button
          size="sm"
          onClick={() => window.history.back()}
          className="gap-2 bg-[#714b67] text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

