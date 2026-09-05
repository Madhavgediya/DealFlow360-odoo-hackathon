import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, DEMO_USERS } from '../../stores/auth.store';
import { UserRole } from '../../types/auth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Layers, ShieldCheck, UserCheck, ArrowRight, Sparkles, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const { switchRole, login } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('madhav@dealflow360.io');
  const [password, setPassword] = React.useState('••••••••••••');

  const handleQuickLogin = (role: UserRole) => {
    switchRole(role);
    toast.success(`Authenticated as ${DEMO_USERS[role].name} (${DEMO_USERS[role].roleTitle})`);
    if (role === 'CUSTOMER') {
      navigate('/portal');
    } else {
      navigate('/dashboard');
    }
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickLogin('ADMIN');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#252733] font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#714b67] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md shadow-[#714b67]/20 font-display">
          Q
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252733] font-display">
          QuoteFlow
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          Revenue Operations & Commercial Quotation Engine
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-[#eceef5] bg-white shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
          <form onSubmit={handleStandardSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[#252733] font-semibold block mb-1.5 font-sans">Corporate Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                className="bg-white border-slate-200"
              />
            </div>

            <div>
              <label className="text-[#252733] font-semibold block mb-1.5 font-sans">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                className="bg-white border-slate-200 font-mono"
              />
            </div>

            <Button type="submit" className="w-full gap-2 shadow-sm rounded-xl bg-[#714b67] hover:bg-[#5e3c54] text-white">
              <span>Sign In to QuoteFlow</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Impersonation Demo Sign-ins */}
          <div className="pt-5 border-t border-[#eceef5] space-y-2.5 text-xs">
            <span className="text-slate-400 uppercase font-bold text-[10px] block tracking-wider font-display">
              ⚡ Instant Demo Persona Sign-In:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('ADMIN')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Admin (Jordan Davis)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('SALES_MANAGER')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Sales Director
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('SALES_REP')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Sales Rep
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('FINANCE_DIRECTOR')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                CFO / Finance
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleQuickLogin('WAREHOUSE_MANAGER')}
                className="text-[11px] justify-start bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Warehouse Head
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
