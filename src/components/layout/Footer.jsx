import { Link } from 'react-router-dom';
import { Layers, ExternalLink } from 'lucide-react';

const FOOTER_LINKS = {
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  Features: [
    { label: 'Employee Management', href: '#features' },
    { label: 'Attendance Tracking', href: '#features' },
    { label: 'Payroll Automation', href: '#features' },
    { label: 'Performance', href: '#features' },
  ],
  Support: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Contact: [
    { label: 'Sales', href: '#contact' },
    { label: 'Support', href: '#contact' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-[#C9A86A] rounded-md flex items-center justify-center">
                <Layers size={14} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-[15px]">WorkflowPro</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Modern HR management for growing teams.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: ExternalLink, label: 'Twitter', href: '#' },
                { Icon: ExternalLink, label: 'LinkedIn', href: '#' },
                { Icon: ExternalLink, label: 'GitHub', href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {group}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} WorkflowPro. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">Built for enterprise HR teams.</p>
        </div>
      </div>
    </footer>
  );
}
