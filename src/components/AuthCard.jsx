export function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="mark">V</span> VetCare
        </div>
        <div className="auth-title">{title}</div>
        {subtitle && <div className="auth-sub">{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}
