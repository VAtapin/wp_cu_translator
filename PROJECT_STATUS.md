# Georg-Kloster Slavonic Translator — состояние проекта

## Реализовано и решения

- WordPress-плагин версии 1.0.5 называется `Georg-Kloster Slavonic Translator`; WordPress.org slug, text domain, основной PHP-файл и корневой каталог ZIP — `georg-kloster-slavonic-translator`.
- Сохранены `[wp_cu_translator]`, существующие settings options, Installation UUID и идентификатор API-клиента. Доступны меню настроек/шорткодов, русский/немецкий перевод, орфографические параметры и копирование для Word.
- Бесплатный серверный API Bible Desktop работает без ключа; необязательный ключ остаётся на WordPress-сервере. Запросы используют HTTPS, проверку TLS и запрет перенаправлений.
- В readme и форме раскрыты внешняя отправка текста и возможная обработка OpenAI. Условия и политика Bible Desktop `/pages/api-terms` и `/pages/api-privacy` дополнены, опубликованы через CMS и проверены без cookies.
- Заголовок формы — `h3`; базовая адаптивная компоновка использует `:where()` без `!important`, результат сохраняет Monomakh Unicode и переносы строк.
- GitHub ZIP содержит RU/DE PO/MO; WordPress.org ZIP и deploy job исключают PO/MO в пользу translate.wordpress.org. До появления языковых пакетов WordPress.org-версия использует английские строки.
- Репозиторий: `VAtapin/wp_cu_translator`, ветка `main`, upstream `origin/main`. Plugin URI: `https://kalender.georg-kloster.ru/calendar-api`; автор Vladimir Atapin, `https://atapin.de/`.
- Последний опубликованный GitHub Release — 1.0.4 со старым именем. Версия 1.0.5 подготовлена локально; новый tag/release и отправка в WordPress.org не выполнялись. WordPress.org deployment выключен.

## Проверки 7 октября 2026

- PHP lint runtime/uninstall и обоих smoke-тестов, JavaScript syntax и воспроизводимая сборка 63 строк EN/RU/DE прошли.
- Реальный WordPress/SQLite: активация под новым slug, сохранение настроек/UUID, отсутствие внешних запросов при активации, метаданные, HTML, раскрытие обработки данных и JavaScript на EN/RU/DE прошли.
- Plugin Check на установленном плагине и точном WordPress.org-пакете: `No errors found`.
- Без cookies проверены публичные юридические страницы и реальные запросы через код плагина: status HTTP 200, перевод библейской ссылки HTTP 200 (`corpus`), обычного текста HTTP 200 (`ai`). Использован бесплатный режим без сохранённых ключей; ключевой режим отдельно не проверялся.
- TXT `wordpressorg-atapin-verification` подтверждён на обоих авторитетных DNS-серверах каждого домена `atapin.de` и `georg-kloster.ru`, а также через 1.1.1.1.
- Проверены структура обычного и WordPress.org ZIP: один правильный корневой каталог, только runtime/readme/assets/languages, без Git, тестов, скриптов или секретов. `git diff --check` прошёл.

- Название исправлено по выбору владельца на `Georg-Kloster Slavonic Translator`; версия 1.0.5 сохранена, поскольку её tag/release ещё не создавался. Повторно прошли PHP lint, JS syntax, воспроизводимая генерация 63 строк, активация нового slug с сохранением settings/UUID и WordPress smoke-тест EN/RU/DE. Plugin Check установленной копии и точного WordPress.org-пакета: No errors found. Оба ZIP пересобраны и проверены по структуре и соответствию runtime-кода исходникам. Серверный API не менялся и повторно не вызывался при исправлении имени.

## Следующие действия и ограничения

- Установить подготовленный ZIP на целевой WordPress. Перед переходом со старого slug деактивировать предыдущую копию; не активировать обе одновременно. Не запускать uninstall старой копии до переноса настроек: options общие.
- Если заявка уже подана, запросить у Plugins Team slug `georg-kloster-slavonic-translator`; наличие DNS-подтверждения не заменяет решение команды ревью.
- При необходимости проверить повышенные лимиты с действующим ключом администратора. Новый GitHub Release и WordPress.org submission остаются отдельными действиями.
- Установка плагина на production в этой задаче не выполнялась; обновлены только явно разрешённые юридические CMS-страницы Bible Desktop.

Последний связанный commit: `Rename translator to Georg-Kloster` (текущее исправление имени); предыдущая проверка — `621ca6c`, предыдущий опубликованный выпуск — `13c779c`.
