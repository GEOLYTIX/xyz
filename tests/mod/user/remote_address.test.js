const extractRemoteAddress = require('./remote_address');

describe('extractRemoteAddress', () => {
  
  it('should return the x-forwarded-for header if it is valid', () => {
    const mockReq = {
      headers: {
        'x-forwarded-for': '192.168.0.1, 172.16.0.1'
      }
    };

    const result = extractRemoteAddress(mockReq);

    expect(result).toEqual('192.168.0.1, 172.16.0.1');
  });

  it('should return "invalid" if the x-forwarded-for header is invalid', () => {
    const mockReq = {
      headers: {
        'x-forwarded-for': 'invalid#header'
      }
    };

    const result = extractRemoteAddress(mockReq);

    expect(result).toEqual('invalid');
  });

  it('should return "invalid" if the x-forwarded-for header is not present', () => {
    const mockReq = {
      headers: {}
    };

    const result = extractRemoteAddress(mockReq);

    expect(result).toEqual('invalid');
  });
});