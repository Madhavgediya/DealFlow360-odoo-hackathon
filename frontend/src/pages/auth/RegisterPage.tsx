import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { authApi } from '../../services/api/auth.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import {
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('SALES_REP');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Valid business email is required');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept terms & conditions');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (res.success) {
        toast.success(`Welcome to DealFlow360, ${name.trim()}!`);
        if (role === 'CUSTOMER') {
          navigate('/portal');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(res.error || 'Failed to create account');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during signup');
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
          Create your enterprise commercial account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-[#e5e7eb] bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[#252733] font-semibold block mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Davis"
                leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                className="bg-[#f8fafc] border-slate-200 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-[#252733] font-semibold block mb-1.5">
                Work Email Address <span className="text-rose-500">*</span>
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
              <label className="text-[#252733] font-semibold block mb-1.5">
                Commercial Role / Workspace
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#f8fafc] text-xs font-sans text-[#252733] focus:outline-none focus:border-[#714b67]"
                >
                  <option value="SALES_REP">Sales Representative (Quotation & CRM)</option>
                  <option value="SALES_MANAGER">Sales Director / Manager (Approvals & Discounts)</option>
                  <option value="FINANCE">Finance & Invoicing Director (CFO / Billing)</option>
                  <option value="OPERATIONS">Operations Lead (Inventory, Procurement, Logistics)</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="CUSTOMER">Client / Buyer Portal Access</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#252733] font-semibold block mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  className="bg-[#f8fafc] border-slate-200 text-xs pr-9"
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

            <div>
              <label className="text-[#252733] font-semibold block mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                leftIcon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
                className="bg-[#f8fafc] border-slate-200 text-xs"
                required
              />
            </div>

            <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#714b67]"
              />
              <span className="text-[11px] text-slate-600 leading-tight">
                I agree to the DealFlow360 Enterprise Terms of Service and Privacy Policy.
              </span>
            </label>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 shadow-sm rounded-xl bg-[#714b67] hover:bg-[#5e3c54] text-white py-2.5 font-semibold text-xs transition-all duration-200 active:scale-95"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create DealFlow360 Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#714b67] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;

