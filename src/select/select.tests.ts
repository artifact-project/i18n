import { select } from './select';

describe('select', () => {
	const val = 'rect' as ('rect' | 'circle' | 'arc'); 
	const existsMessages = {
		rect: 'Квадрат',
		other: 'unknown',
	};
	const otherMessages = {
		other: 'unknown',
	};

	it('exists', () => {
		expect(select(val, existsMessages)).toBe(existsMessages.rect)
	});

	it('not exists', () => {
		expect(select(val, otherMessages)).toBe(otherMessages.other)
	});
});