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

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full rounded-xl px-4 py-2.5 text-sm glass-input text-slate-100 bg-[#0c1322] transition-all duration-200 appearance-none cursor-pointer ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-rose-500/80 focus:border-rose-500'
              : 'border-white/10 hover:border-white/20'
          }`}
          {...props}
        >
          <option value="" disabled className="bg-[#0f172a] text-slate-400">
            {placeholder}
          </option>
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="bg-[#0f172a] text-slate-100">
                {text}
              </option>
            );
          })}
        </select>

        {/* Custom Chevron icon */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

