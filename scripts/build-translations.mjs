import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const translations = {
  'Church Slavonic Translator': ['Церковнославянский переводчик', 'Kirchenslawischer Übersetzer'],
  'Settings': ['Настройки', 'Einstellungen'],
  'Shortcodes': ['Шорткоды', 'Shortcodes'],
  'Add one of these shortcodes in the Shortcode block or HTML block of the WordPress editor.': ['Добавьте один из этих шорткодов в блок «Шорткод» или HTML-блок редактора WordPress.', 'Fügen Sie einen dieser Shortcodes in den Shortcode-Block oder HTML-Block des WordPress-Editors ein.'],
  'Shortcode': ['Шорткод', 'Shortcode'],
  'What it does': ['Назначение', 'Funktion'],
  'Shows the standard Church Slavonic translation form with the default title.': ['Показывает стандартную форму церковнославянского переводчика с заголовком по умолчанию.', 'Zeigt das Standardformular des kirchenslawischen Übersetzers mit der Standardüberschrift.'],
  'Shows the same form with a custom heading. Replace the text inside title with your own heading.': ['Показывает ту же форму с собственным заголовком. Замените текст внутри title на свой.', 'Zeigt dasselbe Formular mit einer eigenen Überschrift. Ersetzen Sie den Text in title durch Ihre Überschrift.'],
  'Translate text into Church Slavonic using the Bible Desktop translation service.': ['Перевод текста на церковнославянский язык с помощью сервиса Bible Desktop.', 'Übersetzt Texte mit dem Übersetzungsdienst Bible Desktop ins Kirchenslawische.'],
  'Enter a valid Bible Desktop HTTPS URL.': ['Укажите корректный HTTPS-адрес Bible Desktop.', 'Geben Sie eine gültige HTTPS-Adresse von Bible Desktop ein.'],
  'Add the form with [wp_cu_translator]. The free tier works without a key; an optional key enables higher limits and always stays on the WordPress server.': ['Добавьте форму шорткодом [wp_cu_translator]. Бесплатный режим работает без ключа; необязательный ключ включает повышенные лимиты и всегда остаётся на сервере WordPress.', 'Fügen Sie das Formular mit [wp_cu_translator] hinzu. Der kostenlose Tarif funktioniert ohne Schlüssel; ein optionaler Schlüssel ermöglicht höhere Limits und bleibt immer auf dem WordPress-Server.'],
  'Bible Desktop URL': ['Адрес Bible Desktop', 'Bible-Desktop-Adresse'],
  'Example:': ['Например:', 'Beispiel:'],
  'Bible Desktop API key': ['Ключ Bible Desktop API', 'Bible Desktop API-Schlüssel'],
  'The key is saved. Leave the field empty to keep it.': ['Ключ сохранён. Оставьте поле пустым, чтобы не менять его.', 'Der Schlüssel ist gespeichert. Lassen Sie das Feld leer, um ihn beizubehalten.'],
  'Optional. Without a key, the plugin uses the free public tier. Add a key for higher limits.': ['Необязательно. Без ключа плагин использует бесплатный публичный режим. Добавьте ключ для повышенных лимитов.', 'Optional. Ohne Schlüssel verwendet das Plugin den kostenlosen öffentlichen Tarif. Fügen Sie für höhere Limits einen Schlüssel hinzu.'],
  'Delete the saved key': ['Удалить сохранённый ключ', 'Gespeicherten Schlüssel löschen'],
  'Timeout': ['Таймаут', 'Zeitüberschreitung'],
  'seconds': ['секунд', 'Sekunden'],
  'Save settings': ['Сохранить настройки', 'Einstellungen speichern'],
  'Check connection': ['Проверить соединение', 'Verbindung prüfen'],
  'The check does not send text to OpenAI and does not spend money.': ['Проверка не отправляет текст в OpenAI и не расходует деньги.', 'Die Prüfung sendet keinen Text an OpenAI und verursacht keine Kosten.'],
  'Insufficient permissions.': ['Недостаточно прав.', 'Unzureichende Berechtigungen.'],
  'Connection established. The Bible Desktop API is available.': ['Соединение установлено. Bible Desktop API доступен.', 'Verbindung hergestellt. Die Bible Desktop API ist verfügbar.'],
  'Could not connect: %s': ['Не удалось подключиться: %s', 'Verbindung fehlgeschlagen: %s'],
  'Church Slavonic Translator': ['Церковнославянский переводчик', 'Kirchenslawischer Übersetzer'],
  'Translating…': ['Переводим…', 'Übersetzung läuft…'],
  'Translation could not be completed.': ['Перевод не выполнен.', 'Die Übersetzung konnte nicht abgeschlossen werden.'],
  'Recognized as %s': ['Распознано как %s', 'Erkannt als %s'],
  'Ready — the result was loaded from cache.': ['Готово — результат взят из кэша.', 'Fertig — das Ergebnis wurde aus dem Cache geladen.'],
  'Ready.': ['Готово.', 'Fertig.'],
  'Copied': ['Скопировано', 'Kopiert'],
  'Could not copy': ['Не удалось скопировать', 'Kopieren fehlgeschlagen'],
  'Plain text copied': ['Скопирован обычный текст', 'Nur-Text wurde kopiert'],
  'Text to translate': ['Текст для перевода', 'Zu übersetzender Text'],
  'Enter Russian or German text': ['Введите русский или немецкий текст', 'Geben Sie russischen oder deutschen Text ein'],
  'Source language': ['Исходный язык', 'Ausgangssprache'],
  'Detect automatically': ['Определить автоматически', 'Automatisch erkennen'],
  'Russian': ['Русский', 'Russisch'],
  'German': ['Немецкий', 'Deutsch'],
  'Orthography': ['Написание', 'Orthografie'],
  'Accents': ['Ударения', 'Akzente'],
  'Titlo': ['Титла', 'Titlo'],
  'Breathings': ['Придыхания', 'Hauchzeichen'],
  'Slavonic numbers': ['Славянские числа', 'Slawische Zahlen'],
  'Translate': ['Перевести', 'Übersetzen'],
  'Copy text': ['Копировать текст', 'Text kopieren'],
  'Copy with formatting': ['Копировать с форматированием', 'Mit Formatierung kopieren'],
  'Download font': ['Скачать шрифт', 'Schriftart herunterladen'],
  'After downloading, open MonomakhUnicode.ttf and click Install. If Word does not select it automatically, select the pasted text and assign Monomakh Unicode manually.': ['После скачивания откройте файл MonomakhUnicode.ttf и нажмите «Установить». Если Word не выберет шрифт автоматически, выделите текст и назначьте Monomakh Unicode вручную.', 'Öffnen Sie nach dem Herunterladen MonomakhUnicode.ttf und klicken Sie auf „Installieren“. Falls Word die Schriftart nicht automatisch auswählt, markieren Sie den eingefügten Text und weisen Sie Monomakh Unicode manuell zu.'],
  'Enter text to translate.': ['Введите текст для перевода.', 'Geben Sie einen Text zum Übersetzen ein.'],
  'The selected source language is not supported.': ['Выбранный исходный язык не поддерживается.', 'Die ausgewählte Ausgangssprache wird nicht unterstützt.'],
  'The text is too long.': ['Текст слишком длинный.', 'Der Text ist zu lang.'],
  'Could not connect to Bible Desktop.': ['Не удалось подключиться к Bible Desktop.', 'Die Verbindung zu Bible Desktop konnte nicht hergestellt werden.'],
  'The Bible Desktop API key is invalid.': ['Ключ Bible Desktop API недействителен.', 'Der Bible Desktop API-Schlüssel ist ungültig.'],
  'Check the entered text and translation settings.': ['Проверьте введённый текст и настройки перевода.', 'Prüfen Sie den eingegebenen Text und die Übersetzungseinstellungen.'],
  'The translation request limit has been reached. Please try again later.': ['Достигнут лимит запросов на перевод. Попробуйте позже.', 'Das Limit für Übersetzungsanfragen wurde erreicht. Bitte versuchen Sie es später erneut.'],
  'The higher translation limit has been reached. Please try again later.': ['Достигнут повышенный лимит переводов. Попробуйте снова позже.', 'Das erhöhte Übersetzungslimit wurde erreicht. Versuchen Sie es später erneut.'],
  'The free daily limit has been reached. Add an API key for higher limits or try again after the reset.': ['Достигнут бесплатный суточный лимит. Добавьте API-ключ для повышенных лимитов или повторите после сброса.', 'Das kostenlose Tageslimit wurde erreicht. Fügen Sie für höhere Limits einen API-Schlüssel hinzu oder versuchen Sie es nach dem Zurücksetzen erneut.'],
  'The translation service is temporarily unavailable.': ['Сервис перевода временно недоступен.', 'Der Übersetzungsdienst ist vorübergehend nicht verfügbar.'],
  'Bible Desktop returned HTTP error %d.': ['Bible Desktop вернул ошибку HTTP %d.', 'Bible Desktop hat den HTTP-Fehler %d zurückgegeben.'],
};

