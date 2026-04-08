const StatCard = ({ icon: Icon, label, value, trend, color = "var(--accent)" }) => {
  return (
    <div className="glass-card p-5 card">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
          {Icon && <Icon size={20} style={{ color }} />}
        </div>
        {trend && (
          <span className="text-xs font-mono" style={{ color: trend > 0 ? "var(--success)" : "var(--error)" }}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold font-display" style={{ color }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
    </div>
  )
}
export default StatCard
