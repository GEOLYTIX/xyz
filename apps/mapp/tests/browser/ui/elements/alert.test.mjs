/**
## /tests/lib/ui/elements/alert

@module /tests/lib/ui/elements/alert
*/

import { describe, expect, it } from 'vitest';

describe('ui/elements/alert', () => {
  it('creates an alert carrying the title and text', async () => {
    const alert = await mapp.ui.elements.alert({
      text: 'ALERT TEXT',
      title: 'ALERT TITLE',
    });

    expect(alert).toBeDefined();
    expect(alert.title).toEqual('ALERT TITLE');
    expect(alert.text).toEqual('ALERT TEXT');

    alert.close();
  });

  it('defaults the title and leaves the text empty', async () => {
    const alert = await mapp.ui.elements.alert({});

    expect(alert).toBeDefined();
    expect(alert.title).toEqual('Information');
    expect(alert.text).toBeUndefined();

    alert.close();
  });

  it('appends the alert to the document and removes it on close', async () => {
    const before = document.body.childElementCount;

    const alert = await mapp.ui.elements.alert({ text: 'ALERT TEXT' });

    expect(document.body.childElementCount).toBeGreaterThan(before);

    alert.close();

    expect(document.body.childElementCount).toEqual(before);
  });
});
