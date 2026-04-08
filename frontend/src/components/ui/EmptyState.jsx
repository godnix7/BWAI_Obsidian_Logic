const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 opacity-60">
      {Icon && <Icon size={48} strokeWidth={1.2} style={{ color: "var(--text-muted)", marginBottom: 16 }} />}
      <h3 className="text-lg font-display font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{title}</h3>
      {description && <p className="text-sm" style={{ color: "var(--text-muted)" }}>{description}</p>}
    </div>
  )
}
export default EmptyState
