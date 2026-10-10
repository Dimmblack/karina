"use client";

import { useEffect, useState } from "react";
import { MONTHS_RU_GENITIVE } from "../lib/date-utils";
import { CalendarEvent, getAllEvents, getEventTypeConfig } from "../lib/events";

const WEEKDAYS_FULL = [
  "Понедельник", "Вторник", "Среда", "Четверг",
  "Пятница", "Суббота", "Воскресенье",
];

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function pluralizeEvents(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "событие";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "события";
  return "событий";
}

type Group = {
  iso: string;
  date: Date;
  events: CalendarEvent[];
};

export default function EventsList() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const load = () => setEvents(getAllEvents());
    load();
    window.addEventListener("karina:events-updated", load);
    return () => window.removeEventListener("karina:events-updated", load);
  }, []);

  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;

  const upcoming = events
    .filter((ev) => (ev.endDate || ev.date) >= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date));

  const groups: Group[] = [];
  for (let i = 0; i < upcoming.length; i++) {
    const ev = upcoming[i];
    const existing = groups.find((g) => g.iso === ev.date);
    if (existing) {
      existing.events.push(ev);
    } else {
      groups.push({ iso: ev.date, date: parseISO(ev.date), events: [ev] });
    }
  }

  if (upcoming.length === 0) {
    return (
      <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 px-4 py-10 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Предстоящих событий нет
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          Нажмите +, чтобы добавить
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 px-1">
        {upcoming.length} {pluralizeEvents(upcoming.length)} впереди
      </p>

      {groups.map((group) => (
        <section key={group.iso}>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2 px-1">
            {group.date.getDate()} {MONTHS_RU_GENITIVE[group.date.getMonth()]}
            {" · "}
            {WEEKDAYS_FULL[(group.date.getDay() + 6) % 7]}
          </h3>

          <ul className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
            {group.events.map((ev) => {
              const cfg = getEventTypeConfig(ev.type);
              const end = ev.endDate && ev.endDate !== ev.date ? parseISO(ev.endDate) : null;
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
                      {end && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          • до {end.getDate()} {MONTHS_RU_GENITIVE[end.getMonth()]}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}