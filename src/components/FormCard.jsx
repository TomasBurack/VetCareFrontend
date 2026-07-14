export function FormCard({ maxWidth = 480, stripeColor, children }) {
  return (
    <div className="ficha" style={{ maxWidth, margin: '0 auto', '--stripe': stripeColor }}>
      <div className="ficha-pad">{children}</div>
    </div>
  );
}
