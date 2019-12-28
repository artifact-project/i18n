i18n
----
A simple module for internationalization with support some feature CLDR.

```
npm i --save @artifact-project/i18n
```


### Usage

**cfg-default-locale.ts**
```ts
import { i18n, setDefaultLocale } from '@artifact-project/i18n';

// http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en
const pluralizer = createPluralizer({
	cardinal: {
		one: 'i = 1 and v = 0',
		other: '',
	},
	range: {
		'one+other': 'other',
		'other+one': 'other',
		'other+other': 'other',
	},
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
```ts
import {T} from '@artifact-project/i18n';

T('required'); // No empty
T({id: 'minLength', detail: {min: 6}}); // Minimum 6 symbols
T('inline', {inline: 'Wow'}); // Wow
```

---

### CLRD Parse Helper

Open http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html and DevTools, after
paste `parse` method and execute `JSON.stringify(parse('ru'), null, 2);` ;]

```js
function parse(code, forTest) {
	const cardinal = {};
	const range = {};
	const codeColumn = document.querySelector(`[name="${code}"]`).parentElement;
	const allRows = codeColumn.parentNode.parentNode.rows;
	const result = {
		code,
		name: codeColumn.previousElementSibling.textContent.trim(),
	};

	let offset = [].indexOf.call(allRows, codeColumn.parentNode);
	let typeColumn = codeColumn.nextElementSibling;
	let maxColumns = codeColumn.rowSpan;
	let type;
	let category;
	let examples;
	let minimalPairs;
	let rules;

	for (let i = 0; i < maxColumns; i++) {
		const cells = allRows[offset + i].cells;
		const tmp = cells[0].textContent.trim();

		if (i === 0) {
			type = cells[2].textContent.trim();
			category = cells[3].textContent.trim();
			examples = cells[4].textContent.trim();
			minimalPairs = cells[5].textContent.trim();
			rules = cells[6].textContent.trim();
		} else if (tmp === 'ordinal' || tmp === 'range') {
			type = tmp;
			category = cells[1].textContent.trim();
			examples = cells[2].textContent.trim();
			minimalPairs = cells[3].textContent.trim();
			rules = cells[4].textContent.trim();
		} else {
			category = tmp;
			examples = cells[1].textContent.trim();
			minimalPairs = cells[2].textContent.trim();
			rules = cells[3].textContent.trim();
		}

		rules = rules.replace(/\s+/g, ' ').trim();

		if (!result.hasOwnProperty(type)) {
			result[type] = {};
		}

		if (category === 'range') {
			rules = rules.replace(/[^a-z]/g, ' ').trim().split(/\s+/g).pop();
		}

		if (forTest) {
			result[type][category] = {
				rules,
				test: examples,
				example: minimalPairs.replace(/(\d+)\,(\d+)/g, '$1.$2'),
			};
		} else {
			result[type][category] = rules;
		}
	}

	return result;
}
```

### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
