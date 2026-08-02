import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    required,
    className = '',
    containerClassName = '',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <LeftIcon size={15} className="text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-white border rounded-md text-sm text-gray-900 placeholder-gray-400
            transition-all duration-150 outline-none
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-[#0f62fe] focus:ring-2 focus:ring-[#0f62fe]/10'
            }
            ${LeftIcon ? 'pl-9' : 'pl-3'}
            ${RightIcon ? 'pr-9' : 'pr-3'}
            py-2
            ${className}
          `}
          {...props}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <RightIcon size={15} className="text-gray-400" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
});

export default Input;
