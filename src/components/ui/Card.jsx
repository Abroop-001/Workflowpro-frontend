import { forwardRef } from 'react';

const Card = forwardRef(function Card({ children, className = '', padding = true, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`bg-white border border-gray-100 rounded-xl shadow-sm ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
