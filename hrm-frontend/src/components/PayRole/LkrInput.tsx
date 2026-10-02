import { useState } from "react";
import {
  finalizeLkrInput,
  formatLkrAmount,
  normalizeLkrInput,
} from "../../utils/currency";

interface LkrInputProps {
  value: string | number;
  onChange: (value: string) => void;
  language: string;
  id?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}

const LkrInput = ({
  value,
  onChange,
  language,
  id,
  placeholder = "0.00",
  className = "",
  required = false,
  readOnly = false,
  onClick,
  "aria-label": ariaLabel,
}: LkrInputProps) => {
  const [focused, setFocused] = useState(false);
  const rawValue = String(value ?? "");
  const displayValue =
    focused || rawValue === "" ? rawValue : formatLkrAmount(rawValue, language);
  const currencyLabel =
    language === "si" ? "රු." : language === "ta" ? "ரூ." : "Rs.";

  const handleBlur = () => {
    const finalizedValue = finalizeLkrInput(rawValue);
    if (finalizedValue !== rawValue) onChange(finalizedValue);
    setFocused(false);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-slate-500">
        {currencyLabel}
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={ariaLabel}
        required={required}
        placeholder={placeholder}
        value={displayValue}
        readOnly={readOnly}
        onClick={onClick}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onChange={(event) => onChange(normalizeLkrInput(event.target.value))}
        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-14 pr-3 text-right text-sm tabular-nums text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 read-only:cursor-default read-only:bg-slate-50"
      />
    </div>
  );
};

export default LkrInput;
