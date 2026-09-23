"use client";

import { useState } from "react";
import AppShell, { TabKey } from "./components/AppShell";
import MiniCalendar from "./components/MiniCalendar";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("calendar");

  const handleFabClick = () => {
    alert("Скоро здесь будет форма добавления события");
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onFabClick={handleFabClick}
    >
      <main className="px-4 pt-4 pb-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Karina</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Календарь смен и событий
          </p>
        </header>

        {activeTab === "calendar" && <MiniCalendar />}

        {activeTab === "events" && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-neutral-500 dark:text-neutral-400">
                Здесь будет список событий
              </p>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4">⚙️</div>
              <p className="text-neutral-500 dark:text-neutral-400">
                Здесь будут настройки графика и темы
              </p>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}