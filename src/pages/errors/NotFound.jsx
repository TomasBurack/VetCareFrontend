import { ErrorPage } from './ErrorPage';

export function NotFound() {
  return <ErrorPage code={404} actionTo="/" />;
}
