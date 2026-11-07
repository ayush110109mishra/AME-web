import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  icon: Icon,
  required = false,
  className = '',
  disabled = false,
  placeholder = 'Select an option',
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
        >
          {label} {required && <span className="text-[#ff6b2c]">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-subtle)]">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full rounded-xl px-4 py-2.5 text-sm glass-input transition-all duration-200 appearance-none cursor-pointer ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-rose-500/80 focus:border-rose-500'
              : 'border-[var(--border-input)] hover:border-[var(--border-hover)]'
          }`}
          {...props}
        >
          <option value="" disabled className="bg-[var(--bg-surface-solid)] text-[var(--text-subtle)]">
            {placeholder}
          </option>
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="bg-[var(--bg-surface-solid)] text-[var(--text-main)]">
                {text}
              </option>
            );
          })}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[var(--text-subtle)]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
