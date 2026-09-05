import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '../../components';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../services/api/auth.api';
import {
  Shield,
  Key,
  Smartphone,
  CheckCircle2,
  Lock,
  Mail,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileProps {
  action?: (msg: string) => void;
}

export function ProfilePage({ action }: ProfileProps) {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();


  // Local state for personal information
  const [firstName, setFirstName] = useState(user?.firstName || user?.name?.split(' ')[0] || 'Jordan');
  const [lastName, setLastName] = useState(user?.lastName || user?.name?.split(' ').slice(1).join(' ') || 'Davis');
  const [email, setEmail] = useState(user?.email || 'jordan.davis@quoteflow.example');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || user?.roleTitle || 'Sales manager');
  const [team, setTeam] = useState(user?.team || 'revenue');
  const [department, setDepartment] = useState(user?.department || 'Revenue Operations');
  const [location, setLocation] = useState(user?.location || 'Mumbai, India');
  const [memberSince] = useState(user?.memberSince || 'January 2023');

  // Preferences
  const [emailApprovals, setEmailApprovals] = useState(user?.preferences?.emailApprovals ?? true);
  const [emailCustomerActivity, setEmailCustomerActivity] = useState(user?.preferences?.emailCustomerActivity ?? true);
  const [emailBillingReminders, setEmailBillingReminders] = useState(user?.preferences?.emailBillingReminders ?? false);

  // Security & Modals
  const [isSaving, setIsSaving] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Sync state when user in store changes
  useEffect(() => {
    if (user) {
      if (user.firstName) setFirstName(user.firstName);
      if (user.lastName) setLastName(user.lastName);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.jobTitle) setJobTitle(user.jobTitle);
      if (user.team) setTeam(user.team);
      if (user.department) setDepartment(user.department);
      if (user.location) setLocation(user.location);
      if (user.twoFactorEnabled !== undefined) setTwoFactorEnabled(user.twoFactorEnabled);
      if (user.preferences) {
        if (user.preferences.emailApprovals !== undefined) setEmailApprovals(user.preferences.emailApprovals);
        if (user.preferences.emailCustomerActivity !== undefined) setEmailCustomerActivity(user.preferences.emailCustomerActivity);
        if (user.preferences.emailBillingReminders !== undefined) setEmailBillingReminders(user.preferences.emailBillingReminders);
      }
    }
  }, [user]);

  // Load latest from backend API on mount
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await authApi.getProfile();
        if (res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.warn('Profile fetch note:', err);
      }
    };
    fetchLatest();
  }, [setUser]);

  const handleActionNotify = (msg: string) => {
    if (action) {
      action(msg);
    }
    toast.success(msg);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const fullName = `${firstName} ${lastName}`.trim();
    try {
      const response = await authApi.updateProfile({
        firstName,
        lastName,
        name: fullName,
        email,
        phone,
        jobTitle,
        team,
        department: team === 'revenue' ? 'Revenue Operations' : team === 'sales' ? 'Sales' : department,
        location,
      });

      // Also save preferences
      await authApi.updatePreferences({
        emailApprovals,
        emailCustomerActivity,
        emailBillingReminders,
      });

      if (response.success) {
        handleActionNotify('Profile changes saved');
      } else {
        toast.error('Failed to save profile changes');
      }
    } catch (err) {
      toast.error('An error occurred while saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setPasswordSuccess('Password updated successfully');
        handleActionNotify('Password reset link sent');
        setTimeout(() => {
          setPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSuccess('');
        }, 1200);
      } else {
        setPasswordError(res.error || 'Failed to update password');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error changing password');
    }
  };

  const handleToggle2FA = async (enable: boolean) => {
    try {
      const res = await authApi.toggle2FA(enable);
      if (res.success) {
        setTwoFactorEnabled(enable);
        handleActionNotify(enable ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled');
        setTwoFactorModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to update 2FA setting');
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success('Logged out of DealFlow360');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const getInitials = () => {

    const f = firstName?.[0] || 'J';
    const l = lastName?.[0] || 'D';
    return `${f}${l}`.toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
      {/* Header matching user specs */}
      <div className="page-header">
        <div>
          <p className="eyebrow">ACCOUNT MANAGEMENT</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252733] font-display">My profile</h1>
          <p className="subtitle">Manage your personal information, security, and preferences.</p>
        </div>
        <button
          className="primary-button"
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          <Save className="w-4 h-4 mr-1.5" />
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      <div className="profile-layout">
        {/* Left Profile Summary Card */}
        <Panel className="profile-summary">
          <div className="profile-avatar">{getInitials()}</div>
          <h2>{`${firstName} ${lastName}`.trim() || 'Jordan Davis'}</h2>
          <p>{jobTitle || 'Sales manager'}</p>
          <span className="profile-status">● Active</span>

          <div className="profile-divider" />

          <div className="profile-detail">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Department
            </span>
            <strong>{team === 'revenue' ? 'Revenue Operations' : team === 'sales' ? 'Sales' : department}</strong>
          </div>

          <div className="profile-detail">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location
            </span>
            <strong>{location}</strong>
          </div>

          <div className="profile-detail">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Member since
            </span>
            <strong>{memberSince}</strong>
          </div>

          <div className="mt-6 w-full pt-4 border-t border-[#e5e7eb] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Security Score</span>
              <span className="font-bold text-[#714b67]">{twoFactorEnabled ? '98% (High)' : '75% (Standard)'}</span>
            </div>
            <div className="w-full bg-[#f3f4f6] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#714b67] h-full transition-all duration-500"
                style={{ width: twoFactorEnabled ? '98%' : '75%' }}
              />
            </div>
          </div>
        </Panel>

        {/* Right Column with 3 Panels */}
        <div className="profile-content">
          {/* 1. Personal Information */}
          <Panel>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display">Personal information</h3>
              <span className="text-xs text-slate-400">ID: {user?.id || 'usr-admin'}</span>
            </div>

            <div className="form-grid profile-form">
              <label>
                First name
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </label>

              <label>
                Last name
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                />
              </label>

              <label>
                Phone number
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </label>

              <label>
                Job title
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job title"
                />
              </label>

              <label>
                Team
                <select
                  value={team}
                  onChange={(e) => {
                    setTeam(e.target.value);
                    if (e.target.value === 'revenue') setDepartment('Revenue Operations');
                    if (e.target.value === 'sales') setDepartment('Sales');
                  }}
                >
                  <option value="revenue">Revenue Operations</option>
                  <option value="sales">Sales</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                </select>
              </label>
            </div>
          </Panel>

          {/* 2. Security */}
          <Panel>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#714b67]" />
              <h3 className="font-display mb-0">Security</h3>
            </div>

            <div className="security-row">
              <div>
                <strong>Password</strong>
                <p className="subtitle">Last changed 3 months ago</p>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setPasswordModalOpen(true);
                  handleActionNotify('Password reset modal opened');
                }}
              >
                <Key className="w-3.5 h-3.5 mr-1" />
                Change password
              </button>
            </div>

            <div className="security-row">
              <div>
                <div className="flex items-center gap-2">
                  <strong>Two-factor authentication</strong>
                  {twoFactorEnabled ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Enabled
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="subtitle">Add extra protection to your account.</p>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setTwoFactorModalOpen(true);
                  handleActionNotify('Two-factor authentication setup opened');
                }}
              >
                <Smartphone className="w-3.5 h-3.5 mr-1" />
                {twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </Panel>

          {/* 3. Notification Preferences */}
          <Panel>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-[#714b67]" />
              <h3 className="font-display mb-0">Notification preferences</h3>
            </div>

            <label className="preference-row">
              <span>
                <strong>Quotation approvals</strong>
                <small>Receive email updates about quotation approvals.</small>
              </span>
              <input
                type="checkbox"
                checked={emailApprovals}
                onChange={(e) => {
                  setEmailApprovals(e.target.checked);
                  authApi.updatePreferences({ emailApprovals: e.target.checked });
                  toast.success(`Quotation approvals notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </label>

            <label className="preference-row">
              <span>
                <strong>Customer activity</strong>
                <small>Receive email updates about customer activity.</small>
              </span>
              <input
                type="checkbox"
                checked={emailCustomerActivity}
                onChange={(e) => {
                  setEmailCustomerActivity(e.target.checked);
                  authApi.updatePreferences({ emailCustomerActivity: e.target.checked });
                  toast.success(`Customer activity notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </label>

            <label className="preference-row">
              <span>
                <strong>Billing reminders</strong>
                <small>Receive email updates about billing reminders.</small>
              </span>
              <input
                type="checkbox"
                checked={emailBillingReminders}
                onChange={(e) => {
                  setEmailBillingReminders(e.target.checked);
                  authApi.updatePreferences({ emailBillingReminders: e.target.checked });
                  toast.success(`Billing reminders ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </label>
          </Panel>

          {/* 4. Active Sessions & Account Sign Out */}
          <Panel>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display mb-1">Session Management</h3>
                <p className="subtitle">Current active session on DealFlow360 Enterprise</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition-colors active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out of DealFlow360</span>
              </button>
            </div>
          </Panel>
        </div>
      </div>


      {/* Change Password Dialog Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e7eb] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#252733] font-display">Change Password</h3>
                  <p className="text-[11px] text-slate-500">Update your account login credentials</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Current Password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full p-2.5 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] text-xs focus:outline-none focus:border-[#714b67]"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-700 relative">
                New Password
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full p-2.5 pr-9 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] text-xs focus:outline-none focus:border-[#714b67]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Confirm New Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1 w-full p-2.5 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] text-xs focus:outline-none focus:border-[#714b67]"
                />
              </label>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Setup Dialog Modal */}
      {twoFactorModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e7eb] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#f5eff3] text-[#714b67] flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#252733] font-display">Two-Factor Authentication</h3>
                  <p className="text-[11px] text-slate-500">Protect your QuoteFlow account with TOTP</p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactorModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#f9f6f8] rounded-xl border border-[#ecdfe8] text-center space-y-3">
              <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-[#e5e7eb] flex items-center justify-center shadow-inner">
                {/* Visual authenticator QR mockup */}
                <div className="w-full h-full bg-[#f3f4f6] rounded flex flex-col items-center justify-center text-slate-400 text-[10px] font-mono p-1">
                  <div className="font-bold text-[#714b67] text-xs">QR CODE</div>
                  <div>SEC-QUOTEFLOW</div>
                  <div className="text-[8px] text-slate-400 mt-1">otpauth://totp/</div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                Current Status:{' '}
                <strong className={twoFactorEnabled ? 'text-emerald-600' : 'text-slate-700'}>
                  {twoFactorEnabled ? 'Active (2FA Protected)' : 'Inactive'}
                </strong>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Scan this code with Google Authenticator or Microsoft Authenticator for instant 2-step verification.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setTwoFactorModalOpen(false)}
                className="secondary-button"
              >
                Close
              </button>
              {twoFactorEnabled ? (
                <button
                  type="button"
                  onClick={() => handleToggle2FA(false)}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition-colors"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggle2FA(true)}
                  className="primary-button"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Enable 2FA Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
