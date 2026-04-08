const PageHeader = ({ title, description, children }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold font-display" style={{ color: "var(--text-primary)" }}>{title}</h1>
        {description && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{description}</p>}
      </div>
      <div className="flex gap-3">
        {children}
      </div>
    </div>
  )
}
export default PageHeader
