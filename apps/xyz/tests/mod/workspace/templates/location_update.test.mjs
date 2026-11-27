import location_update, {
  jsonMergeKeys,
  updateValue,
} from '@geolytix/xyz-app/mod/workspace/templates/location_update.js';
import { describe, expect, it } from 'vitest';

const layer = {
  key: 'scratch',
  qID: 'id',
  geom: 'geom',
  srid: '4326',
};

function params(body) {
  return { table: 'example.scratch', layer, body };
}

/**
Removes the indentation of the rendered SQL.
*/
function sql(string) {
  return string.replace(/\s+/g, ' ').trim();
}

describe('location_update', () => {
  it('substitutes the values as body params', () => {
    const _ = params({ name: "O'Brien's", size: 4, valid: true, list: [1] });

    expect(sql(location_update(_))).toBe(
      'UPDATE example.scratch SET name = %{body_name},size = %{body_size},valid = %{body_valid},list = %{body_list} WHERE id = %{id} ${filter};',
    );

    // String values are not escaped. The substitution passes the value as query param.
    expect(_.body_name).toBe("O'Brien's");
    expect(_.body_size).toBe(4);
    expect(_.body_valid).toBe(true);
    expect(_.body_list).toEqual([1]);
  });

  it('sets a field to null', () => {
    expect(sql(location_update(params({ name: null })))).toBe(
      'UPDATE example.scratch SET name = null WHERE id = %{id} ${filter};',
    );
  });

  it('substitutes a geometry as GeoJSON body param', () => {
    const geometry = { type: 'Point', coordinates: [0, "1')); --"] };

    const _ = params({ geom: geometry });

    expect(sql(location_update(_))).toBe(
      'UPDATE example.scratch SET geom = ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON(%{body_geom})),4326) WHERE id = %{id} ${filter};',
    );

    expect(_.body_geom).toBe(JSON.stringify(geometry));
  });

  it('merges a jsonb object as body param', () => {
    const value = { jsonb: { props: { tag: `a"b'c` } } };

    const _ = params({ tag: value });

    expect(sql(location_update(_))).toBe(
      "UPDATE example.scratch SET props = coalesce(props::jsonb,'{}'::jsonb) || %{body_tag}::jsonb WHERE id = %{id} ${filter};",
    );

    expect(_.body_tag).toBe(JSON.stringify({ tag: `a"b'c` }));
  });

  it('substitutes a json object as stringified body param', () => {
    const _ = params({ meta: { colour: 'blue' } });

    expect(sql(location_update(_))).toContain('meta = %{body_meta}');
    expect(_.body_meta).toBe('{"colour":"blue"}');
  });

  it('does not overwrite the template params with body keys', () => {
    const _ = params({ table: 'other' });

    expect(sql(location_update(_))).toBe(
      'UPDATE example.scratch SET table = %{body_table} WHERE id = %{id} ${filter};',
    );
    expect(_.table).toBe('example.scratch');
  });

  it.each([
    ['a field with a space', { 'name = upper(name) --': 'x' }],
    ['a field with a quote', { "name'": 'x' }],
    ['a field starting with a number', { '1name': 'x' }],
    ['a jsonb field', { tag: { jsonb: { 'props = null --': { tag: 'x' } } } }],
    ['an empty jsonb object', { tag: { jsonb: {} } }],
  ])('throws for %s', (_, body) => {
    expect(() => location_update(params(body))).toThrow(
      'Layer scratch: Invalid field name in the location_update request body.',
    );
  });

  it.each([['id'], ['pk'], ['ID'], ['Id'], ['PK']])(
    'throws for the %s field',
    (key) => {
      const _ = { ...params({ [key]: 1 }), layer: { ...layer, qID: 'pk' } };

      expect(() => location_update(_)).toThrow(
        'Layer scratch: You cannot update the pk or ID field as it is a reserved parameter.',
      );
    },
  );
});

describe('updateValue', () => {
  it.each([
    [null, 'null'],
    [{ type: 'Point', coordinates: [0, 0] }, 'geometry'],
    // A value with coordinates is written as a geometry, also with a jsonb property.
    [{ coordinates: [0, 0], jsonb: { props: { label: 'a' } } }, 'geometry'],
    [{ jsonb: { props: { label: 'a' } } }, 'jsonb'],
    [{ colour: 'red' }, 'json'],
    [{ jsonb: 'not an object' }, 'json'],
    ['text', 'value'],
    [1, 'value'],
    [false, 'value'],
    [['a', 'b'], 'value'],
  ])('classifies %j as %s', (value, type) => {
    expect(updateValue(value)).toBe(type);
  });
});

describe('json fields edited through json_key entries', () => {
  const colour = {
    field: 'colour',
    json_field: 'meta',
    json_key: 'colour',
    edit: true,
  };

  const jsonLayer = (...infoj) => ({ ...layer, infoj });

  it('merges only the editable json keys', () => {
    // The mapp location update sends the whole object with the current values of the other keys.
    const _ = {
      ...params({ meta: { colour: 'red', owner: 'attacker' } }),
      layer: jsonLayer(colour, { field: 'meta', type: 'json' }),
    };

    expect(sql(location_update(_))).toBe(
      "UPDATE example.scratch SET meta = coalesce(meta::jsonb,'{}'::jsonb) || %{body_meta}::jsonb WHERE id = %{id} ${filter};",
    );

    expect(JSON.parse(_.body_meta)).toEqual({ colour: 'red' });
  });

  it('replaces a json field with an editable entry of its own', () => {
    const _ = {
      ...params({ meta: { colour: 'red', owner: 'b' } }),
      layer: jsonLayer(colour, { field: 'meta', type: 'json', edit: true }),
    };

    expect(sql(location_update(_))).toBe(
      'UPDATE example.scratch SET meta = %{body_meta} WHERE id = %{id} ${filter};',
    );

    expect(JSON.parse(_.body_meta)).toEqual({ colour: 'red', owner: 'b' });
  });

  it('returns the editable json keys by json field', () => {
    const size = { ...colour, field: 'size', json_key: 'size' };
    const readonly = {
      ...colour,
      field: 'owner',
      json_key: 'owner',
      edit: false,
    };

    expect(jsonMergeKeys(jsonLayer(colour, size, readonly))).toEqual(
      new Map([['meta', new Set(['colour', 'size'])]]),
    );

    expect(jsonMergeKeys({ key: 'no infoj' })).toEqual(new Map());
  });
});
