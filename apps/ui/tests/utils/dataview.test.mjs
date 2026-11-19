import { describe, expect, it, onTestFinished, vi } from 'vitest';

const { dataview: dataviewUtils } = mapp.ui.utils;

/**
@function createTarget

@description
Appends a target element to the document. The element is removed when the test finishes.

@param {string} [id] The element id.
@returns {HTMLElement} The target element.
*/
function createTarget(id) {
  const target = document.createElement('div');

  if (id) target.id = id;

  target.style.cssText = 'position:relative;width:600px;height:400px;';

  document.body.append(target);

  onTestFinished(() => target.remove());

  return target;
}

/**
@function fakeType

@description
Assigns a fake dataview type with toolbar methods as `mapp.ui.utils.fake`. The type is deleted when the test finishes.

@param {Object} toolbar The toolbar methods of the type.
*/
function fakeType(toolbar) {
  mapp.ui.utils.fake = { create: vi.fn(), toolbar };

  onTestFinished(() => delete mapp.ui.utils.fake);
}

/**
@function mapChangeDataview

@description
Returns a dataview with a layer and assigns the mapChange callback.

@param {Object} [params] Properties to assign to the dataview.
@returns {Object} The dataview and the changeEnd method which calls the layer changeEndCallbacks.
*/
function mapChangeDataview(params) {
  const layer = { changeEndCallbacks: [], display: true, mapview: {} };

  const dataview = {
    display: true,
    layer,
    mapChange: true,
    update: vi.fn(),
    ...params,
  };

  dataviewUtils.mapChange(dataview);

  const changeEnd = () => layer.changeEndCallbacks.forEach((fn) => fn());

  return { changeEnd, dataview, layer };
}

