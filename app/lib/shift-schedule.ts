const DAY_MS = 24 * 60 * 60 * 1000;
const CONFIG_KEY = "karina-schedule";

export type DayKind = "work" | "night" | "off";

export type CycleSlot = {
  kind: DayKind;
  start?: string; // "HH:MM", только для work/night
  end?: string;
  label?: string; // необязательная подпись: «Сутки», «Отсыпной»
};

export type ShiftPreset = {
  id: string;
  name: string;
  cycle: CycleSlot[];
};

export type ScheduleConfig = {
  startDate: string; // первый день цикла, "YYYY-MM-DD"
  cycle: CycleSlot[];
};

// Совместимость с кодом, который ждёт старый тип
export type DayType = DayKind | "unknown";

export const PRESETS: ShiftPreset[] = [
  {
    id: "2-2",
    name: "2/2",
    cycle: [
      { kind: "work", start: "09:00", end: "21:00" },
      { kind: "work", start: "09:00", end: "21:00" },
      { kind: "off" },
      { kind: "off" },
    ],
  },
  {
    id: "3-1",
    name: "3/1",
    cycle: [
      { kind: "work", start: "09:00", end: "21:00" },
      { kind: "work", start: "09:00", end: "21:00" },
      { kind: "work", start: "09:00", end: "21:00" },
      { kind: "off" },
    ],
  },
  {
    id: "4-2",
    name: "4/2",
    cycle: [
      { kind: "work", start: "09:00", end: "21:00" },
      { kind: "work", start: "09:00", end: "21:00" },
      { kind: "work", start: "09:00", end: "21:00" },
      { kind: "work", start: "09:00", end: "21:00" },
      { kind: "off" },
      { kind: "off" },
    ],
  },
  {
    id: "1-3",
    name: "Сутки через трое",
    cycle: [
      { kind: "work", start: "08:00", end: "08:00", label: "Сутки" },
      { kind: "off" },
      { kind: "off" },
      { kind: "off" },
    ],
  },
  {
    id: "dnox",
    name: "День-ночь-отсыпной-выходной",
    cycle: [
      { kind: "work", start: "08:00", end: "20:00", label: "День" },
      { kind: "night", start: "20:00", end: "08:00", label: "Ночь" },
      { kind: "off", label: "Отсыпной" },
      { kind: "off" },
    ],
  },
];

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Пресет 2/2 как конфиг по умолчанию
export function defaultConfig(): ScheduleConfig {
  return {
    startDate: formatISODate(new Date()),
    cycle: PRESETS[0].cycle.map((s) => ({ ...s })),
  };
}

/**
 * Слот цикла для даты. Цикл разворачивается и назад, и вперёд —
 * дни до даты старта больше не «unknown».
 */
export function getSlot(
  date: Date,
  config: ScheduleConfig | null
): CycleSlot | null {
  if (!config || !config.startDate) return null;
  if (!Array.isArray(config.cycle) || config.cycle.length === 0) return null;

  const start = parseISODate(config.startDate);
  if (isNaN(start.getTime())) return null;

  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - start.getTime()) / DAY_MS);
  const len = config.cycle.length;
  const idx = ((diffDays % len) + len) % len;
  return config.cycle[idx] || null;
}

export function getDayType(date: Date, config: ScheduleConfig | null): DayType {
  const slot = getSlot(date, config);
  return slot ? slot.kind : "unknown";
}

// Рабочая ли смена (день или ночь)
export function isWorkDay(date: Date, config: ScheduleConfig | null): boolean {
  const t = getDayType(date, config);
  return t === "work" || t === "night";
}

/**
 * Чтение конфига + миграция со старого формата { startDate }.
 * Без миграции у тех, кто уже открывал приложение, график исчезнет.
 */
export function getScheduleConfig(): ScheduleConfig | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CONFIG_KEY);

  // Ничего не сохранено — отдаём дефолтный 2/2, чтобы демо не было пустым
  if (!raw) return defaultConfig();

  try {
    const parsed = JSON.parse(raw) as {
      startDate?: string;
      cycle?: CycleSlot[];
    };

    // Старый формат: только startDate, цикл был жёстко 2/2
    if (parsed.startDate && !Array.isArray(parsed.cycle)) {
      const migrated: ScheduleConfig = {
        startDate: parsed.startDate,
        cycle: PRESETS[0].cycle.map((s) => ({ ...s })),
      };
      saveScheduleConfig(migrated);
      return migrated;
    }

    if (parsed.startDate && Array.isArray(parsed.cycle) && parsed.cycle.length) {
      return { startDate: parsed.startDate, cycle: parsed.cycle };
    }

    return defaultConfig();
  } catch {
    return defaultConfig();
  }
}

export function saveScheduleConfig(config: ScheduleConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent("karina:schedule-updated"));
}