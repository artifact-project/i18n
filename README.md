i18n
----
A simple module for internationalization with support some feature CLDR.

```
npm i --save @artifact-project/i18n
```

---

### Plural generator

🤜 [https://artifact-project.github.io/i18n/](https://artifact-project.github.io/i18n/)

---

### Plural API

```ts
import { enPlural } from '~/plural/en'; // use plural generator

export const approvalsLeftPlural = enPlural.create({
	one: '# approval',
	other: '# approvals',
	'=': {
		'1': 'one approval',
	},
});

approvalsLeftPlural(0); // 0 approvals
approvalsLeftPlural(1); // one approval
approvalsLeftPlural(2); // 2 approvals
```

---

### Dictionary

**cfg-default-locale.ts**
```ts
import { i18n, setDefaultLocale } from '@artifact-project/i18n';

// 1. Open https://artifact-project.github.io/i18n/
// 2. Choice a plural preset 


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
setDefaultLocale(new i18n(dict, plural));
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

Open http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html and DevTools and execute ;]

```js
function parseLangList() {
	return [...document.querySelectorAll('.dtf-s a[name][href^="#"]')]
		.filter(a => a.name === a.href.split('#')[1])
		.map(a => a.name)
	;
}

function parseLang(code, forTest) {
	const cardinal = {};
	const range = {};
	const codeColumn = document.querySelector(`[name="${code}"]`).parentElement;
	const allRows = codeColumn.parentNode.parentNode.rows;
	const result = {
		code,
		name: codeColumn.previousElementSibling.textContent.trim(),
	};
	const getText = (el) => el.innerHTML.replace(/<\/?[a-z][^>]*>|&[a-z]+;?/g, ' ').replace(/\s+/g, ' ').trim();

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
		const tmp = getText(cells[0]);

		if (i === 0) {
			type = getText(cells[2]);
			category = getText(cells[3]);
			examples = getText(cells[4]);
			minimalPairs = getText(cells[5]);
			rules = getText(cells[6]);
		} else if (tmp === 'ordinal' || tmp === 'range') {
			type = tmp;
			category = getText(cells[1]);
			examples = getText(cells[2]);
			minimalPairs = getText(cells[3]);
			rules = getText(cells[4]);
		} else {
			category = tmp;
			examples = getText(cells[1]);
			minimalPairs = cells[3] ? getText(cells[2]) : '';
			rules = getText(cells[3] || cells[2]);
		}

		rules = rules.replace(/\s+/g, ' ').trim();

		if (!result.hasOwnProperty(type)) {
			result[type] = {};
		}

		if (type === 'range') {
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

// MAIN
(() => {
	const dcl = parseLangList()
		.map(code => {
			try {
				return parseLang(code);
			} catch (_) {}
		})
		.filter(Boolean)
	;
	
	console.log(`Plural DCL Copied in Buffer:`, dcl);
	copy(dcl);
})();
```

### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
