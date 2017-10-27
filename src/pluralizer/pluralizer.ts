import {Pluralizer} from '../i18n/i18n';

export type CardinalPluralRules = {
	zero?: string;
	one?: string;
	two?: string;
	few?: string;
	many?: string;
}

const OPERATORS = {
	'=': '==',
	or: '||',
	and: '&&',
};
const R_OPERATORS = new RegExp(` +(${Object.keys(OPERATORS).join('|')}) +`, 'g');
const R_RAGNES = / +([nifv][^=]*?)(!)?=\s+(\d+)\.\.(\d+)/g;

function compile(condition: string): string {
	return condition
		.replace(R_RAGNES, (_, val, not = '', min, max) => ` ${not}(${val} >= ${min} and ${val} <= ${max})`)
		.replace(R_OPERATORS, (_, x) => ` ${OPERATORS[x]} `)
	;
}

export default function createPluralizer(rules: CardinalPluralRules): Pluralizer {
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

	return (num: number) => {
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
				i = num;
			}

			return (cache[n] = fn(n, i, f, v));
		}
	};
}
