import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  resolveTenantId,
  setTenantResolver,
} from '../../../mod/utils/tenant.js';

describe('tenant Module', () => {
  afterEach(() => {
    setTenantResolver();
    vi.restoreAllMocks();
  });

  it('returns undefined without a registered resolver', async () => {
    expect(await resolveTenantId({})).toBeUndefined();
  });

  it('returns the integer tenant id from the resolver', async () => {
    const req = {};
    const resolver = vi.fn().mockResolvedValue(7);
    setTenantResolver(resolver);

    expect(await resolveTenantId(req)).toBe(7);
    expect(resolver).toHaveBeenCalledWith(req);
  });

  it('returns undefined for a tenant id which is not an integer', async () => {
    setTenantResolver(async () => '7');

    expect(await resolveTenantId({})).toBeUndefined();
  });

  it('returns undefined when the resolver errs', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    setTenantResolver(async () => {
      throw new Error('lookup failed');
    });

    expect(await resolveTenantId({})).toBeUndefined();
  });
});
