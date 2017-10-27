import createPluralizer from './pluralizer';

it('plural / ru', () => {
	const plural = createPluralizer({
		one: 'v = 0 and i % 10 = 1 and i % 100 != 11',
		few: 'v = 0 and i % 10 = 2..4 and i % 100 != 12..14',
		many: 'v = 0 and i % 10 = 0 or v = 0 and i % 10 = 5..9 or v = 0 and i % 100 = 11..14',
	});

	expect(plural(1)).toBe('one');
	expect(plural(0)).toBe('many');
	expect(plural(2)).toBe('few');
	expect(plural(2.01)).toBe('other');
});

it('plural / en', () => {
	const plural = createPluralizer({
		one: 'i = 1 and v = 0',
	});

	expect(plural(0)).toBe('other');
	expect(plural(0)).toBe('other');
	
	expect(plural(1)).toBe('one');
	expect(plural(2)).toBe('other');
	expect(plural(2.01)).toBe('other');
});
