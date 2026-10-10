// Утилиты для работы с датами (без внешних библиотек — пока)

export const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

// Родительный падеж: «10 октября 2026»
export const MONTHS_RU_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export type CalendarDay = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Возвращает массив дней для отображения в календаре месяца.
 * Первая ячейка — понедельник первой недели (может быть из прошлого месяца).
 * 35 ячеек, если месяцу хватает пяти недель, иначе 42.
 */
export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  // Понедельник = 0, воскресенье = 6
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const totalDays = lastOfMonth.getDate();

  const days: CalendarDay[] = [];
  const today = new Date();

  // Дни из прошлого месяца
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({
      date: d,
      day: d.getDate(),
      isCurrentMonth: false,
      isToday: sameDay(d, today),
    });
  }

  // Дни текущего месяца
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    days.push({
      date: d,
      day,
      isCurrentMonth: true,
      isToday: sameDay(d, today),
    });
  }

  // Добиваем до полной недели
  const target = days.length <= 35 ? 35 : 42;
  let nextDay = 1;
  while (days.length < target) {
    const d = new Date(year, month + 1, nextDay++);
    days.push({
      date: d,
      day: d.getDate(),
      isCurrentMonth: false,
      isToday: sameDay(d, today),
    });
  }

  return days;
}