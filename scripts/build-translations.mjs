import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const translations = {
  'Your text is sent to the configured Bible Desktop service and may be processed by OpenAI.': ['Ваш текст отправляется в настроенный сервис Bible Desktop и может обрабатываться OpenAI.', 'Dein Text wird an den konfigurierten Bible-Desktop-Dienst gesendet und kann von OpenAI verarbeitet werden.'],
  'Terms of Service': ['Условия использования', 'Nutzungsbedingungen'],
  'Privacy Policy': ['Политика конфиденциальности', 'Datenschutzerklärung'],
  'Georg-Kloster Slavonic Translator': ['Georg-Kloster — Церковнославянский переводчик', 'Georg-Kloster Slavonic Translator'],
  'Settings': ['Настройки', 'Einstellungen'],
  'Shortcodes': ['Шорткоды', 'Shortcodes'],
  'Add one of these shortcodes in the Shortcode block or HTML block of the WordPress editor.': ['Добавьте один из этих шорткодов в блок «Шорткод» или HTML-блок редактора WordPress.', 'Füge einen dieser Shortcodes in den Shortcode-Block oder HTML-Block des WordPress-Editors ein.'],
  'Shortcode': ['Шорткод', 'Shortcode'],
  'What it does': ['Назначение', 'Funktion'],
  'Shows the standard Church Slavonic translation form with the default title.': ['Показывает стандартную форму церковнославянского переводчика с заголовком по умолчанию.', 'Zeigt das Standardformular des kirchenslawischen Übersetzers mit der Standardüberschrift.'],
  'Shows the same form with a custom heading. Replace the text inside title with your own heading.': ['Показывает ту же форму с собственным заголовком. Замените текст внутри title на свой.', 'Zeigt dasselbe Formular mit einer eigenen Überschrift. Ersetze den Text in title durch deine Überschrift.'],
  'Translate text into Church Slavonic and search its dictionary through Bible Desktop.': ['Перевод текста на церковнославянский язык и поиск в словаре через Bible Desktop.', 'Übersetzt Texte in das Kirchenslawische und durchsucht das Wörterbuch über Bible Desktop.'],
  'Enter a valid Bible Desktop HTTPS URL.': ['Укажите корректный HTTPS-адрес Bible Desktop.', 'Gib eine gültige HTTPS-Adresse von Bible Desktop ein.'],
  'Add the form with [wp_cu_translator]. The free tier works without a key; an optional key enables higher limits and always stays on the WordPress server.': ['Добавьте форму шорткодом [wp_cu_translator]. Бесплатный режим работает без ключа; необязательный ключ включает повышенные лимиты и всегда остаётся на сервере WordPress.', 'Füge das Formular mit [wp_cu_translator] hinzu. Der kostenlose Tarif funktioniert ohne Schlüssel; ein optionaler Schlüssel ermöglicht höhere Limits und bleibt immer auf dem WordPress-Server.'],
  'Bible Desktop URL': ['Адрес Bible Desktop', 'Bible-Desktop-Adresse'],
  'Example:': ['Например:', 'Beispiel:'],
  'Bible Desktop API key': ['Ключ Bible Desktop API', 'API-Schlüssel von Bible Desktop'],
  'The key is saved. Leave the field empty to keep it.': ['Ключ сохранён. Оставьте поле пустым, чтобы не менять его.', 'Der Schlüssel ist gespeichert. Lass das Feld leer, um ihn beizubehalten.'],
  'Optional. Without a key, the plugin uses the free public tier. Add a key for higher limits.': ['Необязательно. Без ключа плагин использует бесплатный публичный режим. Добавьте ключ для повышенных лимитов.', 'Optional. Ohne Schlüssel verwendet das Plugin den kostenlosen öffentlichen Tarif. Füge für höhere Limits einen Schlüssel hinzu.'],
  'Delete the saved key': ['Удалить сохранённый ключ', 'Gespeicherten Schlüssel löschen'],
  'Timeout': ['Таймаут', 'Zeitüberschreitung'],
  'seconds': ['секунд', 'Sekunden'],
  'Save settings': ['Сохранить настройки', 'Einstellungen speichern'],
  'Check connection': ['Проверить соединение', 'Verbindung prüfen'],
  'The check does not send text to OpenAI and does not spend money.': ['Проверка не отправляет текст в OpenAI и не расходует деньги.', 'Die Prüfung sendet keinen Text an OpenAI und verursacht keine Kosten.'],
  'Insufficient permissions.': ['Недостаточно прав.', 'Unzureichende Berechtigungen.'],
  'Connection established. The Bible Desktop API is available.': ['Соединение установлено. Bible Desktop API доступен.', 'Verbindung hergestellt. Die API von Bible Desktop ist verfügbar.'],
  'Could not connect: %s': ['Не удалось подключиться: %s', 'Verbindung fehlgeschlagen: %s'],
  'Translating…': ['Переводим…', 'Übersetzung läuft…'],
  'Translation could not be completed.': ['Перевод не выполнен.', 'Die Übersetzung konnte nicht abgeschlossen werden.'],
  'Recognized as %s': ['Распознано как %s', 'Erkannt als %s'],
  'Ready — the result was loaded from cache.': ['Готово — результат взят из кэша.', 'Fertig – das Ergebnis wurde aus dem Cache geladen.'],
  'Ready.': ['Готово.', 'Fertig.'],
  'Copied': ['Скопировано', 'Kopiert'],
  'Could not copy': ['Не удалось скопировать', 'Kopieren fehlgeschlagen'],
  'Plain text copied': ['Скопирован обычный текст', 'Unformatierter Text kopiert'],
  'Text to translate': ['Текст для перевода', 'Zu übersetzender Text'],
  'Enter Russian or German text': ['Введите русский или немецкий текст', 'Gib russischen oder deutschen Text ein'],
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
  'After downloading, open MonomakhUnicode.ttf and click Install. If Word does not select it automatically, select the pasted text and assign Monomakh Unicode manually.': ['После скачивания откройте файл MonomakhUnicode.ttf и нажмите «Установить». Если Word не выберет шрифт автоматически, выделите текст и назначьте Monomakh Unicode вручную.', 'Öffne nach dem Herunterladen MonomakhUnicode.ttf und klicke auf „Installieren“. Falls Word die Schriftart nicht automatisch auswählt, markiere den eingefügten Text und weise Monomakh Unicode manuell zu.'],
  'Enter text to translate.': ['Введите текст для перевода.', 'Gib einen Text zum Übersetzen ein.'],
  'The selected source language is not supported.': ['Выбранный исходный язык не поддерживается.', 'Die ausgewählte Ausgangssprache wird nicht unterstützt.'],
  'The text is too long.': ['Текст слишком длинный.', 'Der Text ist zu lang.'],
  'Could not connect to Bible Desktop.': ['Не удалось подключиться к Bible Desktop.', 'Die Verbindung zu Bible Desktop konnte nicht hergestellt werden.'],
  'The Bible Desktop API key is invalid.': ['Ключ Bible Desktop API недействителен.', 'Der API-Schlüssel von Bible Desktop ist ungültig.'],
  'Check the entered text and translation settings.': ['Проверьте введённый текст и настройки перевода.', 'Prüfe den eingegebenen Text und die Übersetzungseinstellungen.'],
  'The translation request limit has been reached. Please try again later.': ['Достигнут лимит запросов на перевод. Попробуйте позже.', 'Das Limit für Übersetzungsanfragen wurde erreicht. Bitte versuche es später erneut.'],
  'The higher translation limit has been reached. Please try again later.': ['Достигнут повышенный лимит переводов. Попробуйте снова позже.', 'Das erhöhte Übersetzungslimit wurde erreicht. Versuche es später erneut.'],
  'The free daily limit has been reached. Add an API key for higher limits or try again after the reset.': ['Достигнут бесплатный суточный лимит. Добавьте API-ключ для повышенных лимитов или повторите после сброса.', 'Das kostenlose Tageslimit wurde erreicht. Füge für höhere Limits einen API-Schlüssel hinzu oder versuche es nach dem Zurücksetzen erneut.'],
  'The translation service is temporarily unavailable.': ['Сервис перевода временно недоступен.', 'Der Übersetzungsdienst ist vorübergehend nicht verfügbar.'],
  'Bible Desktop returned HTTP error %d.': ['Bible Desktop вернул ошибку HTTP %d.', 'Bible Desktop hat den HTTP-Fehler %d zurückgegeben.'],
};

