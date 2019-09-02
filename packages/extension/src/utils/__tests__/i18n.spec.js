import { stub } from 'sinon';
import I18n from '../I18n';

const i18n = new I18n();

describe('basic usage of i18n', () => {
    let consoleStub;
    let errors = [];

    beforeEach(() => {
        errors = [];
        consoleStub = stub(console, 'error');
        consoleStub.callsFake(message => errors.push(message));
    });

    afterEach(() => {
        consoleStub.restore();
        i18n.flush();
    });

    it('returns the key back when no value of that key is in its phrases', () => {
        const value = i18n.t('somekey');
        expect(value).toBe('somekey');
        expect(errors[0]).toMatch(/Missing translation/);
    });

    it('returns value registered to it previously', () => {
        const phrases = { i18n: 'internationalization' };
        i18n.register(phrases);
        expect(i18n.t('i18n')).toBe(phrases.i18n);
    });

    it('accepts a nested object with default value under the key of "_"', () => {
        const phrases = {
            family: {
                _: 'Porter House',
                parents: {
                    _: 'Mom & Dad',
                    mom: 'Lily',
                    dad: 'James',
                },
            },
        };
        i18n.register(phrases);
        expect(i18n.t('family')).toBe(phrases.family._);
        expect(i18n.t('family.parents')).toBe(phrases.family.parents._);
        expect(i18n.t('family.parents.mom')).toBe(phrases.family.parents.mom);
    });

    it('can switch between locales, phrases won\'t be shared.', () => {
        i18n.setLocale('en');
        i18n.register({ monday: 'Monday' });
        expect(i18n.t('monday')).toBe('Monday');

        i18n.setLocale('zh-tw');
        expect(i18n.has('monday')).toBe(false);
        expect(errors.length).toBe(0);
        expect(i18n.t('monday')).toBe('monday');
        expect(errors[0]).toMatch(/Missing translation/);

        i18n.register({ monday: '星期一' });
        expect(i18n.t('monday')).toBe('星期一');
    });

    it('can return current locale', () => {
        i18n.setLocale('en');
        expect(i18n.getLocale()).toBe('en');

        i18n.setLocale('zh-TW');
        expect(i18n.getLocale()).toBe('zh-TW');
    });
});

describe('with variables', () => {
    it('accepts variables as second options', () => {
        const phrases = {
            greetings: 'Hello %{name}!',
            route: '%{origin} to %{destination}',
        };
        i18n.register(phrases);

        expect(i18n.t('greetings', { name: 'World' })).toBe('Hello World!');
        const trip = i18n.t('route', {
            origin: 'Taipei',
            destination: 'Anywhere in the World',
        });
        expect(trip).toBe('Taipei to Anywhere in the World');
    });

    it('uses smart_count option to determine pluralization', () => {
        const phrases = {
            item: '%{smart_count} item |||| %{smart_count} items',
        };
        i18n.setLocale('en');
        i18n.register(phrases);

        expect(i18n.t('item', { smart_count: 1 })).toBe('1 item');
        expect(i18n.t('item', { smart_count: 2 })).toBe('2 items');
        expect(i18n.t('item', { smart_count: 3 })).toBe('3 items');
    });

    it('accepts a number as smart_count', () => {
        const phrases = {
            item: '%{smart_count} item |||| %{smart_count} items',
        };
        i18n.setLocale('en');
        i18n.register(phrases);

        expect(i18n.t('item', 1)).toBe('1 item');
        expect(i18n.t('item', 2)).toBe('2 items');
        expect(i18n.t('item', 3)).toBe('3 items');
    });

    it('has no use of pluralization forms if it cannot apply to that language', () => {
        const phrases = {
            item: '%{smart_count} item |||| %{smart_count} items',
        };
        i18n.setLocale('zh-TW');
        i18n.register(phrases);

        expect(i18n.t('item', 1)).toBe('1 item');
        expect(i18n.t('item', 2)).toBe('2 item');
        expect(i18n.t('item', 3)).toBe('3 item');
    });

    it('allows different definitions for different counts', () => {
        const phrases = {
            gift: {
                _: 'many gifts',
                0: 'no gifts',
                1: 'a gift',
                2: '2 gifts',
            },
        };
        i18n.register(phrases);

        expect(i18n.t('gift')).toBe('many gifts');
        expect(i18n.t('gift', 0)).toBe('no gifts');
        expect(i18n.t('gift', 1)).toBe('a gift');
        expect(i18n.t('gift', 2)).toBe('2 gifts');
        expect(i18n.t('gift', 10)).toBe('many gifts');
    });

    it('also use options.count as key to generate string for different counts', () => {
        const phrases = {
            gift: {
                _: 'many gifts for %{name}',
                0: 'no gifts for %{name}',
                1: 'a gift for %{name}',
                2: '2 gifts for %{name}',
            },
        };
        i18n.register(phrases);

        expect(i18n.t('gift', {
            name: 'Ron',
        })).toBe('many gifts for Ron');
        expect(i18n.t('gift', {
            name: 'Ron',
            count: 0,
        })).toBe('no gifts for Ron');
        expect(i18n.t('gift', {
            name: 'Ron',
            count: 1,
        })).toBe('a gift for Ron');
        expect(i18n.t('gift', {
            name: 'Ron',
            count: 2,
        })).toBe('2 gifts for Ron');
        expect(i18n.t('gift', {
            name: 'Ron',
            count: 10,
        })).toBe('many gifts for Ron');
    });
});
