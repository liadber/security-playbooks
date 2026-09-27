import { useState } from 'react';
import { AuthForm } from '@/features/auth/AuthForm';
import { AUTH_MODE } from '@/features/auth/auth.constants';
import type { AuthMode } from '@/features/auth/auth.types';
import { PageLayout } from '@/shared/components/PageLayout';
import { APP_NAME } from '@/shared/constants/app.constants';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>(AUTH_MODE.LOGIN);
  const isRegister = mode === AUTH_MODE.REGISTER;
  const otherMode = isRegister ? AUTH_MODE.LOGIN : AUTH_MODE.REGISTER;

  return (
    <PageLayout title={APP_NAME}>
      <section className={styles.card}>
        <h1>{isRegister ? 'Create an account' : 'Log in'}</h1>
        {/* The key remounts the form, so errors and pending state reset when switching. */}
        <AuthForm key={mode} mode={mode} />
        <p className={styles.switch}>
          {isRegister ? 'Already have an account?' : 'No account yet?'}{' '}
          <button type="button" className={styles.link} onClick={() => setMode(otherMode)}>
            {isRegister ? 'Log in' : 'Create one'}
          </button>
        </p>
      </section>
    </PageLayout>
  );
}
