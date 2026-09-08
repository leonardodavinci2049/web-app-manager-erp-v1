export type Period = { start: string; end: string };

export function civilDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid civil date");
  const date = new Date(`${value}T12:00:00Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value ||
    value < "1000-01-01"
  ) {
    throw new Error("Invalid civil date");
  }
  return date;
}

export function shiftDay(value: string, days: number): string {
  const date = civilDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function maxEndDate(start: string): string {
  const date = civilDate(start);
  const year = date.getUTCFullYear() + 1;
  const month = date.getUTCMonth();
  const day = Math.min(
    date.getUTCDate(),
    new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
  );
  return shiftDay(
    new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10),
    -1,
  );
}

export function validatePeriod(period: Period): Period {
  civilDate(period.start);
  civilDate(period.end);
  if (period.end < period.start || period.end > maxEndDate(period.start)) {
    throw new Error("Invalid period range");
  }
  return period;
}

export function fortalezaDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function periodPresets(today: string): Period[] {
  const monthStart = `${today.slice(0, 7)}-01`;
  const previousEnd = shiftDay(monthStart, -1);
  return [
    { start: shiftDay(today, -30), end: today },
    { start: monthStart, end: today },
    { start: `${previousEnd.slice(0, 7)}-01`, end: previousEnd },
  ];
}

export function displayDate(value: string): string {
  return value.split("-").reverse().join("/");
}
