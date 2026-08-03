export function FormCard({ maxWidth = 480, stripeColor, align = 'center', children }) {
  return (
    <div
      className="ficha"
      style={{ maxWidth, margin: align === 'center' ? '0 auto' : '0', '--stripe': stripeColor }}
    >
      <div className="ficha-pad">{children}</div>
    </div>
  );
}
