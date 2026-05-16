export default function ChartBar({ data = {}, height = 220 }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  const barWidth = 100 / Math.max(1, entries.length);
  return (
    <svg className="chart" viewBox={`0 0 420 ${height}`} role="img" aria-label="Bar chart">
      {entries.map(([key, value], index) => {
        const h = (value / max) * (height - 70);
        const x = index * (420 / entries.length) + 28;
        const y = height - h - 38;
        return (
          <g key={key}>
            <rect x={x} y={y} width={barWidth * 2.8} height={h} rx="8" className={`bar bar-${key}`} />
            <text x={x + barWidth * 1.4} y={height - 15} textAnchor="middle">{key.replace('_', ' ')}</text>
            <text x={x + barWidth * 1.4} y={y - 8} textAnchor="middle" className="chart-value">{value}</text>
          </g>
        );
      })}
    </svg>
  );
}
