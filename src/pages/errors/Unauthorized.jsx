import { ErrorPage } from './ErrorPage';

export function Unauthorized() {
  return <ErrorPage code={401} actionTo="/login" />;
}
