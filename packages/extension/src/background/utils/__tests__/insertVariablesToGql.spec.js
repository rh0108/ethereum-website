import insertVariablesToGql from '../insertVariablesToGql';

describe('insertVariablesToGql', () => {
    it('insert string from variable object to GraphQL query string', () => {
        expect(insertVariablesToGql(
            'data(id: 123) { name }',
            {
                age: 12,
            },
        )).toBe('data(age: 12, id: 123) { name }');

        expect(insertVariablesToGql(
            'data(id: 123) { name }',
            {
                title: 'ms',
                isMember: true,
            },
        )).toBe('data(title: "ms", isMember: true, id: 123) { name }');
    });

    it('can insert variable string to query string without variables', () => {
        expect(insertVariablesToGql(
            'data { name }',
            {
                age: 12,
            },
        )).toBe('data(age: 12) { name }');

        expect(insertVariablesToGql(
            `
                data {
                    name
                }
            `,
            {
                id: 'ab',
                age: 12,
            },
        ).trim()).toBe(`
                data(id: "ab", age: 12) {
                    name
                }
         `.trim());
    });
});
