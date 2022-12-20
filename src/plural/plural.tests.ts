import { createPlural, PluralCategory, CardinalRules, RangeRules, createPluralRules, createPluralCardinalCategorizer } from './plural';
import ruFixture from './fixture/ru';
import { generatePluralCardinalCategorizerFucntion } from './internal';

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

function createPluralHelper(pluralLocale: PluralLocale) {
	const rules = createPluralRules({
		code: pluralLocale.code || 'any',
		
		cardinal: Object.keys(pluralLocale.cardinal).reduce((map, key: PluralCategory) => {
			const value = pluralLocale.cardinal[key];

			map[key] = value.rules;

			return map;
		}, {} as CardinalRules),

		range: Object.keys(pluralLocale.range).reduce((map, key: PluralCategory) => {
			const value = pluralLocale.range[key];
			map[key] = value.rules;
			return map;
		}, {} as RangeRules),
	});
	const categorizer = generatePluralCardinalCategorizerFucntion(rules.cardinal);

	return createPlural(rules, categorizer);
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
	const plural = createPluralHelper(ruFixture as any);

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
		expect(plural.range(1, 21)).toBe('one');
		expect(plural.range(1, 2)).toBe('few');
	});
});

describe('en', () => {
	const rules = createPluralRules({
		code: 'en',

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
	const categorizer = generatePluralCardinalCategorizerFucntion(rules.cardinal);
	const plural = createPlural(rules, categorizer);

	it('cardinal', () => {
		expect(`${plural(1)}: 1`).toBe('one: 1');
		expect(`${plural(0)}: 0`).toBe('other: 0');
		expect(`${plural('0.0')}: 0.0`).toBe('other: 0.0');
		expect(`${plural('1.0')}: 1.0`).toBe('other: 1.0');
		expect(`${plural(18)}: 18`).toBe('other: 18');
	});

	it('range', () => {
		expect(`${plural.range(1, 2)}: 1-2`).toBe('other: 1-2');
	});
});

describe('with locale', () => {
	const rules = createPluralRules({
		code: 'en',

		cardinal: {
			one: 'i = 1 and v = 0',
			other: '',
		},

		range: {
			'one+other': 'other',
			'other+one': 'other',
			'other+other': 'other',
		},
	});
	const categorizer = generatePluralCardinalCategorizerFucntion(rules.cardinal);
	const plural = createPlural(rules, categorizer);

	it('cardinal', () => {
		const locale = {
			one: 'message',
			other: 'messages',
			'=': {
				0: 'no message',
				50: 'fifty messages',
			},
		};

		expect(plural(0, locale)).toBe('no message');
		expect(plural(1, locale)).toBe('message');
		expect(plural(2, locale)).toBe('messages');
		expect(plural(50, locale)).toBe('fifty messages');
	});

	it('parial cardinal', () => {
		const locale = {
			one: 'message',
			other: 'messages',
		};

		expect(plural(1, locale)).toBe('message');
	});

	it('cardinal with value', () => {
		const locale = {
			one: '# message',
			other: '# messages',
		};

		expect(plural(1, locale)).toBe('1 message');
		expect(plural(2, locale)).toBe('2 messages');
	});

	it('create', () => {
		const cardinal = plural.create({
			one: 'message',
			other: 'messages',
			'=': {
				0: 'no message',
			},
		});

		expect(cardinal(0)).toBe('no message');
		expect(cardinal(1)).toBe('message');
	});

	it('range', () => {
		const locale = {
			one: 'message',
			other: 'messages',
			'=': {
				'1+5': '1 & 5 messages',
			},
		};

		expect(plural(1, 2, locale)).toBe('messages');
		expect(plural.range(1, 5, locale)).toBe('1 & 5 messages');
	});
});

it('generator', () => {
	/** [en] English: plural rules */
	const enPluralRules = createPluralRules({
		"code": "en",
		"name": "English",
		"cardinal": {
			"one": "i = 1 and v = 0",
			"other": "",
		},
		"range": {
			"one+other": "one + other → other",
			"other+one": "other + one → other",
			"other+other": "other + other → other"
		}
	});

	/** [en] English: plural cardinal categorizer */
	const enPluralCardinalCategorizer = createPluralCardinalCategorizer(enPluralRules, (n: string, i: number, f: number, v: number) => {
		if (i == 1 && v == 0) {
			return 'one';
		}

		return 'other';
	});

	/** [en] English: plural method (cardinal & range) */
	const enPlural = createPlural(enPluralRules, enPluralCardinalCategorizer);
	
	expect(`${enPlural(1)}: 1`).toBe('one: 1');
	expect(`${enPlural(0)}: 0`).toBe('other: 0');
})