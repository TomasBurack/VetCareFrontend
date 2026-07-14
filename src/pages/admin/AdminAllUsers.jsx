import { useEffect, useState } from 'react';
import { administratorApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { EntityRow } from '../../components/EntityRow';

const ROLE_COLORS = {
  Administrator: '#B5654A',
  Client: '#3D6B54',
  Veterinarian: '#D9A441',
};

export function AdminAllUsers() {
  const [data, setData] = useState({ admins: [], clients: [], vets: [] });
  const [tab, setTab] = useState('all');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    administratorApi
      .allUsers()
      .then((result) => setData(result ?? { admins: [], clients: [], vets: [] }))
      .catch((err) => setErrors(err instanceof ApiError ? err.messages : ['No se pudieron cargar los usuarios.']));
  }, []);

  const rows = [
    ...data.admins.map((u) => ({ ...u, role: 'Administrator', roleLabel: 'Administrador' })),
    ...data.clients.map((u) => ({ ...u, role: 'Client', roleLabel: 'Cliente' })),
    ...data.vets.map((u) => ({ ...u, role: 'Veterinarian', roleLabel: 'Veterinario' })),
  ];

  const visibleRows = tab === 'all' ? rows : rows.filter((r) => r.role === tab);

  return (
    <>
      <h1 className="page-title">Todos los usuarios</h1>
      <p className="page-sub">Vista consolidada de administradores, clientes y veterinarios.</p>
      <ErrorBanner messages={errors} />

      <div className="stat-row">
        <div className="stat">
          <div className="n">{data.admins.length}</div>
          <div className="l">Administradores</div>
        </div>
        <div className="stat">
          <div className="n">{data.clients.length}</div>
          <div className="l">Clientes</div>
        </div>
        <div className="stat">
          <div className="n">{data.vets.length}</div>
          <div className="l">Veterinarios</div>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>
          Todos ({rows.length})
        </button>
        <button className={tab === 'Administrator' ? 'active' : ''} onClick={() => setTab('Administrator')}>
          Administradores ({data.admins.length})
        </button>
        <button className={tab === 'Client' ? 'active' : ''} onClick={() => setTab('Client')}>
          Clientes ({data.clients.length})
        </button>
        <button className={tab === 'Veterinarian' ? 'active' : ''} onClick={() => setTab('Veterinarian')}>
          Veterinarios ({data.vets.length})
        </button>
      </div>

      {visibleRows.map((user) => (
        <EntityRow
          key={`${user.role}-${user.id}`}
          name={`${user.firstName} ${user.lastName}`}
          subtitle={`${user.email} · ${user.roleLabel}`}
          color={ROLE_COLORS[user.role]}
        />
      ))}
    </>
  );
}
