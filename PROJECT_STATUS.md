# Georg-Kloster Slavonic Translator — состояние проекта

## Реализовано и решения

- Версия 1.0.7, имя/slug сохранены: `Georg-Kloster Slavonic Translator` / `georg-kloster-slavonic-translator`. Владелец подтвердил 12 октября, что Georg-Kloster — его собственный проект/бренд и плагин подаётся официальным владельцем. Название сохраняется; это пояснение нужно передать Plugins Team.
- Замечание о JavaScript global исправлено: `georsltr_config` согласован в PHP, JS и smoke-тесте. Все прочие функции, options, actions, handles и shortcode уже имеют префикс `wp_cu_translator` / `wp-cu-translator`; массовое переименование не требуется.
- Исходные строки и примеры — английские. Все 63 перевода RU/DE/UK/PL сохранены в репозитории и установочном ZIP.
- WordPress.org ZIP и deploy workflow исключают только PO/MO, сохраняя POT и runtime. Для каталога переводы доставляются через стандартные WordPress language packs; до их публикации используется английский интерфейс. Это исправляет рекомендацию из письма без удаления переводов из проекта.
- Сохранены `[wp_cu_translator]`, пользовательские заголовки, settings и Installation UUID; бесплатный API без ключа, HTTPS/TLS, ограничения доступа и уведомление о внешней обработке не менялись.
- main → origin/main. По письму владельца от 13 октября WordPress.org одобрил Georg-Kloster Slavonic Translator и выдал SVN `https://plugins.svn.wordpress.org/georg-kloster-slavonic-translator`, username `atapin`; имя/slug подтверждены.
- GitHub Actions поддерживает первый ручной выпуск существующего тега 1.0.7 и автоматическую SVN-публикацию следующих тегов после успешного release job. Есть dry run, повторные проверки release-кода и последовательный запуск SVN.
- В репозитории уже имеются secrets `SVN_USERNAME` / `SVN_PASSWORD`; значения не прочитаны и не изменены. Variable `WORDPRESS_ORG_ENABLED=true` включена; существующие SVN credentials прошли фактическую публикацию.

## Проверки 12 октября 2026

- PHP lint изменённых runtime/smoke файлов, JS syntax, воспроизводимость четырёх каталогов и регрессии английских исходников/placeholders/пустых переводов прошли.
- Новый frontend regression проверяет AJAX URL, nonce, action, локализованные сообщения, результат и ошибку API через `georsltr_config`, даже при наличии чужой старой global.
- Реальный изолированный WordPress/SQLite: EN/RU/DE/UK/PL, все 63 строки, метаданные, frontend HTML/JS, активация без внешних запросов, сохранение settings/UUID и custom headings прошли.
- Plugin Check установочной копии и точного WordPress.org ZIP: `No errors found`.
- ZIP сравнен побайтно с исходниками: установочный пакет 14 файлов с четырьмя PO/MO; каталоговый пакет 6 файлов без PO/MO. Оба имеют один правильный корневой каталог и не содержат тестов, Git и секретов.
- На локальном WordPress без встроенных MO проверена загрузка всех четырёх каталогов через стандартный `wp-content/languages/plugins`. Это проверка механизма; переводы на translate.wordpress.org ещё не опубликованы.
- TXT `wordpressorg-atapin-verification` подтверждён через 1.1.1.1 для `atapin.de` и `georg-kloster.ru`. Управление доменом само по себе не устанавливает право на название; принадлежность проекта/бренда отдельно подтверждена владельцем в текущем задании.
- Реальный публичный API без ключа ранее проверен 11 октября для status/corpus/ai (HTTP 200); API-код в 1.0.7 не менялся, повторные внешние ИИ-запросы не выполнялись. Режим с ключом отдельно не проверялся.

## Следующие действия и ограничения

- Версия 1.0.7 опубликована через GitHub Actions 13 октября: SVN revision `3743834`, trunk и tags/1.0.7. WordPress.org API подтверждает имя/версию, публичный ZIP отвечает HTTP 200.
- Следующие выпуски публикуются новым Git-тегом после успешных проверок; повторно отправлять уже опубликованный 1.0.7 не требуется.
- Production и каталог Kalendar не обновлялись. WordPress устанавливается/обновляется ZIP через админку.
- Старые настройки общие: не включать одновременно разные slug-копии и не запускать uninstall старой копии до переноса settings.
- Пользовательский распакованный каталог `atapin-church-slavonic-translator-wordpress-org-1.0.5/` сохранён и не включается в commit.

Последний связанный commit: `Record verified WordPress.org publication` (подтверждение публикации); настройка workflow — `07ec654`, подтверждение владельца — `2b790ee`, исходники 1.0.7 — `6ed320b`.

## Проверки настройки публикации — 13 октября 2026

- SVN root HTTP 200, стандартные assets/tags/trunk доступны.
- actionlint 1.7.12 и Bash syntax проверки нового workflow прошли. Frontend и translation regression прошли. Runtime-код 1.0.7 не менялся.

- Dry run `38394346696` и публикация `38394490231` завершились success. Ручной запуск использовал существующий тег 1.0.7; старые Git-теги и Release не менялись.
- Все 6 файлов в SVN trunk/tags и скачанном WordPress.org ZIP побайтно совпали с проверенными исходниками; PO/MO отсутствуют. Публичный ZIP SHA-256: `140dad6b310dcdf4a41d4b8b4b4ebd74d45cd4aedab367b6a43ee2a19a14facc`.
- Публичная страница: https://wordpress.org/plugins/georg-kloster-slavonic-translator/ . ZIP: https://downloads.wordpress.org/plugin/georg-kloster-slavonic-translator.1.0.7.zip .
