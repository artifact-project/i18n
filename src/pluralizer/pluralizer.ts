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

type Cast<X, Y> = X extends Y ? X : Y;
type ToIntersect<U> =
	(U extends any ? (inp: U) => void : never) extends ((out: infer I) => void)
		? I
		: never
;
type FlattenObject<T> = T extends object ? {[K in keyof T]: T[K]} : never;

export type PluralRules = {
	cardinal: {
		[K in PluralCategory]?: string;
	};

	range: {
		[K in RangeCategory]?: PluralCategory;
	};
};

export type ExceptionLocale = {
	'='?: {
		[num: number]: string;
	};
};
export type CardinalLocale = PluralRules['cardinal'];
export type RangeLocale = { [K in PluralCategory]?: string };

export type RangeRulesToCardinal<
	R extends PluralRules['range'],
> = FlattenObject<
	ToIntersect<
		{
			[K in keyof R]: Record<Cast<R[K], PluralCategory>, string>;
		}[keyof R]
	>
>;

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
	RangePlural<RangeRulesToCardinal<R['range']>>
{
	rules: R;
}

const OPERATORS = {
	'=': '==',
	or: '||',
	and: '&&',
};
const R_OPERATORS = new RegExp(`\\s+(${Object.keys(OPERATORS).join('|')})\\s+`, 'g');
const R_RAGNES = /\s+([nifv][^=]*?)(!)?=\s+(\d+)\.\.(\d+)/g;

function compile(condition: string): string {
	if (condition === '') {
		return 'true';
	}

	return condition
		.replace(
			R_RAGNES,
			(_, val, not = '', min, max) => ` ${not}(${val} >= ${min} and ${val} <= ${max})`,
		)
		.replace(R_OPERATORS, (_, x) => ` ${OPERATORS[x]} `)
	;
}

function createCardinal<R extends CardinalLocale>(rules: R): CardinalPlural<R> {
	const cache = {};
	const code = Object.keys(rules).map(key => `
		if (${compile(rules[key])}) {
			return '${key}';
		}
	`).join('') + `return 'other';`;
	let fn: Function;

	try {
		fn = Function('n, i, f, v', code);
	} catch (err) {
		fn = function () {
			return [err, code];
		};
	}

	return (num: number | string, locale?: CardinalLocale) => {
		const n = num + '';
		let category = 'other' as PluralCategory;

		if (cache.hasOwnProperty(n)) {
			category = cache[n];
		} else {
			const dot = n.indexOf('.');
			let i = 0;
			let f = 0;
			let v = 0;

			if (dot > -1) {
				i = +n.substr(dot);
				f = +n.substr(dot + 1);
				v = n.length - dot;
			} else {
				i = +num;
			}

			category = (cache[n] = fn(n, i, f, v));
		}

		if (locale != null) {
			return getLocaleValue(n, category, locale) as any;
		}

		return category;
	};
}

function createRange<
	CL extends CardinalLocale,
	RL extends RangeLocale,
>(
	rules: PluralRules['range'],
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
		let category = 'other' as PluralCategory;

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
			return getLocaleValue(key, category, locale) as any;
		}

		return category;
	};
}

export default function createPlural<R extends PluralRules>(rules: R): Plural<R> {
	const cardinal = createCardinal(rules.cardinal);
	const range = createRange(rules.range, cardinal);

	function plural(...args: any[]) {
		const length = args.length;
		return length === 1 || length === 2 && typeof args[1] === 'object'
			? cardinal(args[0], args[1])
			: range(args[0], args[1], args[2])
		;
	}

	return setHiddenProp(plural, 'rules', rules);
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

	if (val.indexOf('#') > -1) {
		val = val.replace(rHASH, key);
	}

	return val;
}