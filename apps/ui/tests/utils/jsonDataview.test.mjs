import { describe, expect, it, onTestFinished, vi } from 'vitest';

const { Json } = mapp.ui.utils;

/**
@function stubJsoneditor

@description
Stubs the jsoneditor element, which imports the vanilla-jsoneditor module from esm.sh.

@returns {Object} The jsoneditor element spy and the editor with get and set mocks.
*/
function stubJsoneditor() {
  const editor = { get: vi.fn(), set: vi.fn() };

  const jsoneditor = vi
    .spyOn(mapp.ui.elements, 'jsoneditor')
    .mockResolvedValue(editor);

  return { editor, jsoneditor };
}

/**
@function uploadFile

@description
Assigns a csv file to the csvupload input element and dispatches the change event.

@param {HTMLInputElement} input The csvupload input element.
@returns {File} The csv file.
*/
function uploadFile(input) {
  const file = new File(['a,b\n1,2'], 'upload.csv', { type: 'text/csv' });

  const dataTransfer = new DataTransfer();

  dataTransfer.items.add(file);

  input.files = dataTransfer.files;

  input.dispatchEvent(new Event('change'));

  return file;
}

describe('ui/utils/jsonDataview', () => {
  describe('create', () => {
    it('creates a read only jsoneditor and sets the dataview data', async () => {
      const { editor, jsoneditor } = stubJsoneditor();

      const dataview = { data: { a: 1 } };

      await Json.create(dataview);

      expect(jsoneditor).toHaveBeenCalledWith(dataview);
      expect(dataview.props).toEqual({
        mainMenuBar: false,
        mode: 'text',
        readOnly: true,
      });
      expect(dataview.jsoneditor).toBe(editor);
      expect(editor.set).toHaveBeenCalledWith({ json: { a: 1 } });

      dataview.setData({ b: 2 });

      expect(dataview.data).toEqual({ b: 2 });
      expect(editor.set).toHaveBeenLastCalledWith({ json: { b: 2 } });
    });

    it('keeps the props of the dataview and doesn’t set data without data', async () => {
      const { editor } = stubJsoneditor();

      const props = { mode: 'tree' };

      const dataview = { props };

      await Json.create(dataview);

      expect(dataview.props).toBe(props);
      expect(dataview.setData).toBeTypeOf('function');
      expect(editor.set).not.toHaveBeenCalled();
    });

    it('doesn’t assign the setData method if the jsoneditor import fails', async () => {
      vi.spyOn(mapp.ui.elements, 'jsoneditor').mockResolvedValue(
        new Error('offline'),
      );

      const dataview = { data: { a: 1 } };

      await Json.create(dataview);

      expect(dataview.jsoneditor).toBeInstanceOf(Error);
      expect(dataview.setData).toBeUndefined();
    });
  });

  describe('toolbar', () => {
    it('downloads the data as json file', () => {
      const textFile = vi.spyOn(mapp.utils, 'textFile').mockReturnValue();

      const dataview = { data: { a: 1 }, label: 'Label' };

      Json.toolbar.jsonfile(dataview).click();

      expect(dataview.title).toBe('Label');
      expect(textFile).toHaveBeenCalledWith({
        filename: 'Label.json',
        text: JSON.stringify({ a: 1 }, null, 2),
        type: 'application/json',
      });
    });

    it('names the json file Unknown without title or label', () => {
      const textFile = vi.spyOn(mapp.utils, 'textFile').mockReturnValue();

      Json.toolbar.jsonfile({ data: [] }).click();

      expect(textFile.mock.calls[0][0].filename).toBe('Unknown.json');
    });

    it('copies the data to the clipboard', () => {
      const copy = vi.spyOn(mapp.utils, 'copyToClipboard').mockReturnValue();

      const button = Json.toolbar.copyToClipboard({ data: { a: 1 } });

      expect(button.textContent).toBe('Copy to Clipboard');

      button.click();

      expect(copy).toHaveBeenCalledWith(JSON.stringify({ a: 1 }, null, 2));
    });

    it('creates the toolbar buttons of a Json dataview', async () => {
      stubJsoneditor();

      const target = document.createElement('div');

      document.body.append(target);

      onTestFinished(() => target.remove());

      const dataview = await mapp.ui.Dataview({
        dataview: 'Json',
        target,
        toolbar: { copyToClipboard: true, jsonfile: true },
      });

      expect(
        [...dataview.btnRow.children].map((button) => button.textContent),
      ).toEqual(['Copy to Clipboard', 'Download']);
    });
  });

  describe('csvupload', () => {
    /**
    Creates the csvupload input element for a dataview with a setData mock.
    */
    function csvupload(response) {
      const csvUpload = vi
        .spyOn(mapp.utils, 'csvUpload')
        .mockResolvedValue(response);

      const alert = vi.spyOn(mapp.ui.elements, 'alert').mockReturnValue();

      const dataview = {
        setData: vi.fn(),
        toolbar: { csvupload: { template: 'insert' } },
      };

      const input = Json.toolbar.csvupload(dataview);

      return { alert, csvUpload, dataview, input };
    }

    it('uploads the csv file and sets the response as data', async () => {
      const { csvUpload, dataview, input } = csvupload([{ rows: 1 }]);

      expect(dataview.toolbar.csvupload.label).toBe('CSV Upload');
      expect(input.accept).toBe('.csv');

      const file = uploadFile(input);

      await vi.waitFor(() =>
        expect(dataview.setData).toHaveBeenCalledWith([{ rows: 1 }]),
      );

      expect(dataview.toolbar.csvupload.file).toBe(file);
      expect(csvUpload).toHaveBeenCalledWith(file, dataview.toolbar.csvupload);
    });

    it('doesn’t upload without a file', () => {
      const { csvUpload, input } = csvupload([]);

      input.dispatchEvent(new Event('change'));

      expect(csvUpload).not.toHaveBeenCalled();
    });

    it.each([
      ['an error', new Error('missing param')],
      ['an array with an error', [{ rows: 1 }, new Error('missing param')]],
    ])('alerts the error messages for %s', async (_, response) => {
      const { alert, dataview, input } = csvupload(response);

      uploadFile(input);

      await vi.waitFor(() => expect(alert).toHaveBeenCalled());

      expect(alert).toHaveBeenCalledWith({
        title: 'CSV Upload',
        text: 'Upload of CSV records has failed:\n\nmissing param',
      });
      expect(dataview.setData).not.toHaveBeenCalled();
    });
  });

  describe('sqlinsert', () => {
    /**
    Creates the sqlinsert button for a dataview with a jsoneditor mock.
    */
    function sqlinsert(params) {
      const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue({});

      const dataview = {
        jsoneditor: { get: vi.fn(() => ({ text: '[{"a":1}]' })) },
        toolbar: {
          sqlinsert: { table: 'sql_insert', template: 'sql_table_insert' },
        },
        ...params,
      };

      const button = Json.toolbar.sqlinsert(dataview);

      return { button, dataview, xhr };
    }

    it('makes the jsoneditor writable and posts the text to the query', () => {
      const { button, dataview, xhr } = sqlinsert();

      expect(dataview.props).toEqual({ mainMenuBar: false, mode: 'text' });

      button.click();

      expect(xhr).toHaveBeenCalledWith({
        body: '[{"a":1}]',
        method: 'POST',
        url: `${mapp.host}/api/query?table=sql_insert&template=sql_table_insert`,
      });
    });

    it('doesn’t post an empty jsoneditor', () => {
      const { button, dataview, xhr } = sqlinsert();

      dataview.jsoneditor.get.mockReturnValue({ text: '' });

      button.click();

      expect(xhr).not.toHaveBeenCalled();
    });

    it('doesn’t post without a jsoneditor', () => {
      const { button, xhr } = sqlinsert({ jsoneditor: new Error('offline') });

      button.click();

      expect(xhr).not.toHaveBeenCalled();
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3125: the sqlinsert button posts to the query of the mapp.host. The update method of a dataview requests the query from the dataview.host or the host of the layer mapview. A Json dataview with a host posts the insert to another host than its query.
    it.fails('posts the text to the dataview host', () => {
      const { button, xhr } = sqlinsert({ host: 'https://dataview.host' });

      button.click();

      expect(xhr.mock.calls[0][0].url).toMatch(/^https:\/\/dataview.host\//);
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3125: the sqlinsert toolbar method replaces the dataview.props object to make the jsoneditor writable. The props of the dataview configuration, eg. an onRenderMenu method, are lost.
    it.fails('keeps the props of the dataview', () => {
      const onRenderMenu = vi.fn();

      const { dataview } = sqlinsert({
        props: { onRenderMenu, readOnly: true },
      });

      expect(dataview.props.onRenderMenu).toBe(onRenderMenu);
      expect(dataview.props.readOnly).toBeFalsy();
    });
  });
});
