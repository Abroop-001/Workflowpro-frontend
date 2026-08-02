export default function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl shadow-sm ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
