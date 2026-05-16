export default function ChartLine({ data = [] }) {
  const width = 520;
  const height = 220;
  const max = Math.max(1, ...data.map((item) => item.count));
  const points = data.length
    ? data.map((item, index) => {
        const x = 28 + (index / Math.max(1, data.length - 1)) * (width - 56);
        const y = height - 36 - (item.count / max) * (height - 72);
        return `${x},${y}`;
      }).join(' ')
    : `28,${height - 36} ${width - 28},${height - 36}`;
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart">
      <polyline points={points} fill="none" className="line-path" />
      {(data.length ? data : [{ date: 'No data', count: 0 }]).map((item, index) => {
        const x = data.length ? 28 + (index / Math.max(1, data.length - 1)) * (width - 56) : 28;
        const y = data.length ? height - 36 - (item.count / max) * (height - 72) : height - 36;
        return (
          <g key={`${item.date}-${index}`}>
            <circle cx={x} cy={y} r="5" className="line-dot" />
            <text x={x} y={height - 12} textAnchor="middle">{item.date.slice(5) || item.date}</text>
          </g>
        );
      })}
    </svg>
  );
}