const additionalTranslations = {
  'Your text is sent to the configured Bible Desktop service and may be processed by OpenAI.': ['Ваш текст надсилається до налаштованого сервісу Bible Desktop і може оброблятися OpenAI.', 'Twój tekst jest wysyłany do skonfigurowanej usługi Bible Desktop i może być przetwarzany przez OpenAI.'],
  'Terms of Service': ['Умови використання', 'Warunki korzystania'],
  'Privacy Policy': ['Політика конфіденційності', 'Polityka prywatności'],
  'Georg-Kloster Slavonic Translator': ['Georg-Kloster — Церковнослов’янський перекладач', 'Georg-Kloster — Tłumacz cerkiewnosłowiański'],
  'Settings': ['Налаштування', 'Ustawienia'],
  'Shortcodes': ['Шорткоди', 'Shortcode'],
  'Add one of these shortcodes in the Shortcode block or HTML block of the WordPress editor.': ['Додайте один із цих шорткодів до блоку «Шорткод» або HTML-блоку редактора WordPress.', 'Dodaj jeden z tych shortcode’ów w bloku Shortcode lub bloku HTML edytora WordPress.'],
  'Shortcode': ['Шорткод', 'Shortcode'],
  'What it does': ['Призначення', 'Działanie'],
  'Shows the standard Church Slavonic translation form with the default title.': ['Показує стандартну форму церковнослов’янського перекладу із заголовком за замовчуванням.', 'Wyświetla standardowy formularz tłumaczenia na język cerkiewnosłowiański z domyślnym tytułem.'],
  'Shows the same form with a custom heading. Replace the text inside title with your own heading.': ['Показує ту саму форму з власним заголовком. Замініть текст у title на свій заголовок.', 'Wyświetla ten sam formularz z własnym nagłówkiem. Zastąp tekst w title swoim nagłówkiem.'],
  'Translate text into Church Slavonic and search its dictionary through Bible Desktop.': ['Переклад тексту церковнослов’янською мовою та пошук у словнику через Bible Desktop.', 'Tłumacz tekst na język cerkiewnosłowiański i przeszukuj słownik za pomocą Bible Desktop.'],
  'Enter a valid Bible Desktop HTTPS URL.': ['Вкажіть коректну HTTPS-адресу Bible Desktop.', 'Wprowadź prawidłowy adres HTTPS Bible Desktop.'],
  'Add the form with [wp_cu_translator]. The free tier works without a key; an optional key enables higher limits and always stays on the WordPress server.': ['Додайте форму за допомогою [wp_cu_translator]. Безкоштовний режим працює без ключа; необов’язковий ключ збільшує ліміти й завжди залишається на сервері WordPress.', 'Dodaj formularz za pomocą [wp_cu_translator]. Bezpłatny tryb działa bez klucza; opcjonalny klucz zwiększa limity i zawsze pozostaje na serwerze WordPress.'],
  'Bible Desktop URL': ['Адреса Bible Desktop', 'Adres Bible Desktop'],
  'Example:': ['Наприклад:', 'Przykład:'],
  'Bible Desktop API key': ['Ключ API Bible Desktop', 'Klucz API Bible Desktop'],
  'The key is saved. Leave the field empty to keep it.': ['Ключ збережено. Залиште поле порожнім, щоб зберегти його.', 'Klucz został zapisany. Pozostaw pole puste, aby go zachować.'],
  'Optional. Without a key, the plugin uses the free public tier. Add a key for higher limits.': ['Необов’язково. Без ключа плагін використовує безкоштовний публічний режим. Додайте ключ для збільшення лімітів.', 'Opcjonalnie. Bez klucza wtyczka korzysta z bezpłatnego trybu publicznego. Dodaj klucz, aby zwiększyć limity.'],
  'Delete the saved key': ['Видалити збережений ключ', 'Usuń zapisany klucz'],
  'Timeout': ['Час очікування', 'Limit czasu'],
  'seconds': ['секунд', 'sekund'],
  'Save settings': ['Зберегти налаштування', 'Zapisz ustawienia'],
  'Check connection': ['Перевірити з’єднання', 'Sprawdź połączenie'],
  'The check does not send text to OpenAI and does not spend money.': ['Перевірка не надсилає текст до OpenAI й не витрачає кошти.', 'Sprawdzenie nie wysyła tekstu do OpenAI i nie powoduje kosztów.'],
  'Insufficient permissions.': ['Недостатньо прав.', 'Brak wymaganych uprawnień.'],
  'Connection established. The Bible Desktop API is available.': ['З’єднання встановлено. API Bible Desktop доступний.', 'Połączenie nawiązane. API Bible Desktop jest dostępne.'],
  'Could not connect: %s': ['Не вдалося підключитися: %s', 'Nie udało się połączyć: %s'],
  'Translating…': ['Перекладаємо…', 'Tłumaczenie…'],
  'Translation could not be completed.': ['Не вдалося завершити переклад.', 'Nie udało się ukończyć tłumaczenia.'],
  'Recognized as %s': ['Розпізнано як %s', 'Rozpoznano jako %s'],
  'Ready — the result was loaded from cache.': ['Готово — результат завантажено з кешу.', 'Gotowe — wynik został wczytany z pamięci podręcznej.'],
  'Ready.': ['Готово.', 'Gotowe.'],
  'Copied': ['Скопійовано', 'Skopiowano'],
  'Could not copy': ['Не вдалося скопіювати', 'Nie udało się skopiować'],
  'Plain text copied': ['Скопійовано звичайний текст', 'Skopiowano zwykły tekst'],
  'Text to translate': ['Текст для перекладу', 'Tekst do przetłumaczenia'],
  'Enter Russian or German text': ['Введіть російський або німецький текст', 'Wprowadź tekst rosyjski lub niemiecki'],
  'Source language': ['Мова оригіналу', 'Język źródłowy'],
  'Detect automatically': ['Визначити автоматично', 'Wykryj automatycznie'],
  'Russian': ['Російська', 'Rosyjski'],
  'German': ['Німецька', 'Niemiecki'],
  'Orthography': ['Правопис', 'Ortografia'],
  'Accents': ['Наголоси', 'Akcenty'],
  'Titlo': ['Титла', 'Titła'],
  'Breathings': ['Придихи', 'Przydechy'],
  'Slavonic numbers': ['Слов’янські числа', 'Liczby słowiańskie'],
  'Translate': ['Перекласти', 'Przetłumacz'],
  'Copy text': ['Копіювати текст', 'Kopiuj tekst'],
  'Copy with formatting': ['Копіювати з форматуванням', 'Kopiuj z formatowaniem'],
  'Download font': ['Завантажити шрифт', 'Pobierz czcionkę'],
  'After downloading, open MonomakhUnicode.ttf and click Install. If Word does not select it automatically, select the pasted text and assign Monomakh Unicode manually.': ['Після завантаження відкрийте MonomakhUnicode.ttf і натисніть «Встановити». Якщо Word не вибере шрифт автоматично, виділіть вставлений текст і призначте Monomakh Unicode вручну.', 'Po pobraniu otwórz MonomakhUnicode.ttf i kliknij Zainstaluj. Jeśli Word nie wybierze czcionki automatycznie, zaznacz wklejony tekst i ręcznie przypisz Monomakh Unicode.'],
  'Enter text to translate.': ['Введіть текст для перекладу.', 'Wprowadź tekst do przetłumaczenia.'],
  'The selected source language is not supported.': ['Вибрана мова оригіналу не підтримується.', 'Wybrany język źródłowy nie jest obsługiwany.'],
  'The text is too long.': ['Текст надто довгий.', 'Tekst jest zbyt długi.'],
  'Could not connect to Bible Desktop.': ['Не вдалося підключитися до Bible Desktop.', 'Nie udało się połączyć z Bible Desktop.'],
  'The Bible Desktop API key is invalid.': ['Ключ API Bible Desktop недійсний.', 'Klucz API Bible Desktop jest nieprawidłowy.'],
  'Check the entered text and translation settings.': ['Перевірте введений текст і налаштування перекладу.', 'Sprawdź wprowadzony tekst i ustawienia tłumaczenia.'],
  'The translation request limit has been reached. Please try again later.': ['Досягнуто ліміту запитів на переклад. Спробуйте пізніше.', 'Osiągnięto limit żądań tłumaczenia. Spróbuj ponownie później.'],
  'The higher translation limit has been reached. Please try again later.': ['Досягнуто збільшеного ліміту перекладів. Спробуйте пізніше.', 'Osiągnięto podwyższony limit tłumaczeń. Spróbuj ponownie później.'],
  'The free daily limit has been reached. Add an API key for higher limits or try again after the reset.': ['Досягнуто безкоштовного добового ліміту. Додайте ключ API для збільшення лімітів або повторіть після скидання.', 'Osiągnięto bezpłatny limit dzienny. Dodaj klucz API, aby zwiększyć limity, lub spróbuj ponownie po ich zresetowaniu.'],
  'The translation service is temporarily unavailable.': ['Сервіс перекладу тимчасово недоступний.', 'Usługa tłumaczenia jest tymczasowo niedostępna.'],
  'Bible Desktop returned HTTP error %d.': ['Bible Desktop повернув помилку HTTP %d.', 'Bible Desktop zwrócił błąd HTTP %d.'],
};
for (const [msgid, values] of Object.entries(translations)) {
  if (!additionalTranslations[msgid] || additionalTranslations[msgid].length !== 2) {
    throw new Error(`Missing Ukrainian/Polish translations: ${msgid}`);
  }
  values.push(...additionalTranslations[msgid]);
}

