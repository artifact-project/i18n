import type { CardinalLocale, PluralCardinalCategorizer } from './plural';

const OPERATORS = {
	'=': '==',
	or: '||',
	and: '&&',
};
const R_OPERATORS = new RegExp(`\\s+(${Object.keys(OPERATORS).join('|')})\\s+`, 'g');
const R_RAGNES = /\s+([nifv][^=]*?)(!)?=\s+(\d+)\.\.(\d+)/g;

function compile(condition: string): string {
	console.log(condition)

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

/** @private Only for testing */
export function generatePluralCardinalCategorizer(rules: CardinalLocale) {
	const code = [
		`(n: string, i: number, f: number, v: number) => {`,
		...Object.keys(rules).map(key => [
			`  if (${compile(rules[key])}) {`,
			`    return '${key}';`,
			`  }`,
			``,
		].join('\n')),
		`  return 'other';`,
		`}`,
		``,
	].join('\n');

	return code.replace(/if\s*\(true\)[^}]+.\s+/, '');
}

/** @private Only for testing */
export function generatePluralCardinalCategorizerFucntion<R extends CardinalLocale>(rules: R): PluralCardinalCategorizer<R> {
	return Function(`return ${generatePluralCardinalCategorizer(rules).replace(/: [a-z]{4,}/g, '')}`)();
}