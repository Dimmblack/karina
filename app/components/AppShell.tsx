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
  overlay?: ReactNode; // ← новое: модальные окна и шторки
};

export default function AppShell({
  children,
  activeTab,
  onTabChange,
  onFabClick,
  overlay,
}: AppShellProps) {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden">
      <div
        className="shrink-0"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
        aria-hidden
      />

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>

      {onFabClick && <Fab onClick={onFabClick} />}

      <TabBar active={activeTab} onChange={onTabChange} />

      <div
        className="shrink-0 bg-white dark:bg-black"
        style={{ height: "env(safe-area-inset-bottom, 0px)" }}
        aria-hidden
      />

      {/* Оверлеи (шторки, модальные окна) */}
      {overlay}
    </div>
  );
}