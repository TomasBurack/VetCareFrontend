import { Pencil, Trash2 } from 'lucide-react';

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function EntityRow({ name, subtitle, onEdit, onDelete, color }) {
  return (
    <div className="ficha" style={{ marginBottom: '0.7rem' }}>
      <div className="entity-card">
        <div className="avatar" style={color ? { background: color } : undefined}>
          {initials(name)}
        </div>
        <div className="meta">
          <div className="name">{name}</div>
          {subtitle && <div className="sub">{subtitle}</div>}
        </div>
        {(onEdit || onDelete) && (
          <div className="actions">
            {onEdit && (
              <button className="icon-btn" title="Editar" onClick={onEdit}>
                <Pencil size={15} />
              </button>
            )}
            {onDelete && (
              <button className="icon-btn danger" title="Eliminar" onClick={onDelete}>
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
