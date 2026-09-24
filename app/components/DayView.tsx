"use client";

import { useEffect, useState } from "react";
import { MONTHS_RU } from "../lib/date-utils";
import {
  CalendarEvent,
  getEventsForDate,
  getEventTypeConfig,
} from "../lib/events";
import { formatISODate } from "../lib/shift-schedule";

type DayViewProps = {
  date: Date;
  onAddEvent: () => void;
};

function pluralizeEvents(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "событие";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "события";
  return "событий";
}

export default function DayView({ date, onAddEvent }: DayViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Перезагружаем события при смене даты
  useEffect(() => {
    setEvents(getEventsForDate(date));
  }, [date]);

  // Слушаем кастомное событие обновления (когда создали событие через форму)
  useEffect(() => {
    const handler = () => setEvents(getEventsForDate(date));
    window.addEventListener("karina:events-updated", handler);
    return () => window.removeEventListener("karina:events-updated", handler);
  }, [date]);

  const dayOfMonth = date.getDate();
  const month = MONTHS_RU[date.getMonth()];
  const year = date.getFullYear();

  const weekdayIdx = (date.getDay() + 6) % 7;
  const weekdayFull = [
    "Понедельник", "Вторник", "Среда", "Четверг",
    "Пятница", "Суббота", "Воскресенье",
  ][weekdayIdx];

  return (
    <section className="mt-4">
      {/* Заголовок дня */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-base font-semibold">
            {dayOfMonth} {month.toLowerCase()} {year}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {weekdayFull}
          </p>
        </div>
        <button
          type="button"
          onClick={onAddEvent}
          className="text-sm font-medium text-blue-500 active:text-blue-600 cursor-pointer select-none"
        >
          + Добавить
        </button>
      </div>

      {/* Список событий */}
      <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
        {events.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-4xl mb-2 opacity-40">📭</div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Нет событий
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              0 {pluralizeEvents(0)}
            </p>
          </div>
        ) : (
          <>
            <ul>
              {events.map((ev) => {
                const config = getEventTypeConfig(ev.type);
                return (
                  <li
                    key={ev.id}
                    className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 last:border-0 flex gap-3 items-start"
                  >
                    {/* Иконка типа */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
                      style={{ backgroundColor: config.color + "22" }}
                    >
                      <span>{config.icon}</span>
                    </div>
                    {/* Текст */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ev.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs"
                          style={{ color: config.color }}
                        >
                          {config.label}
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