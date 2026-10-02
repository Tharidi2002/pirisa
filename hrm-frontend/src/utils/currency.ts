const numberLocales: Record<string, string> = {
  en: "en-LK",
  si: "si-LK",
  ta: "ta-LK",
};

const rupeeLabels: Record<string, string> = {
  en: "Rs.",
  si: "රු.",
  ta: "ரூ.",
};

export const getLkrLocale = (language: string) =>
  numberLocales[language] ?? numberLocales.en;

export const formatLkrAmount = (value: number | string, language = "en") => {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat(getLkrLocale(language), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatLkr = (value: number | string, language = "en") =>
  `${rupeeLabels[language] ?? rupeeLabels.en} ${formatLkrAmount(value, language)}`;

export const normalizeLkrInput = (value: string) => {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  const decimalIndex = cleaned.indexOf(".");
  if (decimalIndex < 0) return cleaned;

  const whole = cleaned.slice(0, decimalIndex);
  const fraction = cleaned
    .slice(decimalIndex + 1)
    .replace(/\./g, "")
    .slice(0, 2);
  return `${whole || "0"}.${fraction}`;
};

export const finalizeLkrInput = (value: string) => {
  const normalized = normalizeLkrInput(value);
  if (!normalized) return "";

  const [whole, fraction = ""] = normalized.split(".");
  return `${whole || "0"}.${fraction.padEnd(2, "0")}`;
};
