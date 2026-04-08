const StatCard = ({ icon: Icon, label, value, trend, color = "var(--accent)" }) => {
  return (
    <div className="glass-card card" style={{ height: "100%", width: "100%", minHeight: 220 }}>
      <div className="card-inner">
        <div className="flex items-start justify-between">
          <div className="p-3.5 rounded-2xl" style={{ background: `${color}15`, color: color }}>
            {Icon && <Icon size={26} />}
          </div>
          {trend && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: trend > 0 ? "rgba(0,168,107,0.15)" : "rgba(220,38,38,0.15)", color: trend > 0 ? "var(--success)" : "var(--error)" }}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          <p className="text-4xl font-bold font-display" style={{ color: "var(--eggplant)", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>{value}</p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>{label}</p>
        </div>
      </div>
    </div>
  )
}
export default StatCard
