import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const directory = 'translations/wordpress-org';
const originals = (file) => [...readFileSync(file, 'utf8').matchAll(/^msgid (".+")\r?$/gm)].map((match) => JSON.parse(match[1]));
const interfaceSource = originals(`${directory}/interface-source.pot`);
const readmeSource = originals(`${directory}/readme-source.pot`);
assert.equal(interfaceSource.length, 66);
assert.equal(readmeSource.length, 58);
const unchangedMetadata = new Set(['Vladimir Atapin', 'https://atapin.de/', 'https://kalender.georg-kloster.ru/calendar-api']);
const markers = (text, regex) => (text.match(regex) || []).sort();
const validate = (source, translation) => {
  assert.ok(typeof translation === 'string' && translation.trim(), `Missing translation: ${source}`);
  for (const regex of [/<\/?[a-z][^>]*>/gi, /https:\/\/[^\s<>]+/g, /%(?:\d+\$)?[sd]/g, /<code>[\s\S]*?<\/code>/g]) {
    assert.deepEqual(markers(translation, regex), markers(source, regex), `Changed HTML, URL, code or placeholder: ${source}`);
  }
};
const document = (locale, project, entries, metadata) => [
  '# Translation of Georg-Kloster Slavonic Translator. GPL-2.0-or-later.',
  'msgid ""',
  `msgstr ${JSON.stringify(metadata.replace(/^Project-Id-Version:.*$/m, `Project-Id-Version: ${project}`).replace(/^Language:.*$/m, `Language: ${locale}`))}`,
  '',
  ...entries.flatMap(([source, translated]) => [`msgid ${JSON.stringify(source)}`, `msgstr ${JSON.stringify(translated)}`, '']),
].join('\n');

for (const locale of ['ru_RU', 'de_DE', 'uk', 'pl_PL']) {
  const catalog = readFileSync(`languages/georg-kloster-slavonic-translator-${locale}.po`, 'utf8');
  const metadata = JSON.parse(catalog.match(/^msgid ""\r?\nmsgstr (".+")/m)[1]);
  const strings = new Map([...catalog.matchAll(/^msgid (".+")\r?\nmsgstr (".+")/gm)].map((match) => [JSON.parse(match[1]), JSON.parse(match[2])]));
  const codeEntries = interfaceSource.map((source) => {
    const translation = strings.get(source) ?? (unchangedMetadata.has(source) ? source : undefined);
    validate(source, translation);
    return [source, translation];
  });
  writeFileSync(`${directory}/interface-${locale}.po`, document(locale, 'WordPress.org interface', codeEntries, metadata));
  if (process.argv.includes('--interface-only')) continue;
  const readmeTranslations = JSON.parse(readFileSync(`${directory}/readme-${locale}.json`, 'utf8'));
  assert.equal(readmeTranslations.length, readmeSource.length, `Incomplete readme: ${locale}`);
  const readmeEntries = readmeSource.map((source, index) => {
    const translation = readmeTranslations[index] ?? strings.get(source);
    validate(source, translation);
    return [source, translation];
  });
  writeFileSync(`${directory}/readme-${locale}.po`, document(locale, 'WordPress.org readme', readmeEntries, metadata));
}
console.log('WordPress.org catalogs generated and validated: 66 interface strings and 58 readme strings per locale.');
