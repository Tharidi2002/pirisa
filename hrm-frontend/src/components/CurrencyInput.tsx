import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";

export interface CurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  prefix?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  maxValue?: number;
  className?: string;
  name?: string;
}

const DEFAULT_MAX_VALUE = 99_999_999.99;

/**
 * Convert a numeric value into minor units (BigInt, 2 decimal places)
 */
const parseAmount = (value: number | string): bigint => {
  const raw = String(value ?? "").replace(/,/g, "").trim();
  if (!/^\d*(?:\.\d*)?$/.test(raw)) return 0n;

  const [wholePart = "0", fractionPart = ""] = raw.split(".");
  const whole = wholePart || "0";
  const fraction = fractionPart.padEnd(3, "0");
  let minorUnits = BigInt(whole) * 100n + BigInt(fraction.slice(0, 2) || "0");

  // Round the third decimal (half-up)
  if (fraction[2] >= "5") minorUnits += 1n;
  return minorUnits;
};

const maximumMinorUnits = (maxValue: number): bigint => {
  if (!Number.isFinite(maxValue) || maxValue < 0) return 0n;
  return BigInt(Math.round(maxValue * 100));
};

const limitAmount = (amount: bigint, maximum: bigint) =>
  amount > maximum ? maximum : amount;

const normalizeDigits = (digits: string) =>
  digits.replace(/^0+(?=\d)/, "") || "0";

/**
 * Format minor units into "1,234.56"
 */
const formatAmount = (minorUnits: bigint): string => {
  const digits = minorUnits.toString().padStart(3, "0");
  const whole = digits.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${whole}.${digits.slice(-2)}`;
};

const CurrencyInput = ({
  value,
  onChange,
  label,
  placeholder = "0.00",
  prefix = "Rs.",
  disabled = false,
  required = false,
  error,
  maxValue = DEFAULT_MAX_VALUE,
  className = "",
  name,
}: CurrencyInputProps) => {
  const generatedId = useId();
  const inputId = `currency-input-${generatedId}`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);

  const maximum = maximumMinorUnits(maxValue);

  // `digits` holds the raw numeric digits as a string (e.g. "123456" → 1234.56)
  const initialAmount = limitAmount(parseAmount(value), maximum);
  const [digits, setDigits] = useState(initialAmount.toString());

  const focusedRef = useRef(false);
  const formattedValue = formatAmount(BigInt(digits));

  // Sync external value → internal digits
  useEffect(() => {
    const externalAmount = limitAmount(parseAmount(value), maximum);
    setDigits(externalAmount.toString());
  }, [maximum, value]);

  // Keep cursor at the end while focused (prevents jumping)
  useLayoutEffect(() => {
    if (focusedRef.current && inputRef.current) {
      const end = inputRef.current.value.length;
      inputRef.current.setSelectionRange(end, end);
    }
  }, [formattedValue]);

  // ---- Core digit manipulation ----

  const updateDigits = (nextDigits: string) => {
    const normalized = normalizeDigits(nextDigits);
    const nextAmount = BigInt(normalized);
    if (nextAmount > maximum) return; // ignore overflow

    setDigits(normalized);
    onChange(Number(nextAmount) / 100);
  };

  const appendDigit = (digit: string) => {
    updateDigits(normalizeDigits(`${digits}${digit}`));
  };

  const removeLastDigit = () => {
    updateDigits(digits.length > 1 ? digits.slice(0, -1) : "0");
  };

  // ---- Event handlers ----

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Allow copy / select-all / paste shortcuts
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      if (key === "v" || key === "a" || key === "c") return;
      event.preventDefault();
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      appendDigit(event.key);
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      removeLastDigit();
    } else if (event.key === "." || event.key === "Decimal") {
      event.preventDefault(); // decimal is always shown
    } else if (
      event.key.length === 1 ||
      ["ArrowLeft", "Home", "End"].includes(event.key)
    ) {
      event.preventDefault();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Handle mobile / IME input as a fallback
    const inputEvent = event.nativeEvent as InputEvent;
    if (inputEvent.inputType === "deleteContentBackward") {
      removeLastDigit();
    } else if (
      inputEvent.inputType.startsWith("insert") &&
      inputEvent.data &&
      /^\d$/.test(inputEvent.data)
    ) {
      appendDigit(inputEvent.data);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").trim();

    // Allow thousands separators only if properly formatted
    if (pasted.includes(",") && !/^\d{1,3}(?:,\d{3})*(?:\.\d*)?$/.test(pasted)) {
      return;
    }

    const normalizedPaste = pasted.replace(/,/g, "");
    if (!/^\d*(?:\.\d*)?$/.test(normalizedPaste)) return;

    const pastedAmount = parseAmount(normalizedPaste);
    if (pastedAmount <= maximum) {
      updateDigits(pastedAmount.toString());
    }
  };

  const handleFocus = () => {
    focusedRef.current = true;
    const end = inputRef.current?.value.length ?? 0;
    inputRef.current?.setSelectionRange(end, end);
  };

  const handleBlur = () => {
    focusedRef.current = false;
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
      )}

      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-base font-medium text-slate-500"
        >
          {prefix}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder={placeholder}
          value={formattedValue}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={(event) => {
            const end = event.currentTarget.value.length;
            event.currentTarget.setSelectionRange(end, end);
          }}
          className={`w-full rounded-lg border bg-white py-3 pl-14 pr-3 text-right font-mono text-base tabular-nums text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
              : "border-slate-300"
          }`}
        />
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default CurrencyInput;