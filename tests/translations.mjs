import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const generator = readFileSync('scripts/build-translations.mjs', 'utf8');
const source = readFileSync('georg-kloster-slavonic-translator.php', 'utf8');
const catalogs = () => Object.fromEntries(readdirSync('languages').map((name) => [name, readFileSync(join('languages', name)).toString('base64')]));
const before = catalogs();
const generated = spawnSync(process.execPath, ['scripts/build-translations.mjs'], { encoding: 'utf8' });
assert.equal(generated.status, 0, generated.stderr);
assert.deepEqual(catalogs(), before, 'Committed translation catalogs must be reproducible.');

for (const [name, modifiedSource, modifiedGenerator, error] of [
  ['source-language', source.replace('Church Slavonic translation', 'Перевод'), generator, 'Plugin source must use English'],
  ['placeholder', source, generator.replace('Не удалось подключиться: %s', 'Не удалось подключиться: %d'), 'mismatched placeholders'],
  ['missing-language', source, generator.replace("'Ваш текст надсилається до налаштованого сервісу Bible Desktop і може оброблятися OpenAI.'", "''"), 'Empty translation'],
]) {
  const directory = mkdtempSync(join(tmpdir(), `translator-${name}-`));
  writeFileSync(join(directory, 'georg-kloster-slavonic-translator.php'), modifiedSource);
  writeFileSync(join(directory, 'build-translations.mjs'), modifiedGenerator);
  const result = spawnSync(process.execPath, [resolve(directory, 'build-translations.mjs')], { cwd: directory, encoding: 'utf8' });
  assert.notEqual(result.status, 0, `${name} must fail the release check.`);
  assert.ok(result.stderr.includes(error), result.stderr);
}
console.log('Translation catalogs reproduce exactly; non-English source, invalid placeholders and empty translations are rejected.');
