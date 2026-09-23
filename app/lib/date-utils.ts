// Утилиты для работы с датами (без внешних библиотек — пока)

export const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/**
 * Возвращает массив дней для отображения в календаре месяца.
 * Первая ячейка — понедельник первой недели (может быть из прошлого месяца).
 * Последняя ячейка — воскресенье последней недели (может быть из следующего).
 */
export type CalendarDay = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  // Понедельник = 0, воскресенье = 6
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const totalDays = lastOfMonth.getDate();

  const days: CalendarDay[] = [];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Добавляем дни из прошлого месяца
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({
      date: d,
      day: d.getDate(),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Дни текущего месяца
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    days.push({
      date: d,
      day,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
    });
  }

  // Добираем дни до полной недели (6 недель максимум = 42 ячейки)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      day: i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Если 5 недель хватает (30-31 день и не выходит за границы) — обрезаем до 35
  // Но для простоты оставляем 42 — стандарт iOS-календаря
  return days;
}