export default function EmptyState({ icon, title, text, action }) {
  return (
    <div className="empty-state compact-empty">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
