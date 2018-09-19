export default {
	code: 'ru',
	name: 'Russian',
	cardinal: {
		one: {
			rules: 'v = 0 and i % 10 = 1 and i % 100 != 11',
			test: '1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, …',
			example: 'из 1 книги за 1 день',
		},
		few: {
			rules: 'v = 0 and i % 10 = 2..4 and i % 100 != 12..14',
			test: '2~4, 22~24, 32~34, 42~44, 52~54, 62, 102, 1002, …',
			example: 'из 2 книг за 2 дня'
		},
		many: {
			rules: 'v = 0 and i % 10 = 0 or v = 0 and i % 10 = 5..9 or v = 0 and i % 100 = 11..14',
			test: '0, 5~19, 100, 1000, 10000, 100000, 1000000, …',
			example: 'из 5 книг за 5 дней',
		},
		other: {
			rules: '',
			test: '0.0~1.5, 10.0, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …',
			example: 'из 1.5 книги за 1.5 дня',
		},
	},
	ordinal: {
		other: {
			rules: '',
			test: '0~15, 100, 1000, 10000, 100000, 1000000, …',
			example: 'Сверните направо на 15-м перекрестке.',
		},
	},
	range: {
		'one+one': {
			rules: 'one',
			test: '1–21',
			example: 'из 1–21 книги за 1–21 день',
		},
		'one+few': {
			rules: 'few',
			test: '1–2',
			example: 'из 1–2 книг за 1–2 дня',
		},
		'one+many': {
			rules: 'many',
			test: '1–5',
			example: 'из 1–5 книг за 1–5 дней',
		},
		'one+other': {
			rules: 'other',
			test: '1–10.0',
			example: 'из 1–10.0 книги за 1–10.0 дня',
		},
		'few+one': {
			rules: 'one',
			test: '2–21',
			example: 'из 2–21 книги за 2–21 день',
		},
		'few+few': {
			rules: 'few',
			test: '2–22',
			example: 'из 2–22 книг за 2–22 дня',
		},
		'few+many': {
			rules: 'many',
			test: '2–5',
			example: 'из 2–5 книг за 2–5 дней',
		},
		'few+other': {
			rules: 'other',
			test: '2–10.0',
			example: 'из 2–10.0 книги за 2–10.0 дня',
		},
		'many+one': {
			rules: 'one',
			test: '0–1',
			example: 'из 0–1 книги за 0–1 день',
		},
		'many+few': {
			rules: 'few',
			test: '0–2',
			example: 'из 0–2 книг за 0–2 дня',
		},
		'many+many': {
			rules: 'many',
			test: '0–5',
			example: 'из 0–5 книг за 0–5 дней',
		},
		'many+other': {
			rules: 'other',
			test: '0–10.0',
			example: 'из 0–10.0 книги за 0–10.0 дня',
		},
		'other+one': {
			rules: 'one',
			test: '0.0–1',
			example: 'из 0.0–1 книги за 0.0–1 день',
		},
		'other+few': {
			rules: 'few',
			test: '0.0–2',
			example: 'из 0.0–2 книг за 0.0–2 дня',
		},
		'other+many': {
			rules: 'many',
			test: '0.0–5',
			example: 'из 0.0–5 книг за 0.0–5 дней',
		},
		'other+other': {
			rules: 'other',
			test: '0.0–10.0',
			example: 'из 0.0–10.0 книги за 0.0–10.0 дня',
		},
	},
};