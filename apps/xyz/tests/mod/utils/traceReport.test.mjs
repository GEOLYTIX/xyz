import { describe, expect, it } from 'vitest';
import { traceReport } from '../../../mod/utils/traceReport.js';

// Returns the JSON text injected into the traces script element of the report.
function injectedJSON(html) {
  const open = '<script type="application/json" id="traces">';
  const start = html.indexOf(open) + open.length;
  return html.slice(start, html.indexOf('</script>', start));
}

describe('traceReport', () => {
  it('injects the traces into the report', () => {
    const items = [
      { trace: { name: 'GET /api/query', duration: 1 }, meta: {} },
    ];

    const json = injectedJSON(traceReport(items));

    expect(JSON.parse(json)).toEqual(items);
  });

  it('escapes < so a trace cannot close the script element', () => {
    const name = '</script><img src=x onerror=alert(1)>';

    const html = traceReport([{ trace: { name, duration: 1 }, meta: {} }]);
    const json = injectedJSON(html);

    // The whole trace is injected and no < is left in the JSON text.
    expect(json).not.toContain('<');
    expect(JSON.parse(json)[0].trace.name).toBe(name);
  });
});