describe('ui/utils/dataview', () => {
  describe('Toolbar', () => {
    it('returns without a toolbar', () => {
      const target = createTarget();

      const dataview = { target };

      dataviewUtils.Toolbar(dataview);

      expect(dataview.btnRow).toBeUndefined();
      expect(dataview.target).toBe(target);
    });

    it('creates the toolbar with the methods of the dataview type before the generic methods', () => {
      const viewport = vi.fn(() => mapp.utils.html.node`<button>Type`);

      fakeType({ viewport });

      const target = createTarget();

      const dataview = {
        dataview: 'fake',
        target,
        toolbar: { viewport: true, unknown: true },
      };

      dataviewUtils.Toolbar(dataview);

      expect(viewport).toHaveBeenCalledWith(dataview);

      // The unknown toolbar key is ignored.
      expect(dataview.btnRow.textContent).toBe('Type');
      expect(dataview.btnRow.style.display).toBe('none');

      expect(dataview.panel.parentElement).toBe(target);
      expect(dataview.panel.className).toBe('flex-col');
      expect(dataview.panel.firstElementChild).toBe(dataview.btnRow);

      // The dataview is rendered in a new target element after the toolbar.
      expect(dataview.target.className).toBe('dataview-target');
      expect(dataview.target.previousElementSibling).toBe(dataview.btnRow);
    });

    it('creates the generic toolbar buttons', () => {
      fakeType({});

      const dataview = {
        dataview: 'fake',
        target: createTarget(),
        toolbar: { viewport: true },
      };

      dataviewUtils.Toolbar(dataview);

      expect(dataview.btnRow.querySelector('button').textContent).toBe(
        mapp.dictionary.tabulator_viewport,
      );
    });

    it('calls a toolbar method', () => {
      const toolbar = vi.fn();

      const dataview = { dataview: 'fake', target: createTarget(), toolbar };

      fakeType({});

      dataviewUtils.Toolbar(dataview);

      expect(toolbar).toHaveBeenCalledTimes(1);
      expect(dataview.btnRow.children).toHaveLength(0);
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3121: the Toolbar method calls Object.hasOwn() with the toolbar of the dataview type, which throws a TypeError for a type without toolbar, eg. the histogram type. A histogram dataview with a viewport toolbar can't be created.
    it.fails(
      'creates the generic toolbar buttons for a type without toolbar',
      () => {
        const dataview = {
          dataview: 'histogram',
          target: createTarget(),
          toolbar: { viewport: true },
        };

        dataviewUtils.Toolbar(dataview);

        expect(dataview.btnRow.children).toHaveLength(1);
      },
    );
  });

  describe('viewport', () => {
    it('toggles the viewport flag and updates the dataview', () => {
      const dataview = { update: vi.fn(), viewport: true };

      // The viewport method returns a template, which is rendered into an element.
      const node = document.createElement('div');

      mapp.utils.render(node, dataviewUtils.toolbar.viewport(dataview));

      const button = node.querySelector('button');

      expect(button.textContent).toBe(mapp.dictionary.tabulator_viewport);

      expect(button.classList).toContain('active');

      button.click();

      expect(dataview.viewport).toBe(false);
      expect(button.classList).not.toContain('active');
      expect(dataview.update).toHaveBeenCalledTimes(1);

      button.click();

      expect(dataview.viewport).toBe(true);
      expect(dataview.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('mapChange', () => {
    it('doesn’t assign a callback without the mapChange flag or a layer mapview', () => {
      const layer = { changeEndCallbacks: [] };

      dataviewUtils.mapChange({ layer });

      dataviewUtils.mapChange({ layer, mapChange: true });

      expect(layer.changeEndCallbacks).toHaveLength(0);
    });

    it('updates a displayed dataview of a displayed layer', () => {
      const { changeEnd, dataview, layer } = mapChangeDataview();

      changeEnd();

      expect(dataview.update).toHaveBeenCalledTimes(1);

      layer.display = false;

      changeEnd();

      dataview.display = false;
      layer.display = true;

      changeEnd();

      expect(dataview.update).toHaveBeenCalledTimes(1);
    });

    it('updates a dataview tab only if the tab is active', () => {
      const tab = document.createElement('div');

      const { changeEnd, dataview } = mapChangeDataview({ tab });

      changeEnd();

      expect(dataview.update).not.toHaveBeenCalled();

      tab.classList.add('active');

      changeEnd();

      expect(dataview.update).toHaveBeenCalledTimes(1);
    });

    it('calls a mapChange method instead of the update', () => {
      const mapChange = vi.fn();

      const { changeEnd, dataview } = mapChangeDataview({ mapChange });

      changeEnd();

      expect(mapChange).toHaveBeenCalledTimes(1);
      expect(dataview.update).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    /**
    Creates a dataview with the update toolbar button in a #Map element, and stubs the jsoneditor. The menu items of the jsoneditor are returned from the onRenderMenu method of the jsoneditor props.
    */
    function updateDataview() {
      const map = createTarget('Map');

      const editor = { get: vi.fn(), set: vi.fn() };

      const jsoneditor = vi
        .spyOn(mapp.ui.elements, 'jsoneditor')
        .mockResolvedValue(editor);

      const dataview = {
        data: [{ a: 1 }],
        query: 'q',
        queryparams: { field: 'a' },
        setData: vi.fn(),
        toolbar: { update: {} },
        update: vi.fn(),
      };

      const button = dataviewUtils.toolbar.update(dataview);

      map.append(button);

      return { button, dataview, editor, jsoneditor, map };
    }

    it('opens and closes the update dialog with the toolbar button', async () => {
      const { button, dataview, jsoneditor, map } = updateDataview();

      expect(dataview.toolbar.update.button).toBe(button);

      button.click();

      expect(button.classList).toContain('active');

      await vi.waitFor(() =>
        expect(map.querySelector('dialog')).not.toBeNull(),
      );

      const { props } = jsoneditor.mock.calls[0][0];

      expect(JSON.parse(props.content.text)).toEqual({
        data: [{ a: 1 }],
        query: 'q',
        queryparams: { field: 'a' },
      });
      expect(props.mode).toBe('text');

      expect(dataview.toolbar.update.dialog.target).toBe(map);
      expect(map.querySelector('dialog header').textContent.trim()).toBe(
        'Dataview Update',
      );

      button.click();

      expect(button.classList).not.toContain('active');
      expect(map.querySelector('dialog')).toBeNull();
    });

    it('removes the active class of the button when the dialog is closed', async () => {
      const { button, map } = updateDataview();

      button.click();

      await vi.waitFor(() =>
        expect(map.querySelector('dialog')).not.toBeNull(),
      );

      map.querySelector('dialog [data-id=close]').click();

      expect(button.classList).not.toContain('active');
      expect(map.querySelector('dialog')).toBeNull();
    });

    it('renders the update and set data buttons in the jsoneditor menu', async () => {
      const { button, dataview, editor, jsoneditor, map } = updateDataview();

      button.click();

      await vi.waitFor(() =>
        expect(map.querySelector('dialog')).not.toBeNull(),
      );

      const { onRenderMenu } = jsoneditor.mock.calls[0][0].props;

      const items = onRenderMenu([
        { type: 'button', text: 'table' },
        { type: 'button', text: 'tree' },
        { type: 'separator' },
        { type: 'button', className: 'jse-undo' },
        { type: 'button', className: 'jse-redo' },
        { type: 'button', className: 'jse-search' },
        { type: 'button', className: 'jse-contextmenu' },
        { type: 'button', className: 'jse-sort' },
        { type: 'button', className: 'jse-transform' },
        { type: 'button', text: 'text' },
      ]);

      expect(items.map((item) => item.text)).toEqual([
        'text',
        'sync',
        'data_object',
      ]);

      editor.get.mockReturnValue({
        text: JSON.stringify({ data: [{ b: 2 }], query: 'q2' }),
      });

      // The sync button assigns the json to the dataview and updates the dataview.
      items[1].onClick();

      expect(dataview.query).toBe('q2');
      expect(dataview.update).toHaveBeenCalledTimes(1);

      // The data_object button sets the data of the json.
      items[2].onClick();

      expect(dataview.setData).toHaveBeenCalledWith([{ b: 2 }]);

      button.click();
    });
  });
});
