"use client";

import { useEffect, useState } from "react";
import { getMonthGrid, MONTHS_RU, WEEKDAYS_RU } from "../lib/date-utils";
import {
  getDayType,
  getScheduleConfig,
  ScheduleConfig,
  DayType,
  formatISODate,
} from "../lib/shift-schedule";
import {
  CalendarEvent,
  getAllEvents,
  getEventTypeConfig,
} from "../lib/events";

type MiniCalendarProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Проверяет, попадает ли событие на дату.
 */
function eventOccursOn(ev: CalendarEvent, date: Date): boolean {
  const target = startOfDay(date);
  const start = parseISO(ev.date);
  const end = ev.endDate ? parseISO(ev.endDate) : start;

  if (target < start) return false;

  if (ev.recurrence === "none") {
    return target >= start && target <= end;
  }

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

/**
 * Является ли событие многодневным (без повтора, диапазон > 1 дня).
 */
function isMultiDay(ev: CalendarEvent): boolean {
  if (ev.recurrence !== "none") return false;
  if (!ev.endDate) return false;
  return ev.endDate !== ev.date;
}

/**
 * Начало полоски: true — если этот день — первый день события в неделе
 * (или вообще первый день события).
 */
function isStartOfStrip(ev: CalendarEvent, date: Date, weekStart: Date): boolean {
  const target = startOfDay(date);
  const start = parseISO(ev.date);
  return target.getTime() === start.getTime() || target.getTime() === weekStart.getTime();
}

/**
 * Конец полоски: true — если этот день — последний день события в неделе
 * (или вообще последний день события).
 */
function isEndOfStrip(ev: CalendarEvent, date: Date, weekEnd: Date): boolean {
  const target = startOfDay(date);
  const end = ev.endDate ? parseISO(ev.endDate) : parseISO(ev.date);
  return target.getTime() === end.getTime() || target.getTime() === weekEnd.getTime();
}

type CellEvent = {
  event: CalendarEvent;
  isStart: boolean;  // полоска начинается с этого дня (скругление слева)
  isEnd: boolean;    // полоска заканчивается на этом дне (скругление справа)
  isMulti: boolean;  // многодневное
};

export default function MiniCalendar({
  selectedDate,
  onSelectDate,
}: MiniCalendarProps) {
  const [year, setYear] = useState(selectedDate.getFullYear());
  const [month, setMonth] = useState(selectedDate.getMonth());
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setConfig(getScheduleConfig());
    setAllEvents(getAllEvents());
  }, [year, month, tick]);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("karina:events-updated", handler);
    return () => window.removeEventListener("karina:events-updated", handler);
  }, []);

  const days = getMonthGrid(year, month);
  const selectedISO = formatISODate(selectedDate);
  const today = new Date();
  const todayISO = formatISODate(today);
  const todayStart = startOfDay(today);

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Разбиваем массив на недели (по 7 дней)
  const weeks: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {MONTHS_RU[month]} {year}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-neutral-200 dark:active:bg-neutral-800 transition cursor-pointer select-none"
            aria-label="Предыдущий месяц"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-neutral-200 dark:active:bg-neutral-800 transition cursor-pointer select-none"
            aria-label="Следующий месяц"
          >
            ›
          </button>
        </div>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS_RU.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Сетка: недели */}
      <div className="flex flex-col gap-2">
        {weeks.map((week, weekIdx) => {
          const weekStart = startOfDay(week[0].date);
          const weekEnd = startOfDay(week[6].date);

          return (
            <div key={weekIdx} className="grid grid-cols-7">
              {week.map((d, dayIdx) => {
                const dayType: DayType = d.isCurrentMonth
                  ? getDayType(d.date, config)
                  : "unknown";

                const dayISO = formatISODate(d.date);
                const isToday = dayISO === todayISO;
                const isSelected = dayISO === selectedISO && !isToday;
                const isPast = startOfDay(d.date).getTime() < todayStart.getTime();

                // Собираем события этого дня
                const dayEvents = allEvents.filter((ev) =>
                  eventOccursOn(ev, d.date)
                );

                // Сортируем: многодневные сверху, потом по времени начала
                dayEvents.sort((a, b) => {
                  const aMulti = isMultiDay(a) ? 0 : 1;
                  const bMulti = isMultiDay(b) ? 0 : 1;
                  if (aMulti !== bMulti) return aMulti - bMulti;
                  return a.date.localeCompare(b.date);
                });

                const visible = dayEvents.slice(0, 3);

                const cells: CellEvent[] = visible.map((ev) => ({
                  event: ev,
                  isMulti: isMultiDay(ev),
                  isStart: isMultiDay(ev)
                    ? isStartOfStrip(ev, d.date, weekStart)
                    : true,
                  isEnd: isMultiDay(ev)
                    ? isEndOfStrip(ev, d.date, weekEnd)
                    : true,
                }));

                return (
                  <button
                    key={dayIdx}
                    type="button"
                    onClick={() => onSelectDate(d.date)}
                    className="flex flex-col items-center cursor-pointer select-none relative"
                  >
                    {/* Верх: число с кружком */}
                    <div className="relative w-9 h-9 flex items-center justify-center mt-0.5 mb-1">
                      {/* Рабочая смена */}
                      {dayType === "work" && !isToday && (
                        <div className="absolute inset-0 rounded-full bg-black/10 dark:bg-white/10" />
                      )}

                      {/* Сегодня — красный */}
                      {isToday && (
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: "#ff3b30" }}
                        />
                      )}

                      {/* Выбранный — красная обводка */}
                      {isSelected && (
                        <div
                          className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: "#ff3b30" }}
                        />
                      )}

                      <span
                        className={`
                          relative text-sm font-medium
                          ${
                            isToday
                              ? "text-white"
                              : d.isCurrentMonth
                              ? "text-neutral-900 dark:text-neutral-100"
                              : "text-neutral-300 dark:text-neutral-700"
                          }
                        `}
                      >
                        {d.day}
                      </span>
                    </div>

                    {/* Полоски событий */}
                    <div className="flex flex-col gap-1 w-full h-[14px]">
                      {cells.map((c, i) => {
                        const cfg = getEventTypeConfig(c.event.type);
                        const color = isPast ? "#c7c7cc" : cfg.color;

                        // Многодневные — растянуты на всю ширину ячейки
                        if (c.isMulti) {
                          const roundLeft = c.isStart;
                          const roundRight = c.isEnd;
                          return (
                            <div
                              key={i}
                              className="h-1 w-full"
                              style={{
                                backgroundColor: color,
                                borderTopLeftRadius: roundLeft ? 2 : 0,
                                borderBottomLeftRadius: roundLeft ? 2 : 0,
                                borderTopRightRadius: roundRight ? 2 : 0,
                                borderBottomRightRadius: roundRight ? 2 : 0,
                              }}
                            />
                          );
                        }

                        // Однодневные — по центру, короткие
                        return (
                          <div
                            key={i}
                            className="h-1 rounded-full self-center"
                            style={{
                              backgroundColor: color,
                              width: "60%",
                            }}
                          />
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}