import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  FolderOpen,
  Bell,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Globe,
  ChevronRight,
  Building2,
} from 'lucide-react';
import Button from '../components/ui/Button';

// ─── Features Data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: 'Employee Management',
    description: 'Centralize employee records, profiles, and organizational structure in one place.',
  },
  {
    icon: Clock,
    title: 'Attendance Tracking',
    description: 'Track attendance with real-time logs, overtime reports, and shift management.',
  },
  {
    icon: Calendar,
    title: 'Leave Management',
    description: 'Automate leave requests, approvals, and balance tracking across all teams.',
  },
  {
    icon: DollarSign,
    title: 'Payroll Automation',
    description: 'Run accurate payroll with automated calculations, deductions, and compliance.',
  },
  {
    icon: FileText,
    title: 'Payslips',
    description: 'Generate and distribute detailed payslips automatically every pay cycle.',
  },
  {
    icon: TrendingUp,
    title: 'Performance Management',
    description: 'Set goals, conduct reviews, and track employee growth with structured workflows.',
  },
  {
    icon: FolderOpen,
    title: 'Document Management',
    description: 'Store, organize, and retrieve HR documents securely with role-based access.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Keep teams informed with targeted notifications for approvals, updates, and reminders.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Make data-driven decisions with visual insights across all HR functions.',
  },
];

// ─── How It Works Steps ─────────────────────────────────────────────────────────
const STEPS = [
  {
    step: '01',
    title: 'Register your company',
    description:
      'Create your organization account in minutes. Set up your company profile and administrator credentials.',
  },
  {
    step: '02',
    title: 'Add departments and employees',
    description:
      'Structure your organization with departments, roles, and employee profiles. Import existing data effortlessly.',
  },
  {
    step: '03',
    title: 'Manage your workforce',
    description:
      'Access the full suite of HR tools from a single, unified dashboard built for operational efficiency.',
  },
];

// ─── Why Choose Us ──────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: Shield,
    title: 'Enterprise-grade security',
    description: 'Role-based access control, encrypted data, and audit logs protect sensitive HR data.',
  },
  {
    icon: Zap,
    title: 'Built for speed',
    description: 'A performant interface designed to handle large teams without compromising on responsiveness.',
  },
  {
    icon: Globe,
    title: 'Multi-company support',
    description: 'Manage multiple entities under one platform with complete data isolation between companies.',
  },
  {
    icon: CheckCircle2,
    title: 'End-to-end HR coverage',
    description: 'From onboarding to payroll, every HR workflow is handled within a single integrated system.',
  },
];

// ─── Stat items ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: '10,000+', label: 'Employees managed' },
  { value: '500+', label: 'Companies onboarded' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '< 2min', label: 'Average setup time' },
];

// ─── Components ─────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f62fe] uppercase tracking-wider mb-3">
      <span className="w-4 h-px bg-[#0f62fe]" />
      {children}
    </span>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group p-5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200">
      <div className="w-9 h-9 rounded-lg bg-[#eef4ff] flex items-center justify-center mb-4 group-hover:bg-[#0f62fe] transition-colors duration-200">
        <Icon size={17} className="text-[#0f62fe] group-hover:text-white transition-colors duration-200" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#eef4ff] text-[#0f62fe] text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-[#0f62fe]/10">
            <Building2 size={12} />
            Trusted by 500+ companies
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.12] tracking-tight mb-6">
            The HR platform your
            <br />
            <span className="text-[#0f62fe]">team actually uses</span>
          </h1>

          <p className="text-base text-gray-500 leading-relaxed max-w-xl mx-auto mb-10">
            WorkflowPro brings your entire HR operation into one place — from hiring to payroll,
            attendance to performance — built for how real companies operate.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Create your company
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Log in to dashboard
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-5">
            No credit card required · Setup in under 2 minutes
          </p>
        </div>

        {/* Stats bar */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white px-6 py-5 text-center">
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-5 bg-gray-50/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Features</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Everything HR needs, built in
            </h2>
            <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
              A complete suite of tools designed for HR teams, managers, and employees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-7 left-[calc(16.6%+16px)] right-[calc(16.6%+16px)] h-px bg-gray-200" />

            {STEPS.map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center p-6">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center mb-5 shadow-sm z-10">
                  <span className="text-sm font-bold text-[#0f62fe]">{item.step}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    size={14}
                    className="absolute right-0 top-8 text-gray-300 hidden md:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-5 bg-gray-50/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Why WorkflowPro</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Built for businesses that scale
            </h2>
            <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
              Whether you have 10 employees or 10,000, WorkflowPro adapts to your organization's needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 p-5 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="w-9 h-9 rounded-lg bg-[#eef4ff] flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-[#0f62fe]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            {/* Left */}
            <div>
              <SectionLabel>Contact</SectionLabel>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">
                Talk to our team
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Have questions about pricing, implementation, or enterprise plans?
                Our team is ready to help you get started.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Sales', value: 'sales@workflowpro.io' },
                  { label: 'Support', value: 'support@workflowpro.io' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-500">{item.label[0]}</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-medium text-gray-800">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">First name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#0f62fe] focus:ring-2 focus:ring-[#0f62fe]/10 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Last name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#0f62fe] focus:ring-2 focus:ring-[#0f62fe]/10 transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Work email</label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#0f62fe] focus:ring-2 focus:ring-[#0f62fe]/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  placeholder="Acme Inc."
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#0f62fe] focus:ring-2 focus:ring-[#0f62fe]/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your team and what you need..."
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#0f62fe] focus:ring-2 focus:ring-[#0f62fe]/10 transition-all resize-none"
                />
              </div>
              <Button type="submit" size="md">
                Send message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-5 bg-[#0f62fe]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Ready to modernize your HR?
          </h2>
          <p className="text-sm text-blue-100 mb-8">
            Join hundreds of companies already managing their teams with WorkflowPro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-[#0f62fe] hover:bg-blue-50 border-transparent"
              >
                Create your company
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
