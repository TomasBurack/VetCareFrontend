const LABELS = {
  pendant: 'Pendiente',
  served: 'Atendido',
  canceled: 'Cancelado',
};

export function Badge({ status }) {
  const key = status?.toLowerCase();
  return <span className={`badge ${key}`}>{LABELS[key] ?? status}</span>;
}
