import { i18n } from './i18n';
import { createPlural, createPluralRules } from '../plural/plural';
import { generatePluralCardinalCategorizerFucntion } from '../plural/internal';

it('i18n / get', () => {
	const en = new i18n({
		required: 'No empty',
		minLength: ({detail: {min}}, {plural}) => `Min ${plural('symbols', min, ' ')}`,
		symbols: {
			cardinal: {
				one: 'symbol',
				other: 'symbols',
			},
		},
	});

	expect(en.get('not-exists')).toBe('not-exists');
	expect(en.get('inline', {inline: 'Wow'})).toBe('Wow');

	expect(en.get('required')).toBe('No empty');
	expect(en.get({
		id: 'minLength',
		detail: {
			min: 6,
			length: 2,
		},
	})).toBe('Min 6 symbols');
});

it('i18n / plural', () => {
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

	const en = new i18n({
		items: {
			cardinal: {
				'=0': 'no items',
				one: 'item',
				other: 'items',
			},
		},
	}, createPlural(rules, categorizer));

	expect(en.plural('not-exists', 0)).toBe('0');
	expect(en.plural('items', 0)).toBe('no items');
	expect(en.plural('items', 0, ' ')).toBe('no items');
	expect(en.plural('items', 1)).toBe('item');
	expect(en.plural('items', 1, ' ')).toBe('1 item');
	expect(en.plural('items', 99, ' ')).toBe('99 items');
});
