import { ErrorPage } from './ErrorPage';

export function ServerError() {
  return <ErrorPage code={500} onAction={() => window.location.reload()} />;
}
