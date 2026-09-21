import { useEffect, useState } from "react";

interface AdminNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  suffix?: string;
  id?: string;
}

/**
 * A number input that lets the user clear the field and type freely instead of
 * being stuck showing "0" the moment they delete the digit (the plain
 * `value={n} onChange={e => setN(parseInt(e.target.value) || 0)}` pattern forces
 * the DOM back to "0" on every keystroke that empties the field).
 */
export const AdminNumberInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className = "",
  disabled,
  suffix,
  id,
}: AdminNumberInputProps) => {
  const [rawValue, setRawValue] = useState<string>(
    value === 0 || Number.isNaN(value) ? "" : String(value),
  );

  // Keep local text in sync when the value changes externally (fetched data, reset, etc.)
  useEffect(() => {
    const numeric =
      rawValue === "" || rawValue === "-" ? 0 : parseFloat(rawValue);
    if (numeric !== value) {
      setRawValue(value === 0 || Number.isNaN(value) ? "" : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setRawValue(next);

    if (next === "" || next === "-") {
      onChange(0);
      return;
    }

    const parsed = parseFloat(next);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        value={rawValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder ?? "0"}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 ${suffix ? "pr-16" : ""} ${className}`}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
};

export default AdminNumberInput;
