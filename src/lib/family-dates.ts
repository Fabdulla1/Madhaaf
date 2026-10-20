export type DatePrecision = "unknown" | "day" | "month" | "year" | "text";
export type DateParts = { precision: DatePrecision; year: string; month: string; day: string };

export const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function parseFamilyDate(value: string): DateParts {
  if (!value) return { precision: "unknown", year: "", month: "", day: "" };
  const match = /^(\d{4}|\?{4})(?:-(\d{2}|\?{2}))?(?:-(\d{2}|\?{2}))?$/.exec(value);
  if (!match) return { precision: "text", year: "", month: "", day: "" };
  return { precision: match[3] ? "day" : match[2] ? "month" : "year", year: match[1].replace(/\?/g, ""), month: (match[2] ?? "").replace(/\?/g, ""), day: (match[3] ?? "").replace(/\?/g, "") };
}

export function daysInMonth(year: string, month: string) {
  if (month === "02") {
    const y = Number(year);
    return !year || (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28;
  }
  return ["04", "06", "09", "11"].includes(month) ? 30 : 31;
}

export function serializeFamilyDate(parts: DateParts) {
  if (parts.precision === "unknown") return "";
  const year = parts.year ? parts.year.padStart(4, "0") : "????";
  if (parts.precision === "year") return year;
  const month = parts.month || "??";
  return parts.precision === "month" ? `${year}-${month}` : `${year}-${month}-${parts.day || "??"}`;
}

export function validateFamilyDate(value: string) {
  const parts = parseFamilyDate(value);
  if (parts.precision === "unknown" || parts.precision === "text") return true;
  if (!parts.year || Number(parts.year) < 1 || Number(parts.year) > 9999) return "Choose a year from 1 to 9999, or use an approximate date.";
  if (parts.precision === "year") return true;
  if (!parts.month || Number(parts.month) < 1 || Number(parts.month) > 12) return "Choose a month, or change the date detail to Year only.";
  if (parts.precision === "month") return true;
  if (!parts.day || Number(parts.day) < 1 || Number(parts.day) > daysInMonth(parts.year, parts.month)) return "Choose a valid day, or change the date detail to Month and year.";
  return true;
}
