"use client";

import { useEffect, useState } from "react";
import {
  ScheduleConfig,
  getScheduleConfig,
  saveScheduleConfig,
  getDayType,
} from "../lib/shift-schedule";

export default function SettingsScreen() {
  const [startDate, setStartDate] = useState<string>("");
  const [savedDate, setSavedDate] = useState<string>("");
  const [saved, setSaved] = useState(false);

  // Загружаем текущий конфиг
  useEffect(() => {
    const config = getScheduleConfig();
    if (config) {
      setStartDate(config.startDate);
      setSavedDate(config.startDate);
    } else {
      // Если графика нет — по умолчанию сегодня
      const today = new Date();
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      setStartDate(iso);
    }
  }, []);

  const handleSave = () => {
    const config: ScheduleConfig = { startDate };
    saveScheduleConfig(config);
    setSavedDate(startDate);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setStartDate(savedDate || "");
  };

  const hasChanges = startDate !== savedDate;

  // Проверка — какой сегодня день по графику
  const todayType = savedDate
    ? getDayType(new Date(), { startDate: savedDate })
    : "unknown";

  return (
    <div className="space-y-6">
      {/* Блок: График 2/2 */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2 px-1">
          График работы
        </h3>

        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
          {/* Дата старта */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <label className="block text-sm font-medium mb-2">
              Первый рабочий день цикла
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl
                bg-white dark:bg-neutral-800
                border border-neutral-200 dark:border-neutral-700
                text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              От этой даты идёт цикл: 2 рабочих → 2 выходных → 2 рабочих → …
            </p>
          </div>

          {/* Сегодня */}
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              Сегодня
            </span>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                todayType === "work"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : todayType === "off"
                  ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-500"
              }`}
            >
              {todayType === "work"
                ? "Рабочий"
                : todayType === "off"
                ? "Выходной"
                : "—"}
            </span>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className={`
              flex-1 py-3 rounded-xl font-semibold transition
              ${
                hasChanges
                  ? "bg-blue-500 text-white active:bg-blue-600 cursor-pointer"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
              }
            `}
          >
            {saved ? "Сохранено ✓" : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges}
            className={`
              px-6 py-3 rounded-xl font-semibold transition
              ${
                hasChanges
                  ? "bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white active:bg-neutral-300 dark:active:bg-neutral-700 cursor-pointer"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
              }
            `}
          >
            Сброс
          </button>
        </div>
      </section>

      {/* Блок: Тема (заглушка) */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2 px-1">
          Оформление
        </h3>
        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Выбор темы появится позже
          </p>
        </div>
      </section>

      {/* Блок: Аккаунт (заглушка) */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2 px-1">
          Аккаунт
        </h3>
        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Синхронизация появится позже
          </p>
        </div>
      </section>
    </div>
  );
}