Object.assign(translations, {
  "Searching…": [
    "Ищем…",
    "Suche läuft…",
    "Шукаємо…",
    "Wyszukiwanie…"
  ],
  "The dictionary service is temporarily unavailable.": [
    "Словарный сервис временно недоступен.",
    "Der Wörterbuchdienst ist vorübergehend nicht verfügbar.",
    "Словниковий сервіс тимчасово недоступний.",
    "Usługa słownika jest tymczasowo niedostępna."
  ],
  "No matching entries found.": [
    "Подходящие статьи не найдены.",
    "Keine passenden Einträge gefunden.",
    "Відповідних статей не знайдено.",
    "Nie znaleziono pasujących haseł."
  ],
  "Copy word": [
    "Копировать слово",
    "Wort kopieren",
    "Копіювати слово",
    "Kopiuj słowo"
  ],
  "Read the source": [
    "Читать источник",
    "Quelle lesen",
    "Читати джерело",
    "Czytaj źródło"
  ],
  "Use in translator": [
    "Вставить в переводчик",
    "Im Übersetzer verwenden",
    "Вставити в перекладач",
    "Użyj w tłumaczu"
  ],
  "Select a word in the translation first.": [
    "Сначала выделите слово в переводе.",
    "Wähle zuerst ein Wort in der Übersetzung aus.",
    "Спочатку виділіть слово в перекладі.",
    "Najpierw zaznacz słowo w tłumaczeniu."
  ],
  "Look up selected word": [
    "Найти выделенное слово",
    "Ausgewähltes Wort nachschlagen",
    "Знайти виділене слово",
    "Wyszukaj zaznaczone słowo"
  ],
  "Language tools": [
    "Языковые инструменты",
    "Sprachwerkzeuge",
    "Мовні інструменти",
    "Narzędzia językowe"
  ],
  "Translator": [
    "Переводчик",
    "Übersetzer",
    "Перекладач",
    "Tłumacz"
  ],
  "Dictionary": [
    "Словарь",
    "Wörterbuch",
    "Словник",
    "Słownik"
  ],
  "Church Slavonic dictionary": [
    "Церковнославянский словарь",
    "Kirchenslawisches Wörterbuch",
    "Церковнослов’янський словник",
    "Słownik cerkiewnosłowiański"
  ],
  "Word or Russian meaning": [
    "Слово или русское значение",
    "Wort oder russische Bedeutung",
    "Слово або російське значення",
    "Słowo lub znaczenie po rosyjsku"
  ],
  "Search in": [
    "Искать по",
    "Suchen in",
    "Шукати за",
    "Szukaj według"
  ],
  "Church Slavonic word": [
    "Церковнославянское слово",
    "Kirchenslawisches Wort",
    "Церковнослов’янське слово",
    "Słowo cerkiewnosłowiańskie"
  ],
  "Russian meaning": [
    "Русское значение",
    "Russische Bedeutung",
    "Російське значення",
    "Znaczenie po rosyjsku"
  ],
  "Alphabet": [
    "Алфавит",
    "Alphabet",
    "Абетка",
    "Alfabet"
  ],
  "All letters": [
    "Все буквы",
    "Alle Buchstaben",
    "Усі літери",
    "Wszystkie litery"
  ],
  "Search with or without accents. Definitions are in Russian; a meaning match is not a sentence translation.": [
    "Ищите с ударениями или без них. Толкования — на русском; совпадение по значению не является переводом предложения.",
    "Suche mit oder ohne Akzente. Definitionen sind auf Russisch; ein Bedeutungstreffer ist keine Satzübersetzung.",
    "Шукайте з наголосами або без них. Тлумачення — російською; збіг за значенням не є перекладом речення.",
    "Szukaj z akcentami lub bez nich. Definicje są po rosyjsku; dopasowanie znaczenia nie jest tłumaczeniem zdania."
  ],
  "Search": [
    "Найти",
    "Suchen",
    "Знайти",
    "Szukaj"
  ],
  "Dictionary searches are sent to the configured Bible Desktop service. Entries retain their original spelling and source attribution.": [
    "Словарные запросы отправляются в настроенный сервис Bible Desktop. Статьи сохраняют исходное написание и указание источника.",
    "Wörterbuchanfragen werden an den konfigurierten Bible-Desktop-Dienst gesendet. Die Einträge behalten ihre Originalschreibung und Quellenangabe.",
    "Словникові запити надсилаються до налаштованого сервісу Bible Desktop. Статті зберігають оригінальне написання та посилання на джерело.",
    "Zapytania słownikowe są wysyłane do skonfigurowanej usługi Bible Desktop. Hasła zachowują oryginalną pisownię i wskazanie źródła."
  ],
  "Load more": [
    "Показать ещё",
    "Mehr laden",
    "Показати ще",
    "Pokaż więcej"
  ],
  "Check the dictionary search parameters.": [
    "Проверьте параметры поиска в словаре.",
    "Prüfe die Wörterbuch-Suchparameter.",
    "Перевірте параметри пошуку в словнику.",
    "Sprawdź parametry wyszukiwania w słowniku."
  ],
  "Too many dictionary requests. Please try again later.": [
    "Слишком много словарных запросов. Попробуйте позже.",
    "Zu viele Wörterbuchanfragen. Versuche es später erneut.",
    "Забагато словникових запитів. Спробуйте пізніше.",
    "Zbyt wiele zapytań słownikowych. Spróbuj ponownie później."
  ],
  "Shows only the translation form, without the dictionary tab.": [
    "Показывает только форму перевода без вкладки словаря.",
    "Zeigt nur das Übersetzungsformular ohne Wörterbuch-Tab.",
    "Показує лише форму перекладу без вкладки словника.",
    "Wyświetla tylko formularz tłumaczenia bez karty słownika."
  ],
  "Shows the standalone Church Slavonic dictionary with word, meaning and alphabet search.": [
    "Показывает отдельный церковнославянский словарь с поиском по слову, значению и алфавиту.",
    "Zeigt das eigenständige kirchenslawische Wörterbuch mit Wort-, Bedeutungs- und Alphabetsuche.",
    "Показує окремий церковнослов’янський словник із пошуком за словом, значенням та абеткою.",
    "Wyświetla samodzielny słownik cerkiewnosłowiański z wyszukiwaniem słów, znaczeń i według alfabetu."
  ],
  "Shows the dictionary with a custom heading.": [
    "Показывает словарь с собственным заголовком.",
    "Zeigt das Wörterbuch mit einer eigenen Überschrift.",
    "Показує словник із власним заголовком.",
    "Wyświetla słownik z własnym nagłówkiem."
  ]
});

