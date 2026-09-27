import type { Playbook, PlaybookOptions } from '@shared/types/playbook';
import { Button } from '@/shared/components/Button';
import { CheckboxGroup } from '@/shared/components/CheckboxGroup';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { FormField } from '@/shared/components/FormField';
import { SelectField } from '@/shared/components/SelectField';
import { keptList, keptString } from '@/shared/forms/keptValue';
import { useFormAction } from '@/shared/forms/useFormAction';
import styles from './PlaybookForm.module.css';
import { PLAYBOOK_FIELDS, PLAYBOOK_FORM_MODE } from './playbooks.constants';
import { createPlaybook, updatePlaybook } from './playbooks.api';
import type { PlaybookSaved } from './playbooks.types';
import { readPlaybookInput } from './readPlaybookInput';

type PlaybookFormProps = {
  options: PlaybookOptions;
  /** The playbook being edited, or null for an empty create form. */
  playbook: Playbook | null;
  /** Called as a submit starts, so the page can clear a message from the previous one. */
  onSubmitStart: () => void;
  onSaved: (saved: PlaybookSaved) => void;
  onCancel: () => void;
};

/**
 * One form for creating and editing. The page remounts it (key) per edited playbook, so
 * the defaults below apply; after a failed submit the kept values win over the playbook's.
 */
export function PlaybookForm({
  options,
  playbook,
  onSubmitStart,
  onSaved,
  onCancel,
}: PlaybookFormProps) {
  const mode = playbook ? PLAYBOOK_FORM_MODE.EDIT : PLAYBOOK_FORM_MODE.CREATE;
  const isEdit = mode === PLAYBOOK_FORM_MODE.EDIT;

  const { state, formAction, isPending } = useFormAction(
    async (formData) => {
      onSubmitStart();
      const input = readPlaybookInput(formData);
      const saved = playbook
        ? await updatePlaybook(playbook.id, input)
        : await createPlaybook(input);
      onSaved({ name: saved.name, mode });
    },
    {
      keepValues: [PLAYBOOK_FIELDS.name, PLAYBOOK_FIELDS.trigger],
      keepMultiValues: [PLAYBOOK_FIELDS.actions],
    },
  );

  return (
    <form action={formAction} className={styles.form}>
      <h2 className={styles.title}>{isEdit ? 'Edit playbook' : 'Create playbook'}</h2>
      {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
      <FormField
        label="Name"
        name={PLAYBOOK_FIELDS.name}
        required
        maxLength={options.nameMaxLength}
        defaultValue={keptString(state.values, PLAYBOOK_FIELDS.name) ?? playbook?.name ?? ''}
        error={state.fields?.[PLAYBOOK_FIELDS.name]}
      />
      <SelectField
        label="Trigger"
        name={PLAYBOOK_FIELDS.trigger}
        required
        options={options.triggers.map(({ code, label }) => ({ value: code, label }))}
        defaultValue={keptString(state.values, PLAYBOOK_FIELDS.trigger) ?? playbook?.trigger ?? ''}
        error={state.fields?.[PLAYBOOK_FIELDS.trigger]}
      />
      <CheckboxGroup
        legend="Actions"
        name={PLAYBOOK_FIELDS.actions}
        options={options.actions.map(({ code, label }) => ({ value: code, label }))}
        defaultChecked={keptList(state.values, PLAYBOOK_FIELDS.actions) ?? playbook?.actions ?? []}
        error={state.fields?.[PLAYBOOK_FIELDS.actions]}
      />
      <div className={styles.buttons}>
        <Button type="submit" pending={isPending}>
          {isEdit ? 'Save changes' : 'Create playbook'}
        </Button>
        {isEdit && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
