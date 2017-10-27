i18n
----
Simple a module for internalization.

```
npm i --save @artifact-project/i18n
```


### Usage

**cfg-default-locale.ts**
```ts
import {i18n, setDefaultLocale} from '@artifact-project/i18n';

// http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en
const pluralizer = createPluralizer({
	one: 'i = 1 and v = 0',
});

// Dictionary
const dict = {
	required: 'No empty',
	minLength: ({detail: {min}}, {plural}) => `Minimum ${plural('symbols', min)}`,
	symbols: {
		cardinal: {
			one: 'symbol',
			other: 'symbols',
		},
	},
};

// Set default
setDefaultLocale(new i18n(dict, pluralizer));
```

**somewhere.ts**
```
import {T} from '@artifact-project/i18n';

T('required'); // No empty
T({id: 'minLength', detail: {min: 6}}); // Minimum 6 symbols
T('inline', {inline: 'Wow'}); // Wow
```


### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
