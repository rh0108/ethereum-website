const { constants } = require('@aztec/dev-utils');
const { expect } = require('chai');
const crypto = require('crypto');

const BN = require('bn.js');
const bn128 = require('../../src/bn128');

describe('bn128', () => {
    let kMaxTemp;

    beforeEach(() => {
        kMaxTemp = bn128.K_MAX;
        bn128.K_MAX = 500; // *cough*
    });

    afterEach(() => {
        bn128.K_MAX = kMaxTemp;
    });

    it('should export the bn128 curve', async () => {
        const testPoint = bn128.randomPoint();
        const scalar = new BN(crypto.randomBytes(32), 16).toRed(bn128.groupReduction);
        const scalarInverse = scalar.redInvm();
        const result = testPoint.mul(scalar).mul(scalarInverse);
        expect(result.eq(testPoint));
        expect(
            testPoint.x
                .redSqr()
                .redMul(testPoint.x)
                .redAdd(bn128.curve.b)
                .eq(testPoint.y.redSqr()),
        ).to.equal(true);
    });

    it('should create a well-formed bn.js instance in randomScalarGroup', () => {
        const scalar = bn128.randomGroupScalar();

        expect(BN.isBN(scalar)).to.equal(true);
        expect(scalar.red).to.deep.equal(bn128.groupReduction);
        expect(scalar.fromRed().toString(16).length <= 64).to.equal(true);
    });

    it('should create a well-formed elliptic.js point instance in randomPoint', () => {
        for (let i = 0; i < 10; i += 1) {
            const point = bn128.randomPoint();
            const lhs = point.y.redSqr();
            const rhs = point.x
                .redSqr()
                .redMul(point.x)
                .redAdd(bn128.curve.b);
            expect(lhs.fromRed().eq(rhs.fromRed())).to.equal(true);
        }
    });

    it('should correctly represent the AZTEC generator point h', () => {
        const { h } = bn128;
        const lhs = h.y.redSqr();
        const rhs = h.x
            .redSqr()
            .redMul(h.x)
            .redAdd(bn128.curve.b);

        expect(h.x.fromRed().eq(constants.H_X)).to.equal(true);
        expect(h.y.fromRed().eq(constants.H_Y)).to.equal(true);
        expect(lhs.fromRed().eq(rhs.fromRed())).to.equal(true);
    });

    describe('Recover Message', async () => {
        it('should recover a note message', async () => {
            const k = new BN(300);
            const gamma = bn128.curve.g;
            const gammaK = bn128.curve.g.mul(k);
            const result = await bn128.recoverMessage(gamma, gammaK);
            expect(result).to.equal(300);
        });

        it('should return 1 for point at infinity', async () => {
            const gamma = bn128.curve.g.add(bn128.curve.g.neg());
            const gammaK = gamma;
            const result = await bn128.recoverMessage(gamma, gammaK);
            expect(result).to.equal(1);
        });

        it('should fail cannot find a solution from 0 to K_MAX', async () => {
            const k = new BN(999);
            const gamma = bn128.curve.g;
            const gammaK = bn128.curve.g.mul(k);
            try {
                await bn128.recoverMessage(gamma, gammaK);
            } catch (e) {
                expect(e.message).to.contain('could not find k!');
            }
        });
    });
});
