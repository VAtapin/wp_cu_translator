# Church Slavonic Translator — состояние проекта

## Реализовано

- Подготовлен WordPress-плагин `Church Slavonic Translator` версии 1.0.1 с WordPress.org slug/text domain `church-slavonic-translator` и шорткодом `[wp_cu_translator]`.
- Перевод выполняется через внешний серверный API Bible Desktop; бесплатный режим работает без ключа, а необязательный ключ повышенных лимитов не передаётся браузеру.
- При активации создаётся постоянный Installation ID (UUID); бесплатная ИИ-квота учитывается на установку, а не на посетителя.
- Доступны русский, немецкий, автоопределение языка и параметры церковнославянской орфографии.
- Добавлены обычное и форматированное копирование, ссылка на Monomakh Unicode и инструкция для Word.
- Добавлены настройки подключения и бесплатная проверка статуса без вызова OpenAI.
- Плагин имеет собственное верхнее меню WordPress: «Настройки» для подключения и «Шорткоды» с готовыми примерами и пояснением параметра `title`; та же таблица есть внизу настроек.
- Название, описание, админка и публичная форма локализованы на английский, русский и немецкий; язык выбирает WordPress.
- Подготовлены WordPress `readme.txt` с `Tested up to: 7.1`, GitHub README, changelog, `.distignore` и tag-driven GitHub Actions workflow с `10up/action-wordpress-plugin-deploy@stable`.

## Текущее состояние и решения

- Репозиторий плагина: `VAtapin/wp_cu_translator`.
- Публичная страница плагина (`Plugin URI`): `https://kalender.georg-kloster.ru/calendar-api`.
- Плагин всегда передаёт имя клиента, Installation ID и необратимый идентификатор посетителя; `X-API-Key` добавляется только при его настройке.
- Публичное имя: `Church Slavonic Translator`; slug, text domain и каталог ZIP: `church-slavonic-translator`.
- Текущая версия: `1.0.1`.
- GitHub Release создаётся тегом, совпадающим с версией без префикса `v`.
- WordPress.org deployment выключен до настройки переменной `WORDPRESS_ORG_ENABLED=true` и SVN-секретов.
- Ранее опубликованный GitHub Release `1.0.0` содержит архивы со старым именем `wp-cu-translator` и предшествует подготовке для WordPress.org. Он не изменялся: новый tag/release и публикация в WordPress.org требуют отдельного решения владельца.

## Известные проблемы

- Полный интерактивный тест требует доступного production API Bible Desktop после миграции бесплатных квот.

## Следующие действия

- Обновить Bible Desktop и проверить бесплатный и ключевой режимы плагина на целевом WordPress.
- Перед новым GitHub Release создать отдельный тег `1.0.1`; существующий релиз `1.0.0` не изменять.
- После обновления production API установить финальный ZIP и проверить настоящий перевод в бесплатном и ключевом режимах.

## Последние проверки

- Для отдельного меню настроек и справки по шорткодам пройдены PHP lint главного файла, uninstall-скрипта и smoke-теста, `node --check` JavaScript и генератора локализаций, пересборка EN/RU/DE-каталогов, проверка совпадения версии `1.0.1` в заголовке плагина и `readme.txt`, а также `git diff --check`. Интеграционный WordPress smoke-тест не запускался: корень тестовой установки WordPress в текущей среде не предоставлен.
- PHP lint главного файла и uninstall-скрипта, `node --check` JavaScript и генератора переводов прошли.
- Каталог из 53 строк проверен и собран в POT, русские и немецкие PO/MO-файлы воспроизводимым Node-скриптом; все gettext-вызовы используют `church-slavonic-translator`.
- Версии `church-slavonic-translator.php` и `readme.txt` совпадают: `1.0.0`; `Tested up to` подтверждён локальным WordPress 7.1.
- Финальный ZIP содержит один корневой каталог `church-slavonic-translator`, runtime-код, assets и пять файлов локализации без `.git`, `.github`, тестов, скриптов, логов и секретов.
- Официальный Plugin Check 2.1.0 завершился сообщением `No errors found`; ошибок и предупреждений нет.
- В реальном локальном WordPress 7.1/SQLite smoke-тест подтвердил Plugin URI, постоянный UUID установки, английские, русские и немецкие название/описание плагина, HTML шорткода и JavaScript-сообщения.
- WordPress.org deploy не запускался, новый tag/release не создавался.

Последний связанный commit: Add translator settings and shortcode guide.
