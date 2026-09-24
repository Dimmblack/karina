"use client";

import { useEffect, useState } from "react";
import {
  CalendarEvent,
  createEvent,
  getAllEventTypes,
  EventTypeConfig,
  RecurrenceType,
  ReminderOffset,
} from "../lib/events";
import { formatISODate } from "../lib/shift-schedule";

type EventFormSheetProps = {
  isOpen: boolean;
  initialDate: Date;
  onClose: () => void;
  onCreated?: (ev: CalendarEvent) => void;
};

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "Нет" },
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Еженедельно" },
  { value: "monthly", label: "Ежемесячно" },
  { value: "yearly", label: "Ежегодно" },
];

const REMINDER_OPTIONS: { value: ReminderOffset; label: string }[] = [
  { value: "none", label: "Не напоминать" },
  { value: "5min", label: "За 5 минут" },
  { value: "15min", label: "За 15 минут" },
  { value: "30min", label: "За 30 минут" },
  { value: "1hour", label: "За 1 час" },
  { value: "1day", label: "За 1 день" },
];

export default function EventFormSheet({
  isOpen,
  initialDate,
  onClose,
  onCreated,
}: EventFormSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("todo");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [reminder, setReminder] = useState<ReminderOffset>("none");
  const [types, setTypes] = useState<EventTypeConfig[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setTypes(getAllEventTypes());
    setTitle("");
    setDescription("");
    setDate(formatISODate(initialDate));
    setEndDate("");
    setTime("");
    setType("todo");
    setRecurrence("none");
    setReminder("none");
  }, [isOpen, initialDate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    const ev = createEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      endDate: endDate && endDate !== date ? endDate : undefined,
      time: time || undefined,
      type,
      recurrence,
      reminder,
    });
    window.dispatchEvent(new Event("karina:events-updated"));
    onCreated?.(ev);
    onClose();
  };

  return (
    <>
      {/* Затемнение фона */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50 animate-[fadeIn_0.2s_ease]"
      />

      {/* Лист снизу */}
      <div
        className="
          fixed left-0 right-0 bottom-0 z-50
          mx-auto max-w-[430px]
          bg-white dark:bg-neutral-900
          rounded-t-3xl
          max-h-[90vh]
          flex flex-col
          animate-[slideUp_0.25s_ease]
        "
      >
        {/* Ручка */}
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* Заголовок */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer select-none"
          >
            Отмена
          </button>
          <h2 className="text-base font-semibold">Новое событие</h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className={`
              text-sm font-semibold cursor-pointer select-none
              ${
                title.trim()
                  ? "text-blue-500 active:text-blue-600"
                  : "text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
              }
            `}
          >
            Готово
          </button>
        </div>

        {/* Форма */}
        <div className="overflow-y-auto px-5 py-4 space-y-5">
          {/* Название */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: встреча с клиентом"
              autoFocus
              className="
                w-full px-4 py-3 rounded-xl
                bg-neutral-100 dark:bg-neutral-800
                text-base
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          {/* Дата: С и По */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                С
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="
                  w-full px-3 py-3 rounded-xl
                  bg-neutral-100 dark:bg-neutral-800
                  text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                По
              </label>
              <input
                type="date"
                value={endDate}
                min={date}
                onChange={(e) => setEndDate(e.target.value)}
                className="
                  w-full px-3 py-3 rounded-xl
                  bg-neutral-100 dark:bg-neutral-800
                  text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
            </div>
          </div>

          {/* Время */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              Время (необязательно)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="
                w-full px-3 py-3 rounded-xl
                bg-neutral-100 dark:bg-neutral-800
                text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          {/* Тип */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              Тип
            </label>
            <div className="grid grid-cols-2 gap-2">
              {types.map((t) => {
                const isActive = t.key === type;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`
                      flex items-center gap-2 px-3 py-3 rounded-xl
                      text-sm font-medium text-left
                      cursor-pointer select-none transition
                      ${
                        isActive
                          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "bg-neutral-100 dark:bg-neutral-800"
                      }
                    `}
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: t.color + "33" }}
                    >
                      {t.icon}
                    </span>
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Повтор */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              Повтор
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="
                w-full px-4 py-3 rounded-xl
                bg-neutral-100 dark:bg-neutral-800
                text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500
                cursor-pointer
              "
            >
              {RECURRENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Напоминание */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              Напоминание
            </label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value as ReminderOffset)}
              className="
                w-full px-4 py-3 rounded-xl
                bg-neutral-100 dark:bg-neutral-800
                text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500
                cursor-pointer
              "
            >
              {REMINDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              Описание (необязательно)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Дополнительные заметки…"
              className="
                w-full px-4 py-3 rounded-xl
                bg-neutral-100 dark:bg-neutral-800
                text-base resize-none
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          <div className="h-6" />
        </div>
      </div>
    </>
  );
}