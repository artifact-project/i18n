export type PluralCategory =
	| 'zero'
	| 'one'
	| 'two'
	| 'few'
	| 'many'
	| 'other'
;

export type RangeCategory =
	| 'zero+zero'
	| 'zero+one'
	| 'zero+two'
	| 'zero+few'
	| 'zero+many'
	| 'zero+other'
	| 'one+zero'
	| 'one+one'
	| 'one+two'
	| 'one+few'
	| 'one+many'
	| 'one+other'
	| 'two+zero'
	| 'two+one'
	| 'two+two'
	| 'two+few'
	| 'two+many'
	| 'two+other'
	| 'few+zero'
	| 'few+one'
	| 'few+two'
	| 'few+few'
	| 'few+many'
	| 'few+other'
	| 'many+zero'
	| 'many+one'
	| 'many+two'
	| 'many+few'
	| 'many+many'
	| 'many+other'
	| 'other+zero'
	| 'other+one'
	| 'other+two'
	| 'other+few'
	| 'other+many'
	| 'other+other'
;

export type CardinalRules = {
	[K in PluralCategory]?: string;
};

export type RangeRules = {
	[K in RangeCategory]?: string;
};

export type PluralRules = {
	code: string;
	name?: string;
	cardinal: CardinalRules;
	range: RangeRules;
};

export type ExceptionLocale = {
	'='?: {
		[value: number | string]: string;
	};
};
export type CardinalLocale = CardinalRules;
export type RangeLocale = {
	[K in PluralCategory]?: string;
};


export interface CardinalPlural<CL extends CardinalLocale> {
	(num: number | string): PluralCategory;
	(num: number | string, locale: CL & ExceptionLocale): string;
};

export interface RangePlural<RL extends RangeLocale> {
	(start: number | string, end: number | string): PluralCategory;
	(start: number | string, end: number | string, locale: RL & ExceptionLocale): string;
};

export interface Plural<R extends PluralRules> extends
	CardinalPlural<R['cardinal']>,
	RangePlural<R['cardinal']>
{
	code: R['code'];
	range: RangePlural<R['cardinal']>;
}

export type PluralCardinalCategorizer<R extends CardinalLocale> = (n: string, i: number, f: number, v: number) => keyof R;

export function createPluralCardinalCategorizer<R extends PluralRules>(
	rules: R,
	categorizer: PluralCardinalCategorizer<R['cardinal']>,
): PluralCardinalCategorizer<R['cardinal']> {
	return categorizer;
}

function setHiddenProp<
	T extends object,
	K extends string,
	V extends any,
	R extends T & {
		readonly [X in K]: V;
	},
>(target: T, name: K, value: V): R {
	Object.defineProperty(target, name, {
		value,
		configurable: false,
		enumerable: false,
		writable: false,
	});

	return target as R;
}

const rHASH = /#/g;

function getLocaleValue(key: string, category: PluralCategory, locale: object): string {
	let val = locale[category];

	if (locale['='] != null && locale['='].hasOwnProperty(key)) {
		val = locale['='][key];
	}

	if (val && val.indexOf('#') > -1) {
		val = val.replace(rHASH, key);
	}

	return val;
}

function createCardinal<R extends CardinalLocale>(categorizer: PluralCardinalCategorizer<R>): CardinalPlural<R> {
	const cache = {};

	return (num: number | string, locale?: CardinalLocale) => {
		const n = num + '';
		let category = 'other' as keyof R;

		if (cache.hasOwnProperty(n)) {
			category = cache[n];
		} else {
			const dot = n.indexOf('.');
			let i = 0;
			let f = 0;
			let v = 0;

			if (dot > -1) {
				i = +n.slice(dot);
				f = +n.slice(dot + 1);
				v = n.length - dot;
			} else {
				i = +num;
			}

			category = (cache[n] = categorizer(n, i, f, v));
		}

		if (locale != null) {
			return getLocaleValue(n, category as any, locale) as any;
		}

		return category;
	};
}

function createRange<
	CL extends CardinalLocale,
	RL extends RangeLocale,
>(
	rules: RangeRules,
	cardinal: CardinalPlural<CL>,
): RangePlural<RL> {
	Object.keys(rules).forEach(key => {
		const pair = key.split('+');

		if (pair.length) {
			if (!rules.hasOwnProperty(pair[0])) {
				rules[pair[0]] = {};
			}

			rules[pair[0]][pair[1]] = rules[key];
		}
	});

	const cache = {};

	return (start: number | string, end: number | string, locale?: RL) => {
		const key = `${start}+${end}`;
		let category = 'other';

		if (cache.hasOwnProperty(key)) {
			category = cache[key];
		} else {
			const rangeCategory = `${cardinal(start)}+${cardinal(end)}` as RangeCategory;

			if (rules.hasOwnProperty(rangeCategory)) {
				category = rules[rangeCategory]!;
				cache[key] = category;
			}
		}

		if (locale != null) {
			return getLocaleValue(key, category as any, locale) as any;
		}

		return category;
	};
}

export function createPluralRules<R extends PluralRules>(rules: R): R {
	return rules;
}

export function createPlural<R extends PluralRules>(
	rules: R,
	cardinalCategorizer: PluralCardinalCategorizer<R['cardinal']>,
): Plural<R> {
	const cardinal = createCardinal<R['cardinal']>(cardinalCategorizer);
	const range = createRange(rules.range, cardinal);
	const plural = (...args: any[]) => {
		const length = args.length;

		return length === 1 || length === 2 && typeof args[1] === 'object'
			? cardinal(args[0], args[1])
			: range(args[0], args[1], args[2])
		;
	};

	setHiddenProp(plural, 'code', rules.code);
	setHiddenProp(plural, 'range', range);

	return plural as Plural<R>;
}