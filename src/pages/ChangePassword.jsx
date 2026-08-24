import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/auth';
import Button from '../components/ui/Button';

export default function ChangePassword() {
  const { updateUser, user } = useAuth();
  const { success, error: showToastError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password rules check
  const password = form.newPassword;
  const rules = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'An uppercase & a lowercase letter', test: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'At least one number', test: /\d/.test(password) },
    { label: 'At least one special character (@$!%*?&)', test: /[@$!%*?&]/.test(password) },
  ];
  
  const allRulesPass = rules.every(r => r.test);
  const passwordsMatch = form.newPassword && form.newPassword === form.confirmPassword;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.newPassword || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!allRulesPass) {
      setError('Please satisfy all password complexity requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('New password and confirm password must match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });
      
      // Update mustChangePassword to false locally
      updateUser({ mustChangePassword: false });
      
      success('Password changed successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
      showToastError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-5 py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C9A86A] rounded-md flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-base">WorkflowPro</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
          <div className="mb-7">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Set New Password</h1>
            <p className="text-sm text-gray-500 mt-1">
              Your account was created with a temporary password. Please set a new secure password to activate your dashboard access.
            </p>
          </div>

          {error && (
            <div className="mb-5 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-md animate-fade-in">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock size={15} className="text-gray-400" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="••••••••"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#C9A86A] focus:ring-2 focus:ring-[#C9A86A]/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock size={15} className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#C9A86A] focus:ring-2 focus:ring-[#C9A86A]/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Strength Indicators */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex flex-col gap-2.5">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Password Requirements</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {rule.test ? (
                      <CheckCircle2 size={13} className="text-[#3DD68C] shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-gray-300 shrink-0" />
                    )}
                    <span className={rule.test ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={!allRulesPass || !passwordsMatch}
              className="mt-1"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
