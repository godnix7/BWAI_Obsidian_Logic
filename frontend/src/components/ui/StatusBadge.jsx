const StatusBadge = ({ status }) => {
  const map = {
    pending: "badge-warning", confirmed: "badge-success", rejected: "badge-error",
    cancelled: "badge-default", completed: "badge-accent", active: "badge-success",
    revoked: "badge-error", expired: "badge-default", unpaid: "badge-error",
    paid: "badge-success", partial: "badge-warning", inactive: "badge-default",
    in_person: "badge-accent", video: "badge-info", phone: "badge-default",
    lab_report: "badge-info", prescription: "badge-warning", scan: "badge-success",
    discharge: "badge-accent", other: "badge-default",
    health: "badge-success", dental: "badge-info", vision: "badge-info",
    read_only: "badge-default", full: "badge-accent",
  }
  const cls = map[status] || "badge-default"
  return <span className={`badge ${cls}`}>{status?.replace(/_/g, " ")}</span>
}
export default StatusBadge
