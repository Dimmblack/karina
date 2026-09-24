/**
 * Логика событий.
 * Пока — localStorage. Позже заменим на Supabase.
 */

export type EventType =
  | "todo"
  | "event"
  | "reminder"
  | "vacation"
  | "sick"
  | "shift"
  | string;

export type RecurrenceType =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type ReminderOffset =
  | "none"
  | "5min"
  | "15min"
  | "30min"
  | "1hour"
  | "1day";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  date: string;      // "YYYY-MM-DD" — дата начала
  endDate?: string;  // "YYYY-MM-DD" — дата окончания (опционально, для многодневных)
  time?: string;     // "HH:MM"
  type: EventType;
  recurrence: RecurrenceType;
  reminder: ReminderOffset;
  createdAt: string;
};

export type EventTypeConfig = {
  key: string;
  label: string;
  color: string;
  icon: string;
};

export const DEFAULT_EVENT_TYPES: EventTypeConfig[] = [
  { key: "todo",     label: "Задача",       color: "#007aff", icon: "☑️" },
  { key: "event",    label: "Встреча",      color: "#34c759", icon: "📅" },
  { key: "reminder", label: "Напоминание",  color: "#ff9500", icon: "🔔" },
  { key: "vacation", label: "Отпуск",       color: "#5856d6", icon: "🏖️" },
  { key: "sick",     label: "Больничный",   color: "#ff3b30", icon: "🤒" },
  { key: "shift",    label: "Подмена",      color: "#af52de", icon: "🔄" },
];

const EVENTS_KEY = "karina-events";
const TYPES_KEY = "karina-event-types";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getAllEvents(): CalendarEvent[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAllEvents(events: CalendarEvent[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

/**
 * События на конкретную дату (с учётом многодневных и повторов).
 */
export function getEventsForDate(date: Date): CalendarEvent[] {
  const all = getAllEvents();
  return all.filter((ev) => eventOccursOn(ev, date));
}

/**
 * Проверяет, попадает ли событие на дату.
 */
function eventOccursOn(ev: CalendarEvent, date: Date): boolean {
  const target = startOfDay(date);
  const start = parseISO(ev.date);
  const end = ev.endDate ? parseISO(ev.endDate) : start;

  if (target < start) return false;

  // Многодневное без повтора — проверяем диапазон
  if (ev.recurrence === "none") {
    return target >= start && target <= end;
  }

  // С повтором — считаем от start (end игнорируем)
  switch (ev.recurrence) {
    case "daily":
      return true;
    case "weekly":
      return target.getDay() === start.getDay();
    case "monthly":
      return target.getDate() === start.getDate();
    case "yearly":
      return (
        target.getDate() === start.getDate() &&
        target.getMonth() === start.getMonth()
      );
    default:
      return false;
  }
}

export function createEvent(
  data: Omit<CalendarEvent, "id" | "createdAt">
): CalendarEvent {
  const newEvent: CalendarEvent = {
    ...data,
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
  };
  const all = getAllEvents();
  all.push(newEvent);
  saveAllEvents(all);
  return newEvent;
}

export function deleteEvent(id: string) {
  const all = getAllEvents().filter((e) => e.id !== id);
  saveAllEvents(all);
}

export function getAllEventTypes(): EventTypeConfig[] {
  if (typeof window === "undefined") return DEFAULT_EVENT_TYPES;
  const raw = localStorage.getItem(TYPES_KEY);
  const custom: EventTypeConfig[] = raw ? JSON.parse(raw) : [];
  const merged = [...DEFAULT_EVENT_TYPES];
  custom.forEach((c) => {
    const idx = merged.findIndex((m) => m.key === c.key);
    if (idx >= 0) merged[idx] = c;
    else merged.push(c);
  });
  return merged;
}

export function getEventTypeConfig(key: string): EventTypeConfig {
  const all = getAllEventTypes();
  return (
    all.find((t) => t.key === key) ?? {
      key,
      label: key,
      color: "#888",
      icon: "•",
    }
  );
}