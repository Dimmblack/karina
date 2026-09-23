"use client";

import { ReactNode } from "react";
import TabBar from "./TabBar";
import Fab from "./Fab";

export type TabKey = "calendar" | "events" | "settings";

type AppShellProps = {
  children: ReactNode;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onFabClick?: () => void;
};

export default function AppShell({
  children,
  activeTab,
  onTabChange,
  onFabClick,
}: AppShellProps) {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden">
      {/* Safe area сверху (Dynamic Island) */}
      <div
        className="shrink-0"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
        aria-hidden
      />

      {/* Скроллируемое содержимое */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>

      {/* FAB — поверх всего */}
      {onFabClick && <Fab onClick={onFabClick} />}

      {/* Нижняя панель: таб-бар + safe area снизу */}
      <TabBar active={activeTab} onChange={onTabChange} />
      <div
        className="shrink-0 bg-white dark:bg-black"
        style={{ height: "env(safe-area-inset-bottom, 0px)" }}
        aria-hidden
      />
    </div>
  );
}