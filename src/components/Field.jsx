export function Field({ label, required, hint, children, ...props }) {
  return (
    <div>
      <label className="field">
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {children ?? <input className="f" {...props} />}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}
