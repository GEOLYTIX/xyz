import { describe, expect, it, vi } from 'vitest';
import { alert, confirm } from '../../lib/utils/dialogs.mjs';

describe('utils/dialogs', () => {
  it('is assigned to mapp.utils', () => {
    // The MAPP.UI library, which replaces the methods with the ui elements, is not loaded.
    expect(mapp.utils.alert).toBe(alert);
    expect(mapp.utils.confirm).toBe(confirm);
  });

  const innerContent = document.createElement('div');

  innerContent.innerHTML = '<p>Inner <b>content</b></p>';

  it.each([
    ['a string', 'Saved.', 'Saved.'],
    ['the params text', { text: 'Saved.' }, 'Saved.'],
    [
      'the params text before the innerContent',
      { text: 'Saved.', innerContent },
      'Saved.',
    ],
    ['the innerContent text', { innerContent }, 'Inner content'],
    ['an empty string without text', {}, ''],
    ['an empty string without params', undefined, ''],
  ])('alerts %s', (_, params, text) => {
    const windowAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

    alert(params);

    expect(windowAlert).toHaveBeenCalledExactlyOnceWith(text);
  });

  it.each([true, false])(
    'resolves the confirm to the %s response of the dialog',
    async (response) => {
      const windowConfirm = vi
        .spyOn(window, 'confirm')
        .mockImplementation(() => response);

      const confirmed = confirm({ text: 'Please confirm changes.' });

      // The method is async like the ui confirm element.
      expect(confirmed).toBeInstanceOf(Promise);
      expect(await confirmed).toBe(response);
      expect(windowConfirm).toHaveBeenCalledExactlyOnceWith(
        'Please confirm changes.',
      );
    },
  );

  it('confirms a string', async () => {
    const windowConfirm = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true);

    await confirm('Delete?');

    expect(windowConfirm).toHaveBeenCalledExactlyOnceWith('Delete?');
  });
});
