import { PlaybookForm } from '@/features/playbooks/PlaybookForm';
import { PlaybookList } from '@/features/playbooks/PlaybookList';
import { listPlaybooks } from '@/features/playbooks/playbooks.api';
import { usePlaybookEditor } from '@/features/playbooks/usePlaybookEditor';
import { useApiData } from '@/shared/api/useApiData';
import { LoadError } from '@/shared/components/LoadError';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { SidebarLayout } from '@/shared/components/SidebarLayout';
import { SuccessMessage } from '@/shared/components/SuccessMessage';
import { getPlaybookOptions } from '@/shared/options/options.api';

/** Loads the options and the playbooks, then composes the form and the list around the editor. */
export function PlaybooksPage() {
  const options = useApiData(getPlaybookOptions);
  const playbooks = useApiData(listPlaybooks);
  const editor = usePlaybookEditor(playbooks.reload);

  function retry() {
    if (options.error) options.reload();
    if (playbooks.error) playbooks.reload();
  }

  const isFirstLoad =
    (options.isLoading && !options.data) || (playbooks.isLoading && !playbooks.data);
  if (isFirstLoad) {
    return <LoadingScreen />;
  }

  const loadError = options.error ?? playbooks.error;
  if (loadError || !options.data || !playbooks.data) {
    return (
      <LoadError
        title="Playbooks"
        message={loadError?.message ?? 'The playbooks could not be loaded.'}
        onRetry={retry}
      />
    );
  }

  return (
    <>
      <h1>Playbooks</h1>
      <SidebarLayout>
        <SidebarLayout.Sidebar>
          {editor.message && <SuccessMessage>{editor.message}</SuccessMessage>}
          {/* The key remounts the form per edited playbook, so its defaults apply. */}
          <PlaybookForm
            key={editor.formKey}
            options={options.data}
            playbook={editor.editing}
            onSubmitStart={editor.onSubmitStart}
            onSaved={editor.onSaved}
            onCancel={editor.cancel}
          />
        </SidebarLayout.Sidebar>
        <SidebarLayout.Main title="Your playbooks">
          <PlaybookList
            playbooks={playbooks.data}
            options={options.data}
            editingId={editor.editing?.id ?? null}
            onEdit={editor.startEdit}
            onDelete={editor.remove}
          />
        </SidebarLayout.Main>
      </SidebarLayout>
    </>
  );
}
