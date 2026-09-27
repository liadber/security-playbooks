import type { SimulationResult } from '@shared/types/simulation';
import { useState } from 'react';
import { readSimulateTriggerRequest } from '@/features/simulation/readSimulateTriggerRequest';
import { simulateTrigger } from '@/features/simulation/simulation.api';
import { SIMULATION_FIELDS } from '@/features/simulation/simulation.constants';
import { useApiData } from '@/shared/api/useApiData';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { CardList } from '@/shared/components/CardList';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { LoadError } from '@/shared/components/LoadError';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { SelectField } from '@/shared/components/SelectField';
import { SidebarLayout } from '@/shared/components/SidebarLayout';
import { keptString } from '@/shared/forms/keptValue';
import { useFormAction } from '@/shared/forms/useFormAction';
import { actionLabels } from '@/shared/options/actionLabels';
import { codeLabel } from '@/shared/options/codeLabel';
import { getPlaybookOptions } from '@/shared/options/options.api';
import styles from './SimulatePage.module.css';

export function SimulatePage() {
  const options = useApiData(getPlaybookOptions);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const { state, formAction, isPending } = useFormAction(
    async (formData) => {
      // Each simulation starts from a blank result, so a failure never shows its error above the
      // matches of the previous one.
      setResult(null);
      setResult(await simulateTrigger(readSimulateTriggerRequest(formData).trigger));
    },
    { keepValues: [SIMULATION_FIELDS.trigger] },
  );

  if (options.isLoading && !options.data) {
    return <LoadingScreen />;
  }
  if (options.error || !options.data) {
    return (
      <LoadError
        title="Simulate"
        message={options.error?.message ?? 'The triggers could not be loaded.'}
        onRetry={options.reload}
      />
    );
  }

  const { triggers, actions } = options.data;
  const title = result
    ? `Matching playbooks for ${codeLabel(triggers, result.trigger)}`
    : 'Matching playbooks';

  return (
    <>
      <h1>Simulate</h1>
      <SidebarLayout>
        <SidebarLayout.Sidebar>
          <form action={formAction} className={styles.form}>
            {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
            <SelectField
              label="Trigger"
              name={SIMULATION_FIELDS.trigger}
              required
              options={triggers.map(({ code, label }) => ({ value: code, label }))}
              defaultValue={keptString(state.values, SIMULATION_FIELDS.trigger) ?? ''}
              error={state.fields?.[SIMULATION_FIELDS.trigger]}
            />
            <Button type="submit" pending={isPending}>
              Simulate
            </Button>
          </form>
        </SidebarLayout.Sidebar>
        <SidebarLayout.Main title={title}>
          {!result ? (
            <EmptyState>Choose a trigger to see which playbooks would run.</EmptyState>
          ) : result.matches.length === 0 ? (
            <EmptyState>No playbook runs for this trigger yet.</EmptyState>
          ) : (
            <CardList>
              {result.matches.map((match) => (
                <li key={match.id}>
                  <Card>
                    <h3 className={styles.title}>{match.name}</h3>
                    <p className={styles.meta}>Actions: {actionLabels(actions, match.actions)}</p>
                  </Card>
                </li>
              ))}
            </CardList>
          )}
        </SidebarLayout.Main>
      </SidebarLayout>
    </>
  );
}
