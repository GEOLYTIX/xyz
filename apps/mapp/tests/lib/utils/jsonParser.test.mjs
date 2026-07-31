/**
## /tests/lib/utils/jsonParser

@module /tests/lib/utils/jsonParser
*/

import { beforeAll, describe, expect, it } from 'vitest';
// The user locale fixtures are the contract between the server and the client,
// so the definition is read from the xyz test assets rather than copied into
// this package.
import jsonParserAsset from '../../../../xyz/tests/assets/userLocale/jsonParser.json';

describe('utils/jsonParser', () => {
  let jsonObject;

  beforeAll(() => {
    jsonObject = mapp.utils.jsonParser(jsonParserAsset);
  });

  it('parses plugins as an array', () => {
    expect(Array.isArray(jsonObject.locale.plugins)).toBe(true);
    expect(jsonObject.locale.plugins).toHaveLength(3);
  });

  it('preserves false, true and null values', () => {
    expect(jsonObject.locale.falseKey).toBe(false);
    expect(jsonObject.locale.trueKey).toBe(true);
    expect(jsonObject.locale.nullKey).toBeNull();
  });

  it('preserves nested arrays', () => {
    const { lordArrArr } = jsonObject.locale;

    expect(Array.isArray(lordArrArr)).toBe(true);
    expect(Array.isArray(lordArrArr[0][1])).toBe(true);
  });

  it('round trips the asset without altering it', () => {
    expect(JSON.stringify(jsonObject)).toEqual(JSON.stringify(jsonParserAsset));
  });
});
