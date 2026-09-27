import { Button } from '@/shared/components/Button';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { FormField } from '@/shared/components/FormField';
import { useFormAction } from '@/shared/forms/useFormAction';
import styles from './AuthForm.module.css';
import { AUTH_FIELDS, AUTH_MODE, PASSWORD_MIN_LENGTH } from './auth.constants';
import type { AuthMode } from './auth.types';
import { readCredentials } from './readCredentials';
import { useAuth } from './useAuth';

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register } = useAuth();
  const isRegister = mode === AUTH_MODE.REGISTER;

  const { state, formAction, isPending } = useFormAction(
    async (formData) => {
      const credentials = readCredentials(formData);
      await (isRegister ? register(credentials) : login(credentials));
    },
    { keepValues: [AUTH_FIELDS.email] },
  );

  return (
    <form action={formAction} className={styles.form}>
      {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
      <FormField
        label="Email"
        name={AUTH_FIELDS.email}
        type="email"
        required
        autoComplete="email"
        defaultValue={state.values[AUTH_FIELDS.email]}
        error={state.fields?.[AUTH_FIELDS.email]}
      />
      <FormField
        label="Password"
        name={AUTH_FIELDS.password}
        type="password"
        required
        minLength={isRegister ? PASSWORD_MIN_LENGTH : undefined}
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        error={state.fields?.[AUTH_FIELDS.password]}
      />
      <Button type="submit" pending={isPending}>
        {isRegister ? 'Create account' : 'Log in'}
      </Button>
    </form>
  );
}
