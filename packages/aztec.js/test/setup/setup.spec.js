const {
    constants: { K_MAX, K_MIN },
} = require('@aztec/dev-utils');
const chai = require('chai');
const BN = require('bn.js');

const setup = require('../../src/setup');
const bn128 = require('../../src/bn128');

const { expect } = chai;

describe('Trusted Setup', () => {
    it('should read signature and retrieve well-formed elliptic curve points', async () => {
        const k = Math.floor(Math.random() * (K_MAX - K_MIN + 1)) + K_MIN;
        const point = await setup.fetchPoint(k);
        expect(BN.isBN(point.x)).to.equal(true);
        expect(BN.isBN(point.y)).to.equal(true);
    });

    it('should fail if asked for a point > K_MAX', async () => {
        const k = K_MAX * 2;
        let message = '';
        try {
            await setup.fetchPoint(k);
        } catch (e) {
            ({ message } = e);
        }
        expect(message).to.equal('point not found');
    });

    it('should compress coordinate with even y', () => {
        const compressed = setup.compress(new BN(2), new BN(4));
        expect(compressed.eq(new BN(2))).to.equal(true);
    });

    it('should compress coordinate with odd y', () => {
        let compressed = setup.compress(new BN(2), new BN(1));
        expect(compressed.testn(255)).to.equal(true);
        compressed = compressed.maskn(255);
        expect(compressed.eq(new BN(2))).to.equal(true);
    });

    it('should decompress a compressed coordinate', () => {
        const point = bn128.randomPoint();
        const { x, y } = setup.decompress(setup.compress(point.x.fromRed(), point.y.fromRed()));
        expect(x.eq(point.x.fromRed())).to.equal(true);
        expect(y.eq(point.y.fromRed())).to.equal(true);
    });

    it('should fail to decompress if given malformed input', () => {
        let message = '';
        try {
            // this will produce a value that is not a quadratic residue
            setup.decompress(new BN('2e4d6a154b5bf6bf2387ed08793d059f6e43247587c5fed538f861101f08dc52', 16));
        } catch (e) {
            ({ message } = e);
        }
        expect(message).to.equal('x^3 + 3 not a square, malformed input');
    });
});
