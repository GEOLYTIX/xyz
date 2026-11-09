import layer_extent from '@geolytix/xyz-app/mod/workspace/templates/layer_extent.js';
import { describe, expect, it } from 'vitest';

function params(body) {
  return {
    body,
    geom: 'geom',
    srid: 4326,
    proj: 3857,
    table: 'public.features',
  };
}

/**
Removes the indentation of the rendered SQL.
*/
function sql(string) {
  return string.replace(/\s+/g, ' ').trim();
}

describe('layer_extent', () => {
  it('substitutes the ids as a query param, not into the SQL', () => {
    const _ = params({ ids: ['123', '456', '789'] });

    const result = sql(layer_extent(_));

    expect(result).toContain('WHERE ${qID}::varchar = ANY(%{body_ids})');

    // The id values are not written into the SQL string.
    expect(result).not.toContain('123');
    expect(_.body_ids).toEqual(['123', '456', '789']);
  });

  it('passes id values with SQL characters as param values', () => {
    // These ids previously had to be filtered because they were written into the SQL string. They are now safe as param values, so they are passed through.
    const ids = ["x','y", "'; DELETE FROM features; --", '1,2'];

    const _ = params({ ids });

    const result = sql(layer_extent(_));

    // The condition has no id value, only the bound param.
    expect(result).toContain(
      'WHERE ${qID}::varchar = ANY(%{body_ids}) ${filter}',
    );
    expect(result).not.toContain('DELETE');

    // The values are passed to node-postgres as param values and compared as data.
    expect(_.body_ids).toEqual(ids);
  });

  it('coerces id values to strings', () => {
    const _ = params({ ids: [123, 456] });

    layer_extent(_);

    expect(_.body_ids).toEqual(['123', '456']);
  });

  it('queries all geometries without an ids array', () => {
    const _ = params(undefined);

    const result = sql(layer_extent(_));

    expect(result).toContain('WHERE true ${filter}');
    expect(_.body_ids).toBeUndefined();
  });

  it('matches no geometry for an empty ids array', () => {
    const _ = params({ ids: [] });

    const result = sql(layer_extent(_));

    expect(result).toContain('WHERE ${qID}::varchar = ANY(%{body_ids})');
    expect(_.body_ids).toEqual([]);
  });
});
