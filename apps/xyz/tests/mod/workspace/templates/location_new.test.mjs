import location_new from '@geolytix/xyz-app/mod/workspace/templates/location_new.js';
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

describe('location_new', () => {
  it('substitutes the values as body params', () => {
    const geometry = { type: 'Point', coordinates: [0, 51] };

    const _ = params({ name: "O'Brien's", geom: geometry });

    expect(sql(location_new(_))).toBe(
      'INSERT INTO example.scratch (name,geom) SELECT %{body_name},ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON(%{body_geom})), 4326) RETURNING id::varchar AS id;',
    );

    expect(_.body_name).toBe("O'Brien's");
    expect(_.body_geom).toBe(JSON.stringify(geometry));
  });

  it('does not overwrite the template params with body keys', () => {
    const _ = params({ table: 'other' });

    location_new(_);

    expect(_.table).toBe('example.scratch');
  });

  it('throws for an invalid field name', () => {
    expect(() => location_new(params({ 'name) VALUES (1); --': 'x' }))).toThrow(
      'Layer scratch: Invalid field name in the location_new request body.',
    );
  });

  it.each([['id'], ['ID'], ['Id']])('throws for the %s field', (key) => {
    expect(() => location_new(params({ [key]: 1 }))).toThrow(
      'Layer scratch: You cannot update the id or ID field as it is a reserved parameter.',
    );
  });
});
