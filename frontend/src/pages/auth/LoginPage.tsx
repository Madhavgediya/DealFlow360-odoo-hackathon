import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, DEMO_USERS } from '../../stores/auth.store';
import { UserRole } from '../../types/auth';
import { BrandLogo } from '../../components/common/BrandLogo';
import { authApi } from '../../services/api/auth.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const { switchRole } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('jordan.davis@quoteflow.example');
  const [password, setPassword] = React.useState('password123');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleQuickLogin = (role: UserRole) => {
    switchRole(role);
    const u = DEMO_USERS[role] || DEMO_USERS.ADMIN;
    toast.success(`Authenticated as ${u.name} (${u.roleTitle})`);
    if (role === 'CUSTOMER') {
      navigate('/portal');
    } else {
      navigate('/dashboard');
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.signin({
        email: email.trim(),
        password,
      });

      if (res.success) {
        toast.success(`Welcome back, ${res.data?.user?.name || 'User'}!`);
        if (res.data?.user?.role === 'CUSTOMER') {
          navigate('/portal');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(res.error || 'Invalid email or password');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-[#252733] font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Official DealFlow360 Brand Logo */}
        <div className="flex justify-center">
          <BrandLogo size="lg" />
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Enterprise Commercial Operations & CPQ Engine
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-[#e5e7eb] bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStandardSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[#252733] font-semibold block mb-1.5 font-sans">
                Corporate Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.davis@enterprise.com"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                className="bg-[#f8fafc] border-slate-200 text-xs"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#252733] font-semibold block font-sans">Password</label>
                <Link
                  to="/profile"
                  className="text-[11px] text-[#714b67] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  className="bg-[#f8fafc] border-slate-200 text-xs pr-9 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 shadow-sm rounded-xl bg-[#714b67] hover:bg-[#5e3c54] text-white py-2.5 font-semibold text-xs transition-all duration-200 active:scale-95"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to DealFlow360'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Create Account Link */}
          <div className="text-center text-xs text-slate-500 pt-1">
            Don't have an enterprise account?{' '}
            <Link
              to="/register"
              className="font-bold text-[#714b67] hover:underline"
            >
              Create an account
            </Link>
          </div>

          {/* Quick Impersonation Demo Sign-ins */}
          <div className="pt-4 border-t border-[#eceef5] space-y-2.5 text-xs">
            <span className="text-slate-400 uppercase font-bold text-[10px] block tracking-wider font-display">
              ⚡ Instant Demo Persona Sign-In:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('ADMIN')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-[#f5eff3] hover:text-[#714b67] hover:border-[#ecdfe8]"
              >
                Admin (Jordan Davis)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('SALES_MANAGER')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-[#f5eff3] hover:text-[#714b67] hover:border-[#ecdfe8]"
              >
                Sales Director
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('SALES_REP')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-[#f5eff3] hover:text-[#714b67] hover:border-[#ecdfe8]"
              >
                Sales Rep
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('FINANCE')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-[#f5eff3] hover:text-[#714b67] hover:border-[#ecdfe8]"
              >
                Finance / CFO
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('OPERATIONS')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-[#f5eff3] hover:text-[#714b67] hover:border-[#ecdfe8]"
              >
                Operations Lead
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('CUSTOMER')}
                className="text-[11px] justify-start bg-[#f5eff3] border-[#ecdfe8] text-[#714b67] hover:bg-[#ecdfe8]"
              >
                Client Portal
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;

