import { Link } from 'react-router';
import { PageLayout } from '@/shared/components/PageLayout';
import { APP_NAME } from '@/shared/constants/app.constants';
import { ROOT_ROUTE } from './app.constants';

export function NotFoundPage() {
  return (
    <PageLayout title={APP_NAME}>
      <h1>Page not found</h1>
      <p>
        <Link to={ROOT_ROUTE}>Back to the app</Link>
      </p>
    </PageLayout>
  );
}
