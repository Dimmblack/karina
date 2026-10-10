"use client";

import { useEffect, useState } from "react";
import {
  CycleSlot,
  DayKind,
  PRESETS,
  ShiftPreset,
  getScheduleConfig,
  getSlot,
  saveScheduleConfig,
} from "../lib/shift-schedule";

const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MAX_CYCLE = 14;

const KIND_LABEL: Record<DayKind, string> = {
  work: "Рабочий",
  night: "Ночь",
  off: "Выходной",
};

const KIND_COLOR: Record<DayKind, string> = {
  work: "#007aff",
  night: "#5e5ce6",
  off: "#8e8e93",
};

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function slotTitle(slot: CycleSlot | null): string {
  if (!slot) return "График не задан";
  if (slot.label) return slot.label;
  if (slot.kind === "work") return "Рабочий день";
  if (slot.kind === "night") return "Ночная смена";
  return "Выходной";
}

export default function SettingsScreen() {
  const [startDate, setStartDate] = useState("");
  const [cycle, setCycle] = useState<CycleSlot[]>([]);
  const [savedStart, setSavedStart] = useState("");
  const [savedCycle, setSavedCycle] = useState<CycleSlot[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const config = getScheduleConfig();
    if (config) {
      setStartDate(config.startDate);
      setCycle(config.cycle);
      setSavedStart(config.startDate);
      setSavedCycle(config.cycle);
    }
  }, []);

  const dirty =
    startDate !== savedStart ||
    JSON.stringify(cycle) !== JSON.stringify(savedCycle);

  const handleSave = () => {
    if (!startDate || cycle.length === 0) return;
    saveScheduleConfig({ startDate, cycle });
    setSavedStart(startDate);
    setSavedCycle(cycle);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setStartDate(savedStart || toISO(new Date()));
    setCycle(savedCycle.length ? savedCycle : PRESETS[0].cycle);
  };

  const applyPreset = (preset: ShiftPreset) => {
    setCycle(preset.cycle.map((s) => ({ ...s })));
  };

  const updateSlot = (i: number, patch: Partial<CycleSlot>) => {
    setCycle(cycle.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const setKind = (i: number, kind: DayKind) => {
    if (kind === "off") {
      updateSlot(i, { kind, start: undefined, end: undefined, label: undefined });
    } else {
      updateSlot(i, {
        kind,
        start: cycle[i].start || "09:00",
        end: cycle[i].end || "21:00",
      });
    }
  };

  const addSlot = () => {
    if (cycle.length >= MAX_CYCLE) return;
    setCycle([...cycle, { kind: "work", start: "09:00", end: "21:00" }]);
  };

  const removeSlot = (i: number) => {
    if (cycle.length <= 1) return;
    setCycle(cycle.filter((_, idx) => idx !== i));
  };

  // Полоса «следующие 14 дней»
  const preview = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return { date: d, slot: getSlot(d, { startDate, cycle }) };
  });

  const todaySlot = getSlot(new Date(), { startDate, cycle });

  const activePreset = PRESETS.find(
    (p) => JSON.stringify(p.cycle) === JSON.stringify(cycle)
  );

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2 px-1">
          График работы
        </h3>

        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-4 flex flex-col gap-5">
          {/* Первый день цикла */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Первый рабочий день цикла
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              От этой даты цикл повторяется вперёд и назад.
            </p>
          </div>

          {/* Пресеты */}
          <div>
            <p className="text-sm font-medium mb-2">Готовые графики</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => {
                const isActive = activePreset && activePreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={
                      "px-3 py-2 rounded-full text-sm font-medium transition cursor-pointer select-none active:scale-95 " +
                      (isActive
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700")
                    }
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Конструктор цикла */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Свой цикл</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                {cycle.length} из {MAX_CYCLE} дней
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {cycle.map((slot, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 w-5">
                      {i + 1}
                    </span>

                    <div className="flex gap-1 flex-1">
                      {(["work", "night", "off"] as DayKind[]).map((kind) => {
                        const isOn = slot.kind === kind;
                        return (
                          <button
                            key={kind}
                            type="button"
                            onClick={() => setKind(i, kind)}
                            className={
                              "flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer select-none active:scale-95 " +
                              (isOn
                                ? "text-white"
                                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300")
                            }
                            style={
                              isOn
                                ? { backgroundColor: KIND_COLOR[kind] }
                                : undefined
                            }
                          >
                            {KIND_LABEL[kind]}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      disabled={cycle.length <= 1}
                      aria-label="Удалить день"
                      className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 dark:text-neutral-500 text-lg leading-none active:bg-neutral-100 dark:active:bg-neutral-700 disabled:opacity-30 cursor-pointer select-none"
                    >
                      ×
                    </button>
                  </div>

                  {(slot.kind === "work" || slot.kind === "night") && (
                    <div className="flex items-center gap-2 pl-7">
                      <input
                        type="time"
                        value={slot.start || ""}
                        onChange={(e) => updateSlot(i, { start: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-neutral-400 dark:text-neutral-500">
                        —
                      </span>
                      <input
                        type="time"
                        value={slot.end || ""}
                        onChange={(e) => updateSlot(i, { end: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSlot}
              disabled={cycle.length >= MAX_CYCLE}
              className="mt-2 w-full py-3 rounded-xl text-sm font-medium border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 active:bg-neutral-100 dark:active:bg-neutral-800 disabled:opacity-40 cursor-pointer select-none"
            >
              + Добавить день в цикл
            </button>
          </div>

          {/* Превью 14 дней */}
          <div>
            <p className="text-sm font-medium mb-2">Следующие 14 дней</p>
            <div className="grid grid-cols-7 gap-1.5">
              {preview.map((p, i) => {
                const color = p.slot ? KIND_COLOR[p.slot.kind] : "#8e8e93";
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      {WEEKDAYS_SHORT[(p.date.getDay() + 6) % 7]}
                    </span>
                    <div
                      className="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: color + "26", color: color }}
                    >
                      {p.date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Сегодня */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-sm">Сегодня</span>
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{
                backgroundColor:
                  (todaySlot ? KIND_COLOR[todaySlot.kind] : "#8e8e93") + "26",
                color: todaySlot ? KIND_COLOR[todaySlot.kind] : "#8e8e93",
              }}
            >
              {todaySlot
                ? slotTitle(todaySlot) +
                  (todaySlot.start && todaySlot.end
                    ? " · " + todaySlot.start + "–" + todaySlot.end
                    : "")
                : "—"}
            </span>
          </div>

          {/* Кнопки */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty}
              className="flex-1 py-3 rounded-xl font-medium transition bg-blue-500 text-white active:bg-blue-600 disabled:opacity-40 disabled:cursor-default cursor-pointer select-none"
            >
              {saved ? "Сохранено" : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!dirty}
              className="px-5 py-3 rounded-xl font-medium transition bg-neutral-200 dark:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700 disabled:opacity-40 disabled:cursor-default cursor-pointer select-none"
            >
              Сброс
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}