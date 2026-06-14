/**
 * Bananaworld-DC locale formatters — per UX-DS-017.
 * MVP locale: en-ZA. SAST timezone: Africa/Johannesburg.
 * Currency: ZAR 2dp. Weight: kg 2dp.
 */

const LOCALE = "en-ZA";
const TIMEZONE = "Africa/Johannesburg";

// EPIC-012-M002 — one currency formatter per code, built lazily and memoised. The owner chose "native
// symbol per currency": the number formatting always follows the app locale (en-ZA → space grouping,
// comma decimal) and ONLY the symbol changes with the currency (`narrowSymbol` → "R", "$", "€", …). So a
// ZAR amount stays "R 12 450,00" exactly as before and a USD amount reads "$ 12 450,00".
const moneyFormatters = new Map<string, Intl.NumberFormat>();

function moneyFormatter(currency: string): Intl.NumberFormat {
  let fmt = moneyFormatters.get(currency);
  if (fmt === undefined) {
    fmt = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    moneyFormatters.set(currency, fmt);
  }
  return fmt;
}

const kgFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// EPIC-012-M002 — format a money amount in its explicit currency, native symbol (e.g. formatMoney(12450,
// "ZAR") → "R 12 450,00"; formatMoney(3200, "USD") → "$ 3 200,00"). LABEL ONLY: the number is rendered
// as-is in the given currency, never converted. The currency code comes from the row (farm/customer →
// transaction header); callers pass DEFAULT_CURRENCY for the rare context with no stored currency.
export function formatMoney(amount: number, currency: string): string {
  return moneyFormatter(currency).format(amount);
}

// EPIC-012-M002 — the bare native symbol for a currency (e.g. "R", "$", "€"), for use as an input prefix
// where the value is typed without the formatter (the PO unit-price field). Falls back to the code.
export function currencySymbol(currency: string): string {
  return (
    moneyFormatter(currency)
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency
  );
}

export function formatKg(weight: number): string {
  return `${kgFormatter.format(weight)} kg`;
}

type DateInput = Date | string | number;

export function formatDateZA(input: DateInput): string {
  const date = input instanceof Date ? input : new Date(input);
  return dateFormatter.format(date);
}

export function formatDateTimeZA(input: DateInput): string {
  const date = input instanceof Date ? input : new Date(input);
  return dateTimeFormatter.format(date);
}

export function formatTimeZA(input: DateInput): string {
  const date = input instanceof Date ? input : new Date(input);
  return timeFormatter.format(date);
}

export function formatRelativeTimeZA(input: DateInput): string {
  const date = input instanceof Date ? input : new Date(input);
  const deltaSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(deltaSec);
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
  if (abs < 60) return rtf.format(deltaSec, "second");
  if (abs < 3600) return rtf.format(Math.round(deltaSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(deltaSec / 3600), "hour");
  return rtf.format(Math.round(deltaSec / 86400), "day");
}
