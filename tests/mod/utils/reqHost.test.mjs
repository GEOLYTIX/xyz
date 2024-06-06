import { describe, it, assertEqual } from 'codi-test-framework';
import req from '../../../mod/utils/reqHost';

describe('reqHost', () => {

    it('should return http:// for localhost', () => {
        const reqObj = {
            headers: {
                host: 'localhost:3000'
            }
        };
        
        const expected = 'http://localhost:3000undefined';

        assertEqual(req(reqObj), expected);

    });

    it('should return https:// for non-localhost', () => {

    const reqObj = {
        headers: {
            host: 'geolytix.xyz'
        }
    };
    
    const expected = 'https://geolytix.xyzundefined';

    assertEqual(req(reqObj), expected);
    });
});