const locales = {
  ru_RU: { index: 0, plural: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);' },
  de_DE: { index: 1, plural: 'nplurals=2; plural=(n != 1);' },
};

const escapePo = (value) => JSON.stringify(value);

function metadata(locale, plural) {
  return [
    'Project-Id-Version: Church Slavonic Translator 1.0.4',
    'Report-Msgid-Bugs-To: https://github.com/VAtapin/wp_cu_translator/issues',
    'POT-Creation-Date: 2026-09-17 00:00+0000',
    'PO-Revision-Date: 2026-09-17 00:00+0000',
    'Language: ' + locale,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'Plural-Forms: ' + plural,
    'X-Domain: church-slavonic-translator',
    '',
  ].join('\n');
}

function poDocument(locale, index, plural) {
  const lines = [
    'msgid ""',
    `msgstr ${escapePo(metadata(locale, plural))}`,
    '',
  ];
  for (const [msgid, values] of Object.entries(translations)) {
    lines.push(`msgid ${escapePo(msgid)}`, `msgstr ${escapePo(values[index])}`, '');
  }
  return lines.join('\n');
}

function potDocument() {
  const lines = [
    'msgid ""',
    `msgstr ${escapePo(metadata('LANGUAGE', 'nplurals=INTEGER; plural=EXPRESSION;'))}`,
    '',
  ];
  for (const msgid of Object.keys(translations)) {
    lines.push(`msgid ${escapePo(msgid)}`, 'msgstr ""', '');
  }
  return lines.join('\n');
}

