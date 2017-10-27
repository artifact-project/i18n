export type Token = {
	id: string;
	descr?: string;
	detail?: any;
	nested?: Token;
}

export type PluralCardinalDict = {
	zero?: string;
	one?: string;
	two?: string;
	few?: string;
	many?: string;
	other: string;
	[exception: string]: string;
}

export type PluralOrdinalDict = PluralCardinalDict

export type PluralRangeDict = {
	[condition: string]: keyof PluralCardinalDict;
};

export type PluralDict = {
	cardinal: PluralCardinalDict;
	ordinal?: PluralOrdinalDict;
	range?: PluralRangeDict;
};

export type Pluralizer = (num: number) => keyof PluralCardinalDict;

export type LocaleGetter = (token: Token, i18n:  i18n) => string;

export type LocaleValues = {
	[id: string]: string | LocaleGetter | PluralDict;
};

export type LocaleRawValues = {
	[token: string]: {
		computed: boolean;
		value: string | LocaleGetter | PluralDict;
	};
};

export type SimpleDict = {
	[value: string]: string;
};

export const EN_PLURAL: Pluralizer = (num: number): keyof PluralCardinalDict => {
	return num === 0 ? '=0' : (name === 1 ? 'one' : 'other');
};

export class i18n {
	get: (target: string | Token, dict?: SimpleDict) => string;
	plural: (dictName: string, value: number, glue?: string) => string;

	locale: LocaleRawValues = {};
	pluralizer: Pluralizer;

	constructor(locale: LocaleValues, plural: Pluralizer = EN_PLURAL) {
		this.set(locale);
		this.pluralizer = plural;

		// Plural method
		this.plural = (dictName: string, num: number, glue?: string): string => {

			if (this.locale.hasOwnProperty(dictName)) {
				const cardinal = (this.locale[dictName].value as PluralDict).cardinal;

				if (cardinal.hasOwnProperty(`=${num}`)) {
					return cardinal[`=${num}`];
				} else {
					const key = this.pluralizer(num);
					let value = '';

					if (cardinal.hasOwnProperty(key)) {
						value = cardinal[key];
					} else {
						value = cardinal.other;
					}

					return (glue == null ? '' : num + glue) + value;
				}
			}

			return num + '';
		};

		// Get method
		this.get = (target: string | Token, dict?: SimpleDict): string => {
			const token = (target && (<Token>target).id === void 0 ? {id: target} : target) as Token;
			const id = token.id;

			if (dict != null && dict.hasOwnProperty(id)) {
				return dict[id];
			}

			if (this.locale.hasOwnProperty(id)) {
				const getter = this.locale[id];

				if (getter.computed) {
					return (getter.value as LocaleGetter)(token, this);
				} else {
					return <string>getter.value;
				}
			}

			return id;
		}
	}

	set(locale: LocaleValues) {
		Object.keys(locale).forEach(key => {
			const value = locale[key];

			this.locale[key] = {
				computed: typeof value === 'function',
				value,
			};
		});
	}
}


const defaultLocale = new i18n({});

export const T = (target: string | Token, dict?: SimpleDict) => defaultLocale.get(target, dict);
export const P = (dictName: string, num: number, glue?: string) => defaultLocale.plural(dictName, num, glue);
export const _ = T;

export function setDefaultLocale(locale: i18n) {
	defaultLocale.locale = locale.locale;
	defaultLocale.pluralizer = locale.pluralizer;
}

export default defaultLocale;
