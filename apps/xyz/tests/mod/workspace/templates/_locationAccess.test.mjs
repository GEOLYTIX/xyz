import {
  authorizeDelete,
  authorizeInsert,
  authorizeNew,
  authorizeUpdate,
  editFields,
} from '@geolytix/xyz-app/mod/workspace/templates/_locationAccess.js';
import { describe, expect, it } from 'vitest';

const layer = {
  key: 'areas',
  table: 'example.areas',
  tables: { 8: 'example.areas_8', 12: null },
  geom: 'geom',
  infoj: [
    { field: 'name', edit: true },
    { field: 'area', fieldfx: 'ST_Area(geom)' },
    { field: 'geom', type: 'geometry', draw: { polygon: true } },
    { field: 'label', draw: { polygon: true } },
    { field: 'nearby', query: 'nearby', edit: true },
  ],
};

function params(template, body, override = {}) {
  return { template, table: 'example.areas', layer, body, ...override };
}

describe('_locationAccess', () => {
  it('returns the fields of edit entries', () => {
    // An entry with a query is not a table field. A geometry entry with draw requires edit, as in the mapp geometry entry.
    expect(editFields(layer)).toEqual(new Set(['name']));
  });

  it('returns the json_field but not the alias field of json and jsonb entries', () => {
    const infoj = [
      { field: 'tag', jsonb_field: 'props', jsonb_key: 'tag', edit: true },
      { field: 'colour', json_field: 'meta', json_key: 'colour', edit: true },
    ];

    expect(editFields({ infoj })).toEqual(new Set(['meta']));
  });

  it('returns no edit fields for a layer without infoj', () => {
    expect(editFields({ key: 'empty' })).toEqual(new Set());
  });

  it('permits an update of a layer.tables table', () => {
    expect(
      authorizeUpdate(
        params('location_update', { name: 'a' }, { table: 'example.areas_8' }),
      ),
    ).toBeUndefined();
  });

  it.each([
    ['a table which is not a layer table', { table: 'example.other' }],
    ['a missing table param', { table: undefined }],
  ])('denies an update for %s', (_, override) => {
    expect(
      authorizeUpdate(params('location_update', { name: 'a' }, override)),
    ).toBeInstanceOf(Error);
  });

  it('denies a body which is not an object', () => {
    expect(
      authorizeUpdate(params('location_update', '{"name":"a"}')),
    ).toBeInstanceOf(Error);
  });

  describe('a jsonb entry whose field is a table column', () => {
    // The field of a jsonb entry is an alias. Here the alias is the geom column, which is not editable.
    const jsonbLayer = {
      key: 'jsonb_alias',
      table: 'example.areas',
      infoj: [
        { field: 'geom', jsonb_field: 'props', jsonb_key: 'label', edit: true },
      ],
    };

    const update = (body) =>
      authorizeUpdate(params('location_update', body, { layer: jsonbLayer }));

    it('permits a jsonb value', () => {
      expect(
        update({ geom: { jsonb: { props: { label: 'a' } } } }),
      ).toBeUndefined();
    });

    it('denies a jsonb value with coordinates, which the template writes as a geometry', () => {
      const denied = update({
        geom: {
          type: 'Point',
          coordinates: [0, 0],
          jsonb: { props: { label: 'a' } },
        },
      });

      expect(denied).toBeInstanceOf(Error);
      expect(denied.message).toMatch('field(s) not editable: geom');
    });
  });

  describe('a json field edited through json_key entries', () => {
    const colour = {
      field: 'colour',
      json_field: 'meta',
      json_key: 'colour',
      edit: true,
    };

    const update = (body, ...infoj) =>
      authorizeUpdate(
        params('location_update', body, {
          layer: { ...layer, infoj: [colour, ...infoj] },
        }),
      );

    it('permits an object, of which the template merges only the editable keys', () => {
      expect(
        update({ meta: { colour: 'red', owner: 'other' } }),
      ).toBeUndefined();
    });

    it.each([
      ['null', null],
      ['a string', '{"owner":"attacker"}'],
      ['a geometry', { type: 'Point', coordinates: [0, 0] }],
    ])('denies %s, which would replace the json field', (_, meta) => {
      expect(update({ meta })).toBeInstanceOf(Error);
    });

    it('permits null for a json field with an editable entry of its own', () => {
      expect(
        update({ meta: null }, { field: 'meta', type: 'json', edit: true }),
      ).toBeUndefined();
    });
  });

  it('permits the configured values of nested draw defaults and any default_fields value', () => {
    const draw = {
      defaults: { source: 'drawn' },
      polygon: {
        defaults: { kind: 'polygon' },
        default_fields: { radius: 'radius' },
      },
    };

    expect(
      authorizeNew(
        params(
          'location_new',
          { geom: {}, name: 'a', source: 'drawn', kind: 'polygon', radius: 1 },
          { layer: { ...layer, draw } },
        ),
      ),
    ).toBeUndefined();

    expect(
      authorizeNew(
        params('location_new', { area: 1 }, { layer: { ...layer, draw } }),
      ),
    ).toBeInstanceOf(Error);

    // The value of a defaults key is fixed by the draw config.
    expect(
      authorizeNew(
        params(
          'location_new',
          { source: 'other' },
          { layer: { ...layer, draw } },
        ),
      ),
    ).toBeInstanceOf(Error);
  });

  it('permits a delete with the legacy edit.delete flag', () => {
    expect(
      authorizeDelete(
        params('location_delete', null, {
          layer: { ...layer, edit: { delete: true } },
        }),
      ),
    ).toBeUndefined();
  });

  it('denies a delete without deleteLocation, or of another table', () => {
    expect(authorizeDelete(params('location_delete'))).toBeInstanceOf(Error);

    const deletable = { ...layer, deleteLocation: true };

    expect(
      authorizeDelete(params('location_delete', null, { layer: deletable })),
    ).toBeUndefined();

    expect(
      authorizeDelete(
        params('location_delete', null, {
          layer: deletable,
          table: 'example.other',
        }),
      ),
    ).toBeInstanceOf(Error);
  });

  describe('authorizeInsert', () => {
    const insertLayer = {
      key: 'uploads',
      csv_upload: {
        queryparams: { table: 'example.uploads' },
        fields: { name: 'text', size: 'int' },
      },
      infoj: [
        {
          type: 'dataview',
          toolbar: { sqlinsert: { table: 'example.json_insert' } },
        },
      ],
    };

    function insert(table, body) {
      return authorizeInsert({
        template: 'sql_table_insert',
        layer: insertLayer,
        table,
        body,
      });
    }

    it('permits the fields of a csv_upload config', () => {
      expect(
        insert('example.uploads', { 'name::text': ['a'], 'size::int': [1] }),
      ).toBeUndefined();
    });

    it('denies a field which is not in the csv_upload fields', () => {
      expect(
        insert('example.uploads', { 'owner::text': ['a'] }),
      ).toBeInstanceOf(Error);
    });

    it('permits any field for a sqlinsert config without fields', () => {
      expect(
        insert('example.json_insert', { 'owner::text': ['a'] }),
      ).toBeUndefined();
    });

    it('denies a table without an insert config', () => {
      expect(insert('example.other', { 'name::text': ['a'] })).toBeInstanceOf(
        Error,
      );
    });
  });
});
