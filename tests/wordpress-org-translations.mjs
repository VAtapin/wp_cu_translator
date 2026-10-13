import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const generator = resolve('scripts/build-wordpress-org-translations.mjs');
const originals = [...readFileSync('translations/wordpress-org/readme-source.pot', 'utf8').matchAll(/^msgid (".+")\r?$/gm)].map(match => JSON.parse(match[1]));
const entry = 'Redesign the responsive translation form with the approved Georg-Kloster logo, a separate options panel and clearer translation results.';
const index = originals.indexOf(entry);
assert.ok(index >= 0);
const catalogs = () => Object.fromEntries(readdirSync('translations/wordpress-org').filter(name => name.endsWith('.po')).map(name => [name, readFileSync(join('translations/wordpress-org', name), 'utf8')]));
const before = catalogs();
const generated = spawnSync(process.execPath, [generator], { encoding: 'utf8' });
assert.equal(generated.status, 0, generated.stderr);
assert.deepEqual(catalogs(), before, 'WordPress.org catalogs must be reproducible.');

for (const locale of [null, 'ru_RU', 'de_DE', 'uk', 'pl_PL']) {
  const directory = mkdtempSync(join(tmpdir(), 'translator-changelog-'));
  cpSync('languages', join(directory, 'languages'), { recursive: true });
  cpSync('translations', join(directory, 'translations'), { recursive: true });
  cpSync('readme.txt', join(directory, 'readme.txt'));
  if (locale === null) {
    const file = join(directory, 'readme.txt');
    writeFileSync(file, readFileSync(file, 'utf8').replace('== Changelog ==', '== Changelog ==\n\n* A new release entry without translations.'));
  } else {
    const file = join(directory, `translations/wordpress-org/readme-${locale}.json`);
    const translations = JSON.parse(readFileSync(file, 'utf8'));
    translations[index] = '';
    writeFileSync(file, JSON.stringify(translations));
  }
  const result = spawnSync(process.execPath, [generator], { cwd: directory, encoding: 'utf8' });
  assert.notEqual(result.status, 0, `Missing changelog translation must fail: ${locale ?? 'source'}`);
  assert.ok(result.stderr.includes(locale === null ? 'Changelog entry missing from translation source' : 'Missing translation:'), result.stderr);
}
console.log('WordPress.org catalogs reproduce; new changelog entries and missing translations in all four locales block release.');
