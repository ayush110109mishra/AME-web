import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  className = '',
  disabled = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
        >
          {label} {required && <span className="text-[#ff6b2c]">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl px-4 py-2.5 text-sm glass-input text-slate-100 placeholder-slate-500 transition-all duration-200 ${
            Icon ? 'pl-10' : ''
          } ${isPassword ? 'pr-10' : ''} ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
              : 'border-white/10 hover:border-white/20'
          }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
