function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function subtractUtcDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

export function resolvePreviousStatsAt(statsDates: Date[]): Date | null {
  const uniqueDates = new Map<string, Date>();

  for (const date of [...statsDates].sort(
    (a, b) => b.getTime() - a.getTime()
  )) {
    const key = toUtcDateKey(date);
    if (!uniqueDates.has(key)) {
      uniqueDates.set(key, date);
    }
  }

  const distinctDates = Array.from(uniqueDates.values());
  if (distinctDates.length < 2) {
    return null;
  }

  const latestDate = distinctDates[0];
  const yesterdayKey = toUtcDateKey(subtractUtcDays(latestDate, 1));

  return (
    distinctDates.find((date) => toUtcDateKey(date) === yesterdayKey) ??
    distinctDates[1]
  );
}
