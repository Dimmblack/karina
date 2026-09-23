"use client";

type TabKey = "calendar" | "events" | "settings";

type TabBarProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "calendar", label: "Календарь", icon: "📅" },
  { key: "events", label: "События", icon: "📋" },
  { key: "settings", label: "Настройки", icon: "⚙️" },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav
      className="
        relative shrink-0 border-t border-neutral-200 dark:border-neutral-800
        bg-white/95 dark:bg-black/95 backdrop-blur
      "
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`
                flex flex-col items-center justify-center gap-0.5
                px-4 py-1 rounded-xl transition cursor-pointer select-none
                active:opacity-60
                ${
                  isActive
                    ? "text-black dark:text-white"
                    : "text-neutral-400 dark:text-neutral-500"
                }
              `}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}