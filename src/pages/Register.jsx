import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Eye, EyeOff, Layers, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const PERKS = [
  'Free 14-day trial, no credit card required',
  'Full access to all features from day one',
  'Dedicated onboarding support',
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [e.target.name]: '',
      }));
    }

    setError('');
  };

  const validate = () => {
    const errors = {};

    if (!form.companyName.trim()) {
      errors.companyName = 'Company name is required.';
    }

    if (!form.name.trim()) {
      errors.name = 'Your name is required.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(form.password)) {
      errors.password = 'Password must contain uppercase, lowercase, a number, and a special character (@$!%*?&).';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await authApi.register(form);

      navigate('/login', {
        state: {
          message: 'Company registered successfully. Please login.',
        },
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-5 py-14">

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

        <div className="hidden md:flex flex-col pt-4">

          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 bg-[#0f62fe] rounded-md flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>

            <span className="font-semibold text-gray-900 text-base">
              WorkflowPro
            </span>
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-4">
            Start managing your
            <br />
            team the right way.
          </h2>

          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            Set up your company profile and get immediate access to the full HR platform —
            attendance, payroll, performance, and more.
          </p>

          <div className="flex flex-col gap-3">

            {PERKS.map((perk) => (
              <div key={perk} className="flex items-start gap-3">

                <CheckCircle2
                  size={16}
                  className="text-[#0f62fe] mt-0.5"
                />

                <span className="text-sm text-gray-600">
                  {perk}
                </span>

              </div>
            ))}

          </div>

        </div>


        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">

          <div className="mb-7">
            <h1 className="text-xl font-bold text-gray-900">
              Register your company
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Create your organization and admin account
            </p>
          </div>


          {error && (
            <div className="mb-5 px-3 py-2 bg-red-50 border border-red-100 rounded-md">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >

            <Input
              label="Company name"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Acme Corporation"
              leftIcon={Building2}
              error={fieldErrors.companyName}
              required
            />


            <Input
              label="Your name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              leftIcon={User}
              error={fieldErrors.name}
              required
            />


            <Input
              label="Work email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@company.com"
              leftIcon={Mail}
              error={fieldErrors.email}
              required
            />


              <div className="flex flex-col gap-1.5">

              <label className="text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">

                <Lock
                  size={15}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 chars, e.g. Secure@1"
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-10 py-2 text-sm border rounded-md outline-none transition-all ${
                    fieldErrors.password
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#0f62fe]'
                  }`}
                />


                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword
                    ? <EyeOff size={15}/>
                    : <Eye size={15}/>
                  }
                </button>

              </div>


              {fieldErrors.password && (
                <p className="text-xs text-red-500">
                  {fieldErrors.password}
                </p>
              )}

            </div>


            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              Create company account
            </Button>


          </form>


          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}

            <Link
              to="/login"
              className="text-[#0f62fe] font-medium"
            >
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}