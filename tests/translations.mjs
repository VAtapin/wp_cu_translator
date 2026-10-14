import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const generator = readFileSync('scripts/build-translations.mjs', 'utf8');
const source = readFileSync('georg-kloster-slavonic-translator.php', 'utf8');
const catalogs = () => Object.fromEntries(readdirSync('languages').map((name) => [name, readFileSync(join('languages', name)).toString('base64')]));
const before = catalogs();
const generated = spawnSync(process.execPath, ['scripts/build-translations.mjs'], { encoding: 'utf8' });
assert.equal(generated.status, 0, generated.stderr);
assert.deepEqual(catalogs(), before, 'Committed translation catalogs must be reproducible.');

// The German default locale uses informal address; plugin names stay unchanged.
const german = readFileSync('languages/georg-kloster-slavonic-translator-de_DE.po', 'utf8');
const germanStrings = new Map([...german.matchAll(/^msgid (".+")\r?\nmsgstr (".+")/gm)].map(match => [JSON.parse(match[1]), JSON.parse(match[2])]));
assert.equal(germanStrings.get('Georg-Kloster Slavonic Translator'), 'Georg-Kloster Slavonic Translator');
for (const translation of germanStrings.values()) {
  assert.doesNotMatch(translation, /\b(?:Sie|Ihr|Ihre|Ihren|Ihrem|Ihres)\b/, 'de_DE must use informal address.');
}
for (const translation of JSON.parse(readFileSync('translations/wordpress-org/readme-de_DE.json', 'utf8')).filter(Boolean)) {
  assert.doesNotMatch(translation, /\b(?:Sie|Ihr|Ihre|Ihren|Ihrem|Ihres)\b/, 'German readme must use informal address.');
}

for (const [name, modifiedSource, modifiedGenerator, error] of [
  ['source-language', source.replace('Church Slavonic translation', 'Перевод'), generator, 'Plugin source must use English'],
  ['placeholder', source, generator.replace('Не удалось подключиться: %s', 'Не удалось подключиться: %d'), 'mismatched placeholders'],
  ['missing-language', source, generator.replace("'Ваш текст надсилається до налаштованого сервісу Bible Desktop і може оброблятися OpenAI.'", "''"), 'Empty translation'],
]) {
  const directory = mkdtempSync(join(tmpdir(), `translator-${name}-`));
  writeFileSync(join(directory, 'georg-kloster-slavonic-translator.php'), modifiedSource);
  cpSync('includes', join(directory, 'includes'), { recursive: true });
  writeFileSync(join(directory, 'build-translations.mjs'), modifiedGenerator);
  const result = spawnSync(process.execPath, [resolve(directory, 'build-translations.mjs')], { cwd: directory, encoding: 'utf8' });
  assert.notEqual(result.status, 0, `${name} must fail the release check.`);
  assert.ok(result.stderr.includes(error), result.stderr);
}
console.log('Translation catalogs reproduce exactly; non-English source, invalid placeholders and empty translations are rejected.');