function moBuffer(locale, index, plural) {
  const entries = [['', metadata(locale, plural)], ...Object.entries(translations).map(([msgid, values]) => [msgid, values[index]])]
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
  const originals = entries.map(([msgid]) => Buffer.from(msgid, 'utf8'));
  const translated = entries.map(([, msgstr]) => Buffer.from(msgstr, 'utf8'));
  const count = entries.length;
  const originalTableOffset = 28;
  const translationTableOffset = originalTableOffset + count * 8;
  let stringOffset = translationTableOffset + count * 8;
  const originalOffsets = originals.map((value) => {
    const current = stringOffset;
    stringOffset += value.length + 1;
    return current;
  });
  const translationOffsets = translated.map((value) => {
    const current = stringOffset;
    stringOffset += value.length + 1;
    return current;
  });
  const output = Buffer.alloc(stringOffset);
  output.writeUInt32LE(0x950412de, 0);
  output.writeUInt32LE(0, 4);
  output.writeUInt32LE(count, 8);
  output.writeUInt32LE(originalTableOffset, 12);
  output.writeUInt32LE(translationTableOffset, 16);
  output.writeUInt32LE(0, 20);
  output.writeUInt32LE(0, 24);
  originals.forEach((value, indexValue) => {
    output.writeUInt32LE(value.length, originalTableOffset + indexValue * 8);
    output.writeUInt32LE(originalOffsets[indexValue], originalTableOffset + indexValue * 8 + 4);
    value.copy(output, originalOffsets[indexValue]);
  });
  translated.forEach((value, indexValue) => {
    output.writeUInt32LE(value.length, translationTableOffset + indexValue * 8);
    output.writeUInt32LE(translationOffsets[indexValue], translationTableOffset + indexValue * 8 + 4);
    value.copy(output, translationOffsets[indexValue]);
  });
  return output;
}

const source = readFileSync(resolve('church-slavonic-translator.php'), 'utf8');
const extracted = new Set([...source.matchAll(/(?:__|esc_html__|esc_attr__)\(\s*'([^']+)'/g)].map((match) => match[1]));
for (const required of ['Church Slavonic Translator', 'Translate text into Church Slavonic using the Bible Desktop translation service.']) extracted.add(required);
const missing = [...extracted].filter((msgid) => !Object.hasOwn(translations, msgid));
const stale = Object.keys(translations).filter((msgid) => !extracted.has(msgid));
if (missing.length || stale.length) {
  throw new Error(`Translation catalog mismatch. Missing: ${missing.join(' | ') || '-'}; stale: ${stale.join(' | ') || '-'}`);
}

mkdirSync(resolve('languages'), { recursive: true });
writeFileSync(resolve('languages/church-slavonic-translator.pot'), potDocument());
for (const [locale, details] of Object.entries(locales)) {
  writeFileSync(resolve(`languages/church-slavonic-translator-${locale}.po`), poDocument(locale, details.index, details.plural));
  writeFileSync(resolve(`languages/church-slavonic-translator-${locale}.mo`), moBuffer(locale, details.index, details.plural));
}

console.log(`Generated ${Object.keys(translations).length} translations for ${Object.keys(locales).join(', ')}.`);
