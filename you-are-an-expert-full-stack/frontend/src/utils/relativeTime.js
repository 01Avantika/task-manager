export function relativeTime(date) {
  const diff = new Date(date).getTime() - Date.now();
  const abs = Math.abs(diff);
  const units = [
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) {
      const value = Math.round(diff / ms);
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(value, unit);
    }
  }
  return 'just now';
}
