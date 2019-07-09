import {
    spy,
    stub,
} from 'sinon';
import * as storage from '~utils/storage';
import AuthService from '..';
import fixtures from '~utils/keyvault/keystore.json';

jest.mock('~utils/storage');

const encryptedKeyStore = {
    encSeed: {
        encStr: 'shOAQEt32dkSh36RfFIjZc5FF6/vGoLDZ1dLF9DrhRhqfnRuaglhEwgY7FGyDB2w851Q5+zRRz6rbi3chu85e+5nTtIXypmsy+EmzubvR5JBeJGwjLKn3klUrepjE5UpwnHmyKIf/Oi88Op7kd51CvWV1sIE/BoyXjUdj/hq0HprEM118pwcUw==',
        nonce: 'sCdtnErzAqu+pDKBfXjsgVdwMimOkbiP',
    },
    encHdRootPriv: {
        encStr: 'frX+nForl8AIAohTDK0aNuM7CYHk8Ykm3xFyqhPdyr5uUiuc3dKC8vsAG6hWCWQj3y6URpjYB4LdKiuN/BCXaCw0CcR2l1Dsf7Gxi5O8FFbZv21zNJ2S9BmU8amQMA21M52gaWDf/Bdp6zUa60HsOTEV7ZP5WMAm/NXzyIaLjQ==',
        nonce: 'p+tHVMGQReDwvwcaErNirehT5mJsdNqi',
    },
    hdPathString: "m/0'/0'/0'",
    salt: 'strangeSalt',
    hdIndex: 1,
    privacyKeys: {
        publicKey: 'z7kvlspK+/9b/7+zzJwIJ3qjd76LFBZVDWmUxlD6QU0=',
        encPrivKey: {
            encStr: '/Vt6N1Z0w1iMId+eKkTjycdJDKC8x8pk/cZBVjw4thYJJe37AYoPRiHqaJvKMldeixS8NHhFlfcJ20Lxz1LbsRICW61q436o4INbZnQuuVE=',
            nonce: 'KdbKscduwHL9y1vJRi1ncLt4cBZ/S8Se',
        },
    },
};

describe.only('Auth Service Tests', () => {
    let set;
    let get;
    beforeEach(() => {
        set = spy(storage, 'set');
        get = spy(storage, 'get');
        set({ keyStore: encryptedKeyStore });
    });

    afterEach(() => {
        set.restore();
        get.restore();
        storage.reset();
    });


    it('Should create a session if the supplied password can decrypt the stored keystore', async () => {
        const fixture = fixtures.valid[0];
        const session = await AuthService.login('password');
        expect(session).toBeDefined();
    });

    it('should add the domain to the list of domains that can decrypt an assets balance', async () => {

        const session = await AuthService.login('password');
    });


    it('Should validate the session is currently active and the user has granted the domain access to the asset', async () => {
        const session = await AuthService.validate(null, {
            domain: 'http://localhost:8000',
            asset: 'a:1',
        });

        expect(session).toBeDefined();
    });

    it('Should not validate the session if the last session activity is > 7 days ago', async () => {

    });

    it('Should not validate the session if the session age is 21 days ago', async () => {

    });

    it('Should not validate the session if the user has not granted the domain access to the asset ', async () => {

    });
});
