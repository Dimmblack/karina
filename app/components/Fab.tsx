"use client";

type FabProps = {
  onClick: () => void;
};

export default function Fab({ onClick }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Добавить событие"
      className="
        fixed z-40
        w-14 h-14 rounded-full
        bg-black dark:bg-white
        text-white dark:text-black
        text-2xl font-light
        shadow-lg shadow-black/20 dark:shadow-white/10
        flex items-center justify-center
        active:scale-95 transition cursor-pointer select-none
      "
      style={{
        right: "max(20px, calc((100vw - 430px) / 2 + 20px))",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
      }}
    >
      +
    </button>
  );
}