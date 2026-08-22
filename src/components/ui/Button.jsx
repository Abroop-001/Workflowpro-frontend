import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'btn-gold',
  secondary: 'bg-[#141414] text-[#D6D3CC] hover:bg-[#1B1B1B] border border-[#2A2A2A]',
  ghost: 'bg-transparent text-[#A8A6A0] hover:bg-[#1B1B1B] hover:text-[#F3F0E8] border border-transparent',
  danger: 'bg-red-700/90 text-white hover:bg-red-700 border border-red-900/50',
  outline: 'bg-transparent text-[#D8BC82] hover:bg-[rgba(201,168,106,0.08)] border border-[#C9A86A]/50',
  gold: 'btn-gold',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-md
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
