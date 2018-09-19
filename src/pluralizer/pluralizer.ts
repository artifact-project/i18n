export type PluralCategory = 'zero'
	| 'one'
	| 'two'
	| 'few'
	| 'many'
	| 'other'

export type PluralRules = {
	cardinal: {
		[K in PluralCategory]?: string;
	};

	range: {
		[K in PluralCategory]?: {
			[K in PluralCategory]?: PluralCategory;
		};
	} | {
		[rangeExpression: string]: PluralCategory;
	};
}

export type CardinalPlural = (num: number | string) => PluralCategory;
export type RangePlural = (start: number | string, end: number | string) => PluralCategory;

export interface Plural {
	(num: number | string): PluralCategory;
	(start: number | string, end: number | string): PluralCategory;
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
		.replace(R_RAGNES, (_, val, not = '', min, max) => ` ${not}(${val} >= ${min} and ${val} <= ${max})`)
		.replace(R_OPERATORS, (_, x) => ` ${OPERATORS[x]} `)
	;
}

function createCardinal(rules: PluralRules['cardinal']): CardinalPlural {
	const cache = {};
	const code = Object.keys(rules).map(key => `
		if (${compile(rules[key])}) {
			return '${key}';
		}
	`).join('') + `return 'other';`;
	let fn;

	try {
		fn = Function('n, i, f, v', code);
	} catch (err) {
		fn = function () {
			return [err, code];
		};
	}

	return (num: number | string) => {
		const n = num + '';

		if (cache.hasOwnProperty(n)) {
			return cache[n];
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

			return (cache[n] = fn(n, i, f, v));
		}
	};
}

function createRange(rules: PluralRules['range'], cardinal: CardinalPlural): RangePlural {
	Object.keys(rules).forEach(key => {
		const pair = key.split('+');

		if (pair.length) {
			if (!rules.hasOwnProperty(pair[0])) {
				rules[pair[0]] = {};
			}

			rules[pair[0]][pair[1]] = rules[key];
		}
	})

	return (start: number | string, end: number | string) => {
		const s = cardinal(start);

		if (rules.hasOwnProperty(s)) {
			const e = cardinal(end);

			if (rules[s].hasOwnProperty(e)) {
				return rules[s][e];
			}
		}

		return null;
	};
}

export default function createPlural(rules: PluralRules): Plural {
	const cardinal = createCardinal(rules.cardinal);
	const range = createRange(rules.range, cardinal);

	return function () {
		return arguments.length === 1
			? cardinal(arguments[0])
			: range(arguments[0], arguments[1])
		;
	};
}
