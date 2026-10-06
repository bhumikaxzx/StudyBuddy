export default function StatCard({ icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h3>{label}</h3>
        <span className="stat-value">{value}</span>
        {hint && <span className="stat-change">{hint}</span>}
      </div>
    </div>
  );
}
