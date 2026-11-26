import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { groceryMapview } from '../helpers.mjs';

const { histogram } = mapp.ui.utils;

// The buckets of a histogram query response.
const DATA = [
  { bucket: 0, bucket_max: '10', bucket_min: '0', count: 50 },
  { bucket: 1, bucket_max: '20', bucket_min: '10', count: 100 },
  { bucket: 2, bucket_max: '30', bucket_min: '20', count: 25 },
];

/**
@function createHistogram
@async

@description
Creates a histogram in a target element which is appended to the document. The target is removed when the test finishes.

@param {Object} [params] Properties to assign to the histogram params.
@returns {Promise<Object>} The histogram params.
*/
async function createHistogram(params) {
  const target = document.createElement('div');

  document.body.append(target);

  onTestFinished(() => target.remove());

  params = { target, ...params };

  await histogram.create(params);

  return params;
}

/**
@function buckets

@description
Returns the bucket elements of a histogram.

@param {Object} params The histogram params.
@returns {Array<HTMLElement>} The bucket elements.
*/
function buckets(params) {
  return [...params.node.querySelectorAll('.bucket')];
}

describe('ui/utils/histogram', () => {
  describe('create', () => {
    it('creates the histogram node with the default query and options', async () => {
      const params = await createHistogram();

      expect(params.query).toBe('histogram');
      expect(params.options).toEqual({});
      expect(params.setData).toBeTypeOf('function');

      expect(params.target.children).toHaveLength(1);
      expect(params.target.firstElementChild).toBe(params.node);
      expect(params.node.className).toBe('histogram');
      expect(params.node.style.columnGap).toBe('10px');
    });

    it('creates the elements of the options', async () => {
      const params = await createHistogram({
        options: {
          caption: 'Caption',
          columnGap: 4,
          height: 200,
          title: 'Title',
          width: 300,
          xlabel: 'X',
        },
      });

      expect(params.node.style).toMatchObject({
        columnGap: '4px',
        height: '200px',
        width: '300px',
      });

      expect(params.xlabel.style.width).toBe('300px');

      expect(
        [...params.target.children].map((el) => [el.className, el.textContent]),
      ).toEqual([
        ['histogram-title', 'Title'],
        ['histogram', ''],
        ['histogram-xlabel', 'X'],
        ['histogram-caption', 'Caption'],
      ]);
    });
  });

  describe('setData', () => {
    it('renders the buckets with a height relative to the largest count', async () => {
      const params = await createHistogram({ options: { ylabel: 'Y' } });

      params.setData(DATA);

      expect(params.data).toBe(DATA);

      // The default height is 100px.
      expect(params.options.height).toBe(100);

      expect(params.node.querySelector('.ylabel').textContent).toBe('Y');

      expect(
        buckets(params).map((el) => [el.style.height, { ...el.dataset }]),
      ).toEqual([
        ['50px', { bucket: '0', bucketMax: '10', bucketMin: '0', count: '50' }],
        [
          '100px',
          { bucket: '1', bucketMax: '20', bucketMin: '10', count: '100' },
        ],
        [
          '25px',
          { bucket: '2', bucketMax: '30', bucketMin: '20', count: '25' },
        ],
      ]);

      // A bucket has no tooltip without the tooltip option.
      expect(params.node.querySelector('.bucket-info')).toBeNull();
    });

    it('renders the bucket tooltips with formatted values', async () => {
      const params = await createHistogram({
        formatterParams: { locale: 'en-GB' },
        options: { height: 50, tooltip: true },
      });

      params.setData([
        { bucket: 0, bucket_max: '2500', bucket_min: '1000', count: 1234 },
      ]);

      const [bucket] = buckets(params);

      expect(bucket.style.height).toBe('50px');
      expect(
        [...bucket.querySelectorAll('.bucket-info span')].map(
          (span) => span.textContent,
        ),
      ).toEqual(['Count 1,234', 'Min 1,000', 'Max 2,500']);
    });

    it('renders an empty histogram without a data array', async () => {
      const params = await createHistogram();

      params.setData(DATA);

      params.setData(new Error('failed'));

      expect(buckets(params)).toHaveLength(0);
      expect(params.node.innerHTML).toBe('<div></div>');
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3124: the bucket height is the count divided by the largest count. If all counts are 0, eg. for a viewport without records, the height is NaN and the bucket style is `height: NaNpx`, which is invalid.
    it.fails('renders buckets with a count of 0 without height', async () => {
      const params = await createHistogram();

      params.setData([
        { bucket: 0, bucket_max: '1', bucket_min: '0', count: 0 },
        { bucket: 1, bucket_max: '2', bucket_min: '1', count: 0 },
      ]);

      expect(buckets(params).map((el) => el.style.height)).toEqual([
        '0px',
        '0px',
      ]);
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3124: the tooltip values are formatted with `{ value: bucket.count, ...params }`. The histogram params are spread after the bucket value, so a value property of the params, eg. the value of a location dataview entry, replaces the count, min and max of every bucket.
    it.fails('formats the bucket values for params with a value', async () => {
      const params = await createHistogram({
        formatterParams: { locale: 'en-GB' },
        options: { tooltip: true },
        value: 5,
      });

      params.setData([
        { bucket: 0, bucket_max: '30', bucket_min: '20', count: 10 },
      ]);

      expect(
        [...params.node.querySelectorAll('.bucket-info span')].map(
          (span) => span.textContent,
        ),
      ).toEqual(['Count 10', 'Min 20', 'Max 30']);
    });
  });

  it('renders the histogram of a layer field from the histogram query', async () => {
    const mapview = await groceryMapview();

    const target = document.createElement('div');

    document.body.append(target);

    onTestFinished(() => target.remove());

    const xhr = vi.spyOn(mapp.utils, 'xhr');

    const dataview = await mapp.ui.Dataview({
      dataview: 'histogram',
      layer: mapview.layers.retail_points,
      queryparams: { buckets: 3, field: 'id', table: true },
      target,
    });

    await dataview.show();

    await vi.waitFor(() => expect(dataview.data).toBeInstanceOf(Array), {
      timeout: 10000,
    });

    expect(xhr.mock.calls[0][0]).toContain('template=histogram');

    // The 3 buckets between the 2nd and 98th percentile and the 2 edge buckets.
    expect(buckets(dataview).map((el) => el.dataset.bucket)).toEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
    ]);

    // The buckets have all records of the retail points table.
    const total = dataview.data.reduce((sum, bucket) => sum + bucket.count, 0);

    expect(total).toBe(19229);

    expect(Math.max(...buckets(dataview).map((el) => el.offsetHeight))).toBe(
      100,
    );
  });
});
