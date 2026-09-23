/**
 * Логика графика 2/2.
 * 
 * От даты старта идёт цикл: 2 рабочих дня → 2 выходных → 2 рабочих → 2 выходных...
 * Цикл — 4 дня.
 */

export type ScheduleConfig = {
  startDate: string; // ISO-строка "YYYY-MM-DD" — первый рабочий день цикла
};

export type DayType = "work" | "off" | "unknown";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Возвращает тип дня (рабочий / выходной) для заданной даты.
 * Если график не настроен — вернёт "unknown".
 */
export function getDayType(date: Date, config: ScheduleConfig | null): DayType {
  if (!config) return "unknown";

  const start = parseISODate(config.startDate);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (target.getTime() - start.getTime()) / DAY_MS
  );

  // Если дата раньше старта — тоже unknown
  if (diffDays < 0) return "unknown";

  const posInCycle = diffDays % 4;
  return posInCycle === 0 || posInCycle === 1 ? "work" : "off";
}

/**
 * Парсит "YYYY-MM-DD" в локальную дату (без сдвига часового пояса).
 */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Форматирует Date в "YYYY-MM-DD" (локально).
 */
export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Хук для получения конфига графика.
 * Пока — из localStorage. Позже заменим на Supabase.
 */
export function getScheduleConfig(): ScheduleConfig | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("karina-schedule");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ScheduleConfig;
  } catch {
    return null;
  }
}

export function saveScheduleConfig(config: ScheduleConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem("karina-schedule", JSON.stringify(config));
}
// ВРЕМЕННО — для теста, потом удалим
if (typeof window !== "undefined") {
  if (!localStorage.getItem("karina-schedule")) {
    localStorage.setItem(
      "karina-schedule",
      JSON.stringify({ startDate: "2026-09-01" })
    );
  }
}