const locales = {
  ru_RU: { index: 0, plural: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);' },
  de_DE: { index: 1, plural: 'nplurals=2; plural=(n != 1);' },
  uk: { index: 2, plural: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);' },
  pl_PL: { index: 3, plural: 'nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 1 : 2);' },
};

const escapePo = (value) => JSON.stringify(value);

function metadata(locale, plural) {
  return [
    'Project-Id-Version: Georg-Kloster Slavonic Translator 1.1.0',
    'Report-Msgid-Bugs-To: https://github.com/VAtapin/wp_cu_translator/issues',
    'POT-Creation-Date: 2026-10-11 00:00+0000',
    'PO-Revision-Date: 2026-10-11 00:00+0000',
    'Language: ' + locale,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'Plural-Forms: ' + plural,
    'X-Domain: georg-kloster-slavonic-translator',
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

const source = [readFileSync(resolve('georg-kloster-slavonic-translator.php'), 'utf8'), ...(existsSync('includes') ? readdirSync('includes').filter(name => name.endsWith('.php')).map(name => readFileSync('includes/'+name, 'utf8')) : [])].join('\n');
const extracted = new Set([...source.matchAll(/(?:__|esc_html__|esc_attr__)\(\s*'([^']+)'/g)].map((match) => match[1]));
for (const required of ['Georg-Kloster Slavonic Translator', 'Translate text into Church Slavonic and search its dictionary through Bible Desktop.']) extracted.add(required);
const missing = [...extracted].filter((msgid) => !Object.hasOwn(translations, msgid));
const stale = Object.keys(translations).filter((msgid) => !extracted.has(msgid));
for (const [msgid, values] of Object.entries(translations)) {
  if (/[^\x00-\x7F…—]/u.test(msgid)) throw new Error(`Non-English source string: ${msgid}`);
  const placeholders = (text) => (text.match(/%(?:\d+\$)?[sd]/g) || []).sort().join('|');
  for (const value of values) {
    if (!value.trim() || placeholders(value) !== placeholders(msgid)) {
      throw new Error(`Empty translation or mismatched placeholders: ${msgid}`);
    }
  }
}
if (/[\p{Script=Cyrillic}]/u.test(source)) throw new Error('Plugin source must use English strings, including shortcode examples.');
if (missing.length || stale.length) {
  throw new Error(`Translation catalog mismatch. Missing: ${missing.join(' | ') || '-'}; stale: ${stale.join(' | ') || '-'}`);
}

mkdirSync(resolve('languages'), { recursive: true });
writeFileSync(resolve('languages/georg-kloster-slavonic-translator.pot'), potDocument());
for (const [locale, details] of Object.entries(locales)) {
  writeFileSync(resolve(`languages/georg-kloster-slavonic-translator-${locale}.po`), poDocument(locale, details.index, details.plural));
  writeFileSync(resolve(`languages/georg-kloster-slavonic-translator-${locale}.mo`), moBuffer(locale, details.index, details.plural));
}

console.log(`Generated ${Object.keys(translations).length} translations for ${Object.keys(locales).join(', ')}.`);
