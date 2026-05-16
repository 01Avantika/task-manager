export default function ChartDonut({ value = 0 }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="donut-wrap">
      <svg className="donut" viewBox="0 0 140 140" role="img" aria-label="Completion rate">
        <circle cx="70" cy="70" r={radius} className="donut-track" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          className="donut-progress"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <strong>{value}%</strong>
    </div>
  );
}
