"use client";

import { useEffect, useState } from "react";
import { getMonthGrid, MONTHS_RU, WEEKDAYS_RU } from "../lib/date-utils";
import {
  getDayType,
  getScheduleConfig,
  ScheduleConfig,
  DayType,
} from "../lib/shift-schedule";

export default function MiniCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [config, setConfig] = useState<ScheduleConfig | null>(null);

  // Загружаем конфиг графика при монтировании
  useEffect(() => {
    setConfig(getScheduleConfig());
  }, []);

  const days = getMonthGrid(year, month);

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
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS_RU.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Сетка дней */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const dayType: DayType = d.isCurrentMonth
            ? getDayType(d.date, config)
            : "unknown";

          return (
            <div
              key={i}
              className="aspect-square flex items-center justify-center relative"
            >
              {/* Рамка вокруг рабочего дня */}
              {dayType === "work" && (
                <div
                  className="absolute inset-0.5 rounded-full border-2"
                  style={{
                    borderColor: "var(--color-workday)",
                    opacity: 0.35,
                  }}
                />
              )}

              {/* Кружок для сегодня */}
              <div
                className={`
                  relative w-9 h-9 flex items-center justify-center rounded-full text-sm transition
                  ${
                    d.isToday
                      ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                      : d.isCurrentMonth
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-300 dark:text-neutral-700"
                  }
                `}
              >
                {d.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}