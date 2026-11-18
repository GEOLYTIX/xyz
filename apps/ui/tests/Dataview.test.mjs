import { describe, expect, it, onTestFinished, vi } from 'vitest';

const { Dataview } = mapp.ui;

/**
@function fakeType

@description
Assigns a fake dataview type as `mapp.ui.utils.fake`. The create method assigns a setData mock to the dataview. The type is deleted when the test finishes.

@param {Object} [type] Properties to assign to the type, eg. a toolbar.
@returns {Object} The fake type with the create mock.
*/
function fakeType(type = {}) {
  const fake = {
    create: vi.fn((dataview) => {
      dataview.setData = vi.fn();
    }),
    ...type,
  };

  mapp.ui.utils.fake = fake;

  onTestFinished(() => delete mapp.ui.utils.fake);

  return fake;
}

/**
@function createTarget

@description
Appends a target element for a dataview to the document. The element is removed when the test finishes.

@returns {HTMLElement} The target element.
*/
function createTarget() {
  const target = document.createElement('div');

  document.body.append(target);

  onTestFinished(() => target.remove());

  return target;
}

describe('ui/Dataview', () => {
  it('warns and returns without a target element', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const dataview = { dataview: 'fake', target: 'no-such-element' };

    expect(await Dataview(dataview)).toBeUndefined();

    expect(warn).toHaveBeenCalledWith(
      'Dataviews require a HTMLHtmlElement target',
    );
    expect(dataview.target).toBeNull();
    expect(dataview.show).toBeUndefined();
  });

  it('assigns the target element by its id', async () => {
    fakeType();

    const target = createTarget();

    target.id = 'dataview-target';

    const dataview = await Dataview({ dataview: 'fake', target: target.id });

    expect(dataview.target).toBe(target);
  });

  it('returns the decorated dataview with the default methods', async () => {
    const fake = fakeType();

    const dataview = { dataview: 'fake', target: createTarget() };

    expect(await Dataview(dataview)).toBe(dataview);

    expect(dataview.update).toBeTypeOf('function');
    expect(dataview.show).toBeTypeOf('function');
    expect(dataview.hide).toBeTypeOf('function');
    expect(dataview.chkbox).toBeUndefined();

    // The dataview is created when shown.
    expect(fake.create).not.toHaveBeenCalled();
  });

  it('keeps the update, show and hide methods of the configuration', async () => {
    fakeType();

    const methods = { update: vi.fn(), show: vi.fn(), hide: vi.fn() };

    const dataview = await Dataview({
      dataview: 'fake',
      target: createTarget(),
      ...methods,
    });

    expect(dataview).toMatchObject(methods);
  });

  it.each([
    ['query', { query: 'q', title: 't', label: 'l' }, 'q'],
    ['title', { title: 't', label: 'l' }, 't'],
    ['label', { label: 'l' }, 'l'],
  ])('assigns the %s as key', async (_, params, key) => {
    fakeType();

    const dataview = await Dataview({
      dataview: 'fake',
      target: createTarget(),
      ...params,
    });

    expect(dataview.key).toBe(key);
  });

  it('returns the error for a dataview type without utils', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const dataview = { key: 'unknown', target: createTarget() };

    const err = await Dataview(dataview);

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('mapp.ui.utils.undefined doesnt exist');
    expect(dataview.err).toBe(err);
    expect(error).toHaveBeenCalledWith(err);
    expect(dataview.show).toBeUndefined();

    // The update method warns that the dataview can't be updated.
    dataview.update();

    expect(warn).toHaveBeenCalledWith('Unable to update unknown dataview.');
  });

  it('returns the error for a dataview type without create method', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    mapp.ui.utils.fake = {};

    onTestFinished(() => delete mapp.ui.utils.fake);

    const err = await Dataview({ dataview: 'fake', target: createTarget() });

    expect(err.message).toBe(
      "mapp.ui.utils.fake.create() method doesn't exist",
    );
  });

  it.each([
    ['chartjs', 'a chart', { chart: {} }],
    ['tabulator', 'a table', { table: {} }],
  ])('assigns the %s type for %s', async (type, _, params) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const dataview = { target: createTarget(), ...params };

    const err = await Dataview(dataview);

    // The plugins for the chartjs and tabulator types are not loaded.
    expect(dataview.dataview).toBe(type);
    expect(err.message).toBe(`mapp.ui.utils.${type} doesnt exist`);
  });

  it('warns about columns outside a table configuration', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const columns = [{ field: 'a' }];

    const dataview = { target: createTarget(), columns };

    await Dataview(dataview);

    expect(warn).toHaveBeenCalledWith(
      'Table dataviews should be configured inside a tables object',
    );
    expect(dataview.table).toEqual({ columns });
    expect(dataview.dataview).toBe('tabulator');
  });

  it('doesn’t decorate a dataview with a create method again', async () => {
    const create = vi.fn();

    const dataview = { create, target: createTarget() };

    expect(await Dataview(dataview)).toBeUndefined();

    expect(create).not.toHaveBeenCalled();
    expect(dataview.show).toBeUndefined();
  });

  it('calls the create method of a dynamic dataview', async () => {
    const create = vi.fn();

    expect(
      await Dataview({ create, dynamic: true, target: createTarget() }),
    ).toBeUndefined();

    expect(create).toHaveBeenCalledTimes(1);
  });

  it('creates the dataview toolbar and assigns the mapChange callback', async () => {
    const toolbarButton = vi.fn(() => mapp.utils.html.node`<button>Fake`);

    fakeType({ toolbar: { fake: toolbarButton } });

    const target = createTarget();

    const layer = { changeEndCallbacks: [], mapview: {} };

    const dataview = await Dataview({
      dataview: 'fake',
      layer,
      mapChange: true,
      target,
      toolbar: { fake: true },
    });

    expect(toolbarButton).toHaveBeenCalledWith(dataview);
    expect(dataview.btnRow.textContent).toBe('Fake');
    expect(dataview.panel.parentElement).toBe(target);
    expect(layer.changeEndCallbacks).toHaveLength(1);
  });

  describe('chkbox', () => {
    it('creates a chkbox with the display flag for a label', async () => {
      fakeType();

      const dataview = await Dataview({
        dataview: 'fake',
        display: true,
        key: 'fake-key',
        label: 'Fake',
        target: createTarget(),
      });

      expect(dataview.chkbox.dataset.id).toBe('fake-key');
      expect(dataview.chkbox.textContent.trim()).toBe('Fake');
      expect(dataview.chkbox.querySelector('input').checked).toBe(true);
    });

    it('creates a disabled chkbox', async () => {
      fakeType();

      const dataview = await Dataview({
        dataview: 'fake',
        disabled: true,
        label: 'Fake',
        target: createTarget(),
      });

      expect(dataview.chkbox.querySelector('input').disabled).toBe(true);
    });

    it('shows and hides the dataview with the chkbox', async () => {
      const fake = fakeType();

      const dataview = await Dataview({
        dataview: 'fake',
        label: 'Fake',
        target: createTarget(),
      });

      document.body.append(dataview.chkbox);

      onTestFinished(() => dataview.chkbox.remove());

      const input = dataview.chkbox.querySelector('input');

      input.click();

      expect(dataview.display).toBe(true);
      expect(fake.create).toHaveBeenCalledWith(dataview);
      expect(dataview.target.style.display).toBe('block');

      input.click();

      expect(dataview.display).toBe(false);
      expect(dataview.target.style.display).toBe('none');
    });
  });

  describe('show and hide', () => {
    it('creates and updates the dataview when shown the first time', async () => {
      const fake = fakeType();

      const update = vi.fn();

      const dataview = await Dataview({
        dataview: 'fake',
        target: createTarget(),
        update,
      });

      await dataview.show();

      expect(dataview.display).toBe(true);
      expect(fake.create).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledTimes(1);
      expect(dataview.target.style.display).toBe('block');

      // A dataview which is not dynamic is created and updated only once.
      await dataview.show();

      expect(fake.create).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledTimes(1);
    });

    it('creates and updates a dynamic dataview when shown', async () => {
      const fake = fakeType();

      const update = vi.fn();

      const dataview = await Dataview({
        dataview: 'fake',
        dynamic: true,
        target: createTarget(),
        update,
      });

      await dataview.show();
      await dataview.show();

      expect(fake.create).toHaveBeenCalledTimes(2);
      expect(update).toHaveBeenCalledTimes(2);
    });

    it('updates a reload dataview when shown', async () => {
      const fake = fakeType();

      const update = vi.fn();

      const dataview = await Dataview({
        dataview: 'fake',
        reload: true,
        target: createTarget(),
        update,
      });

      await dataview.show();
      await dataview.show();

      expect(fake.create).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledTimes(2);
    });

    it('shows and hides the toolbar buttons with the dataview', async () => {
      fakeType({ toolbar: { fake: () => mapp.utils.html.node`<button>` } });

      const dataview = await Dataview({
        dataview: 'fake',
        target: createTarget(),
        toolbar: { fake: true },
      });

      expect(dataview.btnRow.style.display).toBe('none');

      await dataview.show();

      expect(dataview.btnRow.style.display).toBe('flex');

      dataview.hide();

      expect(dataview.display).toBe(false);
      expect(dataview.target.style.display).toBe('none');
      expect(dataview.btnRow.style.display).toBe('none');
    });
  });

  describe('update', () => {
    it('creates the dataview and returns without a query', async () => {
      const fake = fakeType();

      const xhr = vi.spyOn(mapp.utils, 'xhr');

      const dataview = await Dataview({
        dataview: 'fake',
        target: createTarget(),
      });

      await dataview.update();

      expect(fake.create).toHaveBeenCalledWith(dataview);
      expect(xhr).not.toHaveBeenCalled();
    });

    it('sets the query response as data', async () => {
      fakeType();

      const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue([{ a: 1 }]);

      const dataview = await Dataview({
        dataview: 'fake',
        query: 'fake_query',
        queryparams: { field: 'a' },
        target: createTarget(),
      });

      await dataview.update();

      expect(xhr).toHaveBeenCalledWith(
        `${mapp.host}/api/query?field=a&template=fake_query`,
      );
      expect(dataview.setData).toHaveBeenCalledWith([{ a: 1 }]);
    });

    it('requests the query from the dataview host or the layer mapview host', async () => {
      fakeType();

      const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue({});

      const dataview = await Dataview({
        dataview: 'fake',
        layer: { key: 'layer', mapview: { host: 'https://mapview.host' } },
        query: 'q',
        target: createTarget(),
      });

      await dataview.update();

      expect(dataview.host).toBe('https://mapview.host');
      expect(xhr.mock.calls[0][0]).toBe(
        'https://mapview.host/api/query?template=q&layer=layer',
      );

      dataview.host = 'https://dataview.host';

      await dataview.update();

      expect(xhr.mock.calls[1][0]).toMatch(/^https:\/\/dataview.host\/api/);
    });

    it('passes the response to the responseFunction instead of the setData method', async () => {
      fakeType();

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValue({ a: 1 });

      const responseFunction = vi.fn();

      const dataview = await Dataview({
        dataview: 'fake',
        query: 'q',
        responseFunction,
        target: createTarget(),
      });

      await dataview.update();

      expect(responseFunction).toHaveBeenCalledWith({ a: 1 });
      expect(dataview.setData).not.toHaveBeenCalled();
    });

    it('doesn’t set an error response as data', async () => {
      fakeType();

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValue(new Error('failed'));

      const dataview = await Dataview({
        dataview: 'fake',
        query: 'q',
        target: createTarget(),
      });

      await dataview.update();

      expect(dataview.setData).not.toHaveBeenCalled();
    });
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3120: the Dataview method is async without an await, so it returns a Promise. The callers in lib/layers/panels/dataviews.mjs and lib/locations/entries/dataview.mjs check the return value with `instanceof Error`, which is never true for a Promise. The callers continue with a dataview which has no show and hide methods, eg. the layer panel calls dataview.show() for a displayed dataview of an unknown type and throws.
  it.fails(
    'returns the error to the callers which check instanceof Error',
    () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const dataview = { dataview: 'unknown', target: createTarget() };

      expect(Dataview(dataview)).toBeInstanceOf(Error);
    },
  );

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3055: the show() and update() methods don't await the create method of the dataview type. The create method of the Json type awaits the jsoneditor import before it assigns the setData method. The update response is not set as data if the query responds before the jsoneditor is created.
  it.fails(
    'sets the update response after an async create method',
    async () => {
      const jsoneditor = { get: vi.fn(), set: vi.fn() };

      // The jsoneditor import takes longer than the query.
      vi.spyOn(mapp.ui.elements, 'jsoneditor').mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(jsoneditor))),
      );

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValue({ a: 1 });

      const dataview = await Dataview({
        dataview: 'Json',
        query: 'q',
        target: createTarget(),
      });

      await dataview.show();

      await vi.waitFor(() => expect(dataview.setData).toBeTypeOf('function'));

      expect(jsoneditor.set).toHaveBeenCalledWith({ json: { a: 1 } });
    },
  );
});
