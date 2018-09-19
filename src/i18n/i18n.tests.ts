import {i18n} from './i18n';
import createPluralizer from '../pluralizer/pluralizer';

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

xit('i18n / plural', () => {
	const en = new i18n({
		items: {
			cardinal: {
				'=0': 'no items',
				one: 'item',
				other: 'items',
			},
		},
	}, createPluralizer({
		one: 'i = 1 and v = 0',
	}));

	expect(en.plural('not-exists', 0)).toBe('0');
	expect(en.plural('items', 0)).toBe('no items');
	expect(en.plural('items', 0, ' ')).toBe('no items');
	expect(en.plural('items', 1)).toBe('item');
	expect(en.plural('items', 1, ' ')).toBe('1 item');
	expect(en.plural('items', 99, ' ')).toBe('99 items');
});
