import { PageLayout } from './shared/components/PageLayout';
import { APP_NAME } from './shared/constants/app.constants';

export function App() {
  return (
    <PageLayout title={APP_NAME}>
      <h1>Welcome</h1>
    </PageLayout>
  );
}
