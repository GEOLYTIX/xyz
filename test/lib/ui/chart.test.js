import { expect } from '@esm-bundle/chai';
import chart from '../../../lib/ui/Chart.mjs';
import { html } from 'uhtml';

const ui = {
    chart,
  }

it('Creating a Blank bar chart', async () => {

  const e = document.createElement('div');
  e.target = document.createElement('div.location.undefined')

  const canvas = e.target.appendChild(html.node`<canvas>`);
  canvas.setAttribute("height", 200);
  canvas.setAttribute("width", 200);

   var chart = ui.chart(canvas, {
        type: "bar",
        responsive: true,
        options: {},
      })

    const blank_chart = await chart;

    expect(blank_chart.config._config.type).to.equal('bar');
    expect(blank_chart.config._config.responsive).to.equal(true);
});