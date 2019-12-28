import createPluralizer, { PluralCategory, PluralRules } from './pluralizer';
import ruFixture from './fixture/ru';

type PluralLocale = {
	code?: string;
	name?: string;

	cardinal: {
		[K in PluralCategory]: {
			rules: string;
			test: string;
		};
	};

	range: {
		[index:string]: {
			rules: string;
			test: string;
		};
	};

	ordinal?: object;
}

function createPluralizerHelper(pluralLocale: PluralLocale) {
	return createPluralizer({
		cardinal: Object.keys(pluralLocale.cardinal).reduce((map, key: PluralCategory) => {
			const value = pluralLocale.cardinal[key];

			map[key] = value.rules;

			return map;
		}, {} as PluralRules['cardinal']),

		range: Object.keys(pluralLocale.range).reduce((map, key: PluralCategory) => {
			const value = pluralLocale.range[key];
			map[key] = value.rules;
			return map;
		}, {} as PluralRules['range']),
	});
}

function testValues(input: string) {
	return input.trim().split(/,\s+/).reduce((values, val) => {
		if (val.indexOf('~') === -1) {
			values.push(val);
		} else {
			const tmp = val.split('.');

			for (let v = +tmp[0]; v <= +tmp[1]; v += 0.1) {
				values.push(v.toFixed(1));
			}
		}

		return values;
	}, [] as string[]).slice(0, -1);
}

describe('ru', () => {
	const plural = createPluralizerHelper(ruFixture as any);

	it('cardinal: auto', () => {
		Object.keys(ruFixture.cardinal).forEach((key) => {
			testValues(ruFixture.cardinal[key].test).forEach((val) => {
				expect(`${plural(val)}: ${val}`).toBe(`${key}: ${val}`);
			});
		});
	});

	it('cardinal: manual', () => {
		expect(plural(1)).toBe('one');
		expect(plural(0)).toBe('many');
		expect(plural(2)).toBe('few');
		expect(plural(2.01)).toBe('other');
	});

	it('range: manual', () => {
		expect(plural(1, 21)).toBe('one');
		expect(plural(1, 2)).toBe('few');
	});
});

describe('en', () => {
	const plural = createPluralizer({
		cardinal: {
			one: 'i = 1 and  v = 0',
			other: '',
		},

		range: {
			'one+other': 'other',
			'other+one': 'other',
			'other+other': 'other',
		},
	});

	it('cardinal', () => {
		expect(`${plural(1)}: 1`).toBe('one: 1');
		expect(`${plural(0)}: 0`).toBe('other: 0');
		expect(`${plural('0.0')}: 0.0`).toBe('other: 0.0');
		expect(`${plural('1.0')}: 1.0`).toBe('other: 1.0');
		expect(`${plural(18)}: 18`).toBe('other: 18');
	});

	it('range', () => {
		expect(`${plural(1, 2)}: 1-2`).toBe('other: 1-2');
	});
});

describe('with locale', () => {
	const plural = createPluralizer({
		cardinal: {
			one: 'i = 1 and  v = 0',
			other: '',
		},

		range: {
			'one+other': 'other',
			'other+one': 'other',
			'other+other': 'other',
		},
	});

	it('cardinal', () => {
		const locale = {
			one: 'message',
			other: 'messages',
			'=': {0: 'no message', 50: 'fifty messages'}
		};
		expect(plural(0, locale)).toBe('no message');
		expect(plural(1, locale)).toBe('message');
		expect(plural(2, locale)).toBe('messages');
		expect(plural(50, locale)).toBe('fifty messages');
	});

	it('cardinal with value', () => {
		const locale = {
			one: '# message',
			other: '# messages',
		};
		expect(plural(1, locale)).toBe('1 message');
		expect(plural(2, locale)).toBe('2 messages');
	});

	it('range', () => {
		const locale = {
			other: 'messages',
			'=': {'1+5': '1 & 5 messages'},
		};
		expect(plural(1, 2, locale)).toBe('messages');
		expect(plural(1, 5, locale)).toBe('1 & 5 messages');
	});
});