"use client";

import { useEffect, useState } from "react";
import AppShell, { TabKey } from "./components/AppShell";
import MiniCalendar from "./components/MiniCalendar";
import DayView from "./components/DayView";
import EventsList from "./components/EventsList";
import SettingsScreen from "./components/SettingsScreen";
import EventFormSheet from "./components/EventFormSheet";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("calendar");
  // null до монтирования: new Date() при пререндере запекается в HTML
  // и даёт рассинхрон с клиентом (отсюда «Сентябрь» на проде)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onFabClick={openForm}
      overlay={
        selectedDate ? (
          <EventFormSheet
            isOpen={isFormOpen}
            initialDate={selectedDate}
            onClose={closeForm}
          />
        ) : null
      }
    >
      <main className="px-4 pt-4 pb-6">
        <header className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Karina</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Календарь смен и событий
          </p>
        </header>

        {activeTab === "calendar" &&
          (selectedDate ? (
            <>
              <MiniCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              <DayView date={selectedDate} />
            </>
          ) : (
            <div className="h-[420px]" />
          ))}

        {activeTab === "events" && <EventsList />}

        {activeTab === "settings" && <SettingsScreen />}
      </main>
    </AppShell>
  );
}