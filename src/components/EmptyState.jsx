export function EmptyState({ icon, message, subtitle, action }) {
  return (
    <div className="empty">
      {icon && <div className="glyph">{icon}</div>}
      <div className="msg">{message}</div>
      {subtitle && <div className="sub">{subtitle}</div>}
      {action}
    </div>
  );
}
