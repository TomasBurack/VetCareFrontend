import { ErrorPage } from './ErrorPage';
import { useAuth } from '../../context/useAuth';
import { ROLE_HOME } from '../../context/roleHome';

export function Forbidden() {
  const { role } = useAuth();
  return <ErrorPage code={403} actionTo={ROLE_HOME[role] ?? '/mi-perfil'} />;
}
