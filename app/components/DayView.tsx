"use client";

import { useEffect, useState } from "react";
import { MONTHS_RU_GENITIVE } from "../lib/date-utils";
import {
  CalendarEvent,
  getEventsForDate,
  getEventTypeConfig,
} from "../lib/events";
import {
  CycleSlot,
  ScheduleConfig,
  getScheduleConfig,
  getSlot,
} from "../lib/shift-schedule";

type DayViewProps = {
  date: Date;
};

const KIND_COLOR: Record<string, string> = {
  work: "#007aff",
  night: "#5e5ce6",
  off: "#8e8e93",
};

const WEEKDAYS_FULL = [
  "Понедельник", "Вторник", "Среда", "Четверг",
  "Пятница", "Суббота", "Воскресенье",
];

function pluralizeEvents(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "событие";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "события";
  return "событий";
}

function pluralizeDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}

function slotTitle(slot: CycleSlot): string {
  if (slot.label) return slot.label;
  if (slot.kind === "work") return "Рабочий день";
  if (slot.kind === "night") return "Ночная смена";
  return "Выходной";
}

export default function DayView({ date }: DayViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [config, setConfig] = useState<ScheduleConfig | null>(null);

  const reload = () => {
    setEvents(getEventsForDate(date));
    setConfig(getScheduleConfig());
  };

  // Перезагружаем при смене даты
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Реагируем на новые события и на изменение графика
  useEffect(() => {
    const handler = () => reload();
    window.addEventListener("karina:events-updated", handler);
    window.addEventListener("karina:schedule-updated", handler);
    return () => {
      window.removeEventListener("karina:events-updated", handler);
      window.removeEventListener("karina:schedule-updated", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const dayOfMonth = date.getDate();
  const month = MONTHS_RU_GENITIVE[date.getMonth()];
  const year = date.getFullYear();
  const weekdayFull = WEEKDAYS_FULL[(date.getDay() + 6) % 7];

  const slot = getSlot(date, config);
  const slotColor = slot ? KIND_COLOR[slot.kind] : "#8e8e93";

  // Ближайшая смена, если сегодня выходной
  const nextShift = (() => {
    if (!slot || slot.kind !== "off") return null;
    for (let i = 1; i <= 14; i++) {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i);
      const s = getSlot(d, config);
      if (s && s.kind !== "off") return { days: i, slot: s };
    }
    return null;
  })();

  return (
    <section className="mt-4">
      {/* Заголовок дня */}
      <div className="mb-3 px-1">
        <h3 className="text-base font-semibold">
          {dayOfMonth} {month} {year}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {weekdayFull}
        </p>
      </div>

      {/* Смена — главный ответ экрана */}
      {slot && (
        <div
          className="rounded-2xl px-4 py-4 mb-3 flex items-center gap-3"
          style={{ backgroundColor: slotColor + "1f" }}
        >
          <div
            className="w-1 self-stretch rounded-full shrink-0"
            style={{ backgroundColor: slotColor }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold" style={{ color: slotColor }}>
              {slotTitle(slot)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {slot.start && slot.end
                ? `${slot.start} — ${slot.end}`
                : nextShift
                ? `До смены ${nextShift.days} ${pluralizeDays(nextShift.days)}`
                : slot.kind === "off"
                ? "Отдых по графику"
                : "Время не указано"}
            </p>
          </div>
        </div>
      )}

      {/* События дня */}
      <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
        {events.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Событий нет
            </p>
          </div>
        ) : (
          <>
            <ul>
              {events.map((ev) => {
                const cfg = getEventTypeConfig(ev.type);
                return (
                  <li
                    key={ev.id}
                    className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 last:border-0 flex gap-3 items-start"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
                      style={{ backgroundColor: cfg.color + "22" }}
                    >
                      <span>{cfg.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ev.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs" style={{ color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {ev.time && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            • {ev.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="px-4 py-2 text-xs text-neutral-400 dark:text-neutral-500 text-center border-t border-neutral-200 dark:border-neutral-800">
              {events.length} {pluralizeEvents(events.length)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}