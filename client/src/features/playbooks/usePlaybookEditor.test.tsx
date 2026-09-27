import type { Playbook } from '@shared/types/playbook';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/api-error';
import * as playbooksApi from './playbooks.api';
import { PLAYBOOK_FORM_MODE } from './playbooks.constants';
import { usePlaybookEditor } from './usePlaybookEditor';

vi.mock('./playbooks.api');

const quarantine: Playbook = {
  id: 'p1',
  name: 'Quarantine',
  trigger: 'MALWARE_DETECTED',
  actions: ['ISOLATE_HOST'],
};

const onChange = vi.fn();

beforeEach(() => {
  onChange.mockReset();
});

function renderEditor() {
  return renderHook(() => usePlaybookEditor(onChange));
}

describe('usePlaybookEditor', () => {
  it('starts with an empty create form and no message', () => {
    const { result } = renderEditor();

    expect(result.current.editing).toBeNull();
    expect(result.current.message).toBeNull();
    expect(result.current.formKey).toMatch(/^create-/);
  });

  it('startEdit puts the playbook in the form; cancel returns to a fresh create form', () => {
    const { result } = renderEditor();
    const firstKey = result.current.formKey;

    act(() => result.current.startEdit(quarantine));

    expect(result.current.editing).toBe(quarantine);
    expect(result.current.formKey).toBe('edit-p1');

    act(() => result.current.cancel());

    expect(result.current.editing).toBeNull();
    expect(result.current.formKey).toMatch(/^create-/);
    expect(result.current.formKey).not.toBe(firstKey);
  });

  it('onSaved sets the message, resets the form and reports the change', () => {
    const { result } = renderEditor();
    act(() => result.current.startEdit(quarantine));

    act(() => result.current.onSaved({ name: 'Quarantine', mode: PLAYBOOK_FORM_MODE.EDIT }));

    expect(result.current.message).toBe('Playbook "Quarantine" updated');
    expect(result.current.editing).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => result.current.onSaved({ name: 'Lockdown', mode: PLAYBOOK_FORM_MODE.CREATE }));

    expect(result.current.message).toBe('Playbook "Lockdown" created');
  });

  it('clears the message when the next submit starts and when editing starts', () => {
    const { result } = renderEditor();
    act(() => result.current.onSaved({ name: 'Lockdown', mode: PLAYBOOK_FORM_MODE.CREATE }));
    expect(result.current.message).not.toBeNull();

    act(() => result.current.onSubmitStart());
    expect(result.current.message).toBeNull();

    act(() => result.current.onSaved({ name: 'Lockdown', mode: PLAYBOOK_FORM_MODE.CREATE }));
    act(() => result.current.startEdit(quarantine));
    expect(result.current.message).toBeNull();
  });

  it('remove deletes and reports the change; a 404 counts as done', async () => {
    vi.mocked(playbooksApi.deletePlaybook).mockResolvedValueOnce(undefined);
    const { result } = renderEditor();

    await act(() => result.current.remove('p2'));

    expect(playbooksApi.deletePlaybook).toHaveBeenCalledWith('p2');
    expect(onChange).toHaveBeenCalledTimes(1);

    vi.mocked(playbooksApi.deletePlaybook).mockRejectedValueOnce(
      new ApiError(404, 'Playbook not found'),
    );
    await act(() => result.current.remove('p2'));

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('remove rethrows any other failure and reports nothing', async () => {
    vi.mocked(playbooksApi.deletePlaybook).mockRejectedValueOnce(
      new ApiError(500, 'Internal server error'),
    );
    const { result } = renderEditor();

    await expect(act(() => result.current.remove('p2'))).rejects.toThrow('Internal server error');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('remove leaves edit mode when the playbook being edited is deleted', async () => {
    vi.mocked(playbooksApi.deletePlaybook).mockResolvedValue(undefined);
    const { result } = renderEditor();
    act(() => result.current.startEdit(quarantine));

    await act(() => result.current.remove('p2'));
    expect(result.current.editing).toBe(quarantine);

    await act(() => result.current.remove('p1'));
    expect(result.current.editing).toBeNull();
  });
});
