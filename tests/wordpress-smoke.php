<?php

if ($argc !== 3) {
    fwrite(STDERR, "Usage: php tests/wordpress-smoke.php <wordpress-root> <en_US|ru_RU|de_DE|uk|pl_PL>\n");
    exit(2);
}

$wordpressRoot = realpath($argv[1]);
$locale = $argv[2];
if ($wordpressRoot === false || ! is_file($wordpressRoot.'/wp-load.php')) {
    throw new RuntimeException('WordPress root was not found.');
}

require $wordpressRoot.'/wp-load.php';
require_once ABSPATH.'wp-admin/includes/plugin.php';

$pluginFile = WP_PLUGIN_DIR.'/georg-kloster-slavonic-translator/georg-kloster-slavonic-translator.php';
if (! is_file($pluginFile)) {
    throw new RuntimeException('The test plugin is not installed in WordPress.');
}
require_once $pluginFile;

$savedSettings = get_option(WP_CU_TRANSLATOR_OPTION);
$savedInstallationId = get_option(WP_CU_TRANSLATOR_INSTALLATION_OPTION);
$denyExternalRequest = static function () {
    throw new RuntimeException('Activation must not contact external services.');
};
add_filter('pre_http_request', $denyExternalRequest);
wp_cu_translator_activate();
remove_filter('pre_http_request', $denyExternalRequest);
if ($savedSettings !== false && get_option(WP_CU_TRANSLATOR_OPTION) !== $savedSettings) {
    throw new RuntimeException('Activation changed the existing settings.');
}
if (is_string($savedInstallationId) && wp_is_uuid($savedInstallationId, 4) && get_option(WP_CU_TRANSLATOR_INSTALLATION_OPTION) !== $savedInstallationId) {
    throw new RuntimeException('Activation changed the existing installation UUID.');
}

$installationId = wp_cu_translator_installation_id();
if (! wp_is_uuid($installationId, 4) || $installationId !== wp_cu_translator_installation_id()) {
    throw new RuntimeException('A persistent version 4 installation UUID was not created.');
}

$expected = [
    'en_US' => [
        'name' => 'Georg-Kloster Slavonic Translator',
        'description' => 'Translate text into Church Slavonic using the Bible Desktop translation service.',
        'title' => 'Georg-Kloster Slavonic Translator',
        'translating' => 'Translating…',
        'disclosure' => 'Your text is sent to the configured Bible Desktop service and may be processed by OpenAI.',
    ],
    'ru_RU' => [
        'name' => 'Georg-Kloster — Церковнославянский переводчик',
        'description' => 'Перевод текста на церковнославянский язык с помощью сервиса Bible Desktop.',
        'title' => 'Georg-Kloster — Церковнославянский переводчик',
        'translating' => 'Переводим…',
        'disclosure' => 'Ваш текст отправляется в настроенный сервис Bible Desktop и может обрабатываться OpenAI.',
    ],
    'de_DE' => [
        'name' => 'Georg-Kloster — Kirchenslawischer Übersetzer',
        'description' => 'Übersetzt Texte mit dem Übersetzungsdienst Bible Desktop ins Kirchenslawische.',
        'title' => 'Georg-Kloster — Kirchenslawischer Übersetzer',
        'translating' => 'Übersetzung läuft…',
        'disclosure' => 'Ihr Text wird an den konfigurierten Bible-Desktop-Dienst gesendet und kann von OpenAI verarbeitet werden.',
    ],
    'uk' => [
        'name' => 'Georg-Kloster — Церковнослов’янський перекладач',
        'description' => 'Переклад тексту церковнослов’янською мовою за допомогою сервісу Bible Desktop.',
        'title' => 'Georg-Kloster — Церковнослов’янський перекладач',
        'translating' => 'Перекладаємо…',
        'disclosure' => 'Ваш текст надсилається до налаштованого сервісу Bible Desktop і може оброблятися OpenAI.',
    ],
    'pl_PL' => [
        'name' => 'Georg-Kloster — Tłumacz cerkiewnosłowiański',
        'description' => 'Tłumacz tekst na język cerkiewnosłowiański za pomocą usługi tłumaczenia Bible Desktop.',
        'title' => 'Georg-Kloster — Tłumacz cerkiewnosłowiański',
        'translating' => 'Tłumaczenie…',
        'disclosure' => 'Twój tekst jest wysyłany do skonfigurowanej usługi Bible Desktop i może być przetwarzany przez OpenAI.',
    ],
];
if (! isset($expected[$locale])) {
    throw new RuntimeException('Unsupported smoke-test locale.');
}

unload_textdomain('georg-kloster-slavonic-translator');
if ($locale !== 'en_US') {
    $catalog = dirname($pluginFile).'/languages/georg-kloster-slavonic-translator-'.$locale.'.mo';
    if (! load_textdomain('georg-kloster-slavonic-translator', $catalog)) {
        throw new RuntimeException('Could not load '.$catalog);
    }
}

$po = $locale === 'en_US'
    ? dirname($pluginFile).'/languages/georg-kloster-slavonic-translator.pot'
    : dirname($pluginFile).'/languages/georg-kloster-slavonic-translator-'.$locale.'.po';
preg_match_all('/^msgid (".+")\Rmsgstr (".*")$/m', (string) file_get_contents($po), $entries, PREG_SET_ORDER);
if (count($entries) !== 63) {
    throw new RuntimeException('Expected all 63 interface strings in '.$po);
}
foreach ($entries as $entry) {
    $msgid = json_decode($entry[1], true, 512, JSON_THROW_ON_ERROR);
    $translated = $locale === 'en_US' ? $msgid : json_decode($entry[2], true, 512, JSON_THROW_ON_ERROR);
    if (__($msgid, 'georg-kloster-slavonic-translator') !== $translated) {
        throw new RuntimeException('Catalog translation mismatch for '.$locale.': '.$msgid);
    }
}

$metadata = get_plugin_data($pluginFile, false, true);
if ($metadata['Version'] !== '1.0.9' || WP_CU_TRANSLATOR_VERSION !== '1.0.9') {
    throw new RuntimeException('Release version does not match.');
}
if (($metadata['PluginURI'] ?? '') !== 'https://kalender.georg-kloster.ru/calendar-api') {
    throw new RuntimeException('Plugin URI does not match.');
}
if (($metadata['Name'] ?? '') !== $expected[$locale]['name']) {
    throw new RuntimeException('Translated plugin name does not match for '.$locale);
}
if (($metadata['Description'] ?? '') !== $expected[$locale]['description']) {
    throw new RuntimeException('Translated plugin description does not match for '.$locale);
}

// Reproduce block-theme rendering before the normal enqueue hook.
wp_deregister_script('wp-cu-translator');
wp_deregister_style('wp-cu-translator');
$html = do_shortcode('[wp_cu_translator]');
if (! str_contains($html, $expected[$locale]['title'])) {
    throw new RuntimeException('Translated shortcode title does not match for '.$locale);
}
if (! str_contains($html, $expected[$locale]['disclosure'])) {
    throw new RuntimeException('The visitor must be informed about external text processing.');
}
foreach (['pages/api-terms', 'pages/api-privacy'] as $documentPath) {
    if (! str_contains($html, esc_url(trailingslashit(wp_cu_translator_settings()['api_url']).$documentPath))) {
        throw new RuntimeException('The visitor disclosure is missing its provider document link.');
    }
}
if (! str_contains($html, '<h3 class="wp-cu-translator__title">')) {
    throw new RuntimeException('Translator shortcode title must use an h3 heading.');
}
if (! is_file(dirname($pluginFile).'/assets/translator-mark.png') || ! str_contains($html, esc_url(WP_CU_TRANSLATOR_URL.'assets/translator-mark.png'))) {
    throw new RuntimeException('The approved translator logo must be bundled and rendered locally.');
}

$stylesheet = (string) file_get_contents(dirname($pluginFile).'/assets/wp-cu-translator.css');
foreach ([
    '.wp-cu-translator {',
    '.wp-cu-translator .wp-cu-translator__form',
    '.wp-cu-translator .wp-cu-translator__workspace',
    '.wp-cu-translator .wp-cu-translator__options',
    "font-family: 'Monomakh Unicode', 'Times New Roman', serif;",
] as $expectedCss) {
    if (! str_contains($stylesheet, $expectedCss)) {
        throw new RuntimeException('Translator stylesheet is missing its scoped frontend rule: '.$expectedCss);
    }
}
if (str_contains($stylesheet, '!important')) {
    throw new RuntimeException('Translator stylesheet must not use !important.');
}
foreach ([
    'class="wp-cu-translator__textarea"',
    'class="wp-cu-translator__select"',
    'class="wp-cu-translator__option"',
    'class="wp-cu-translator__action"',
] as $expectedClass) {
    if (! str_contains($html, $expectedClass)) {
        throw new RuntimeException('Translator frontend HTML is missing its styling hook: '.$expectedClass);
    }
}

$shortcodes = wp_cu_translator_shortcodes();
if (($shortcodes[0]['shortcode'] ?? '') !== '[wp_cu_translator]' || ! str_contains((string) ($shortcodes[1]['shortcode'] ?? ''), 'title=')) {
    throw new RuntimeException('Shortcode reference does not list the default and custom-title forms.');
}
if ($shortcodes[1]['shortcode'] !== '[wp_cu_translator title="Church Slavonic translation"]') {
    throw new RuntimeException('The built-in shortcode example must use English source text.');
}
if (! str_contains(do_shortcode('[wp_cu_translator title="Custom heading"]'), 'Custom heading')) {
    throw new RuntimeException('Custom shortcode headings must be preserved.');
}

$localizedData = (string) wp_scripts()->get_data('wp-cu-translator', 'data');
if (! preg_match('/var georsltr_config = (.+);/', $localizedData, $match)) {
    throw new RuntimeException('Localized JavaScript configuration was not generated for '.$locale);
}
$javascriptConfig = json_decode($match[1], true, 512, JSON_THROW_ON_ERROR);
if (($javascriptConfig['strings']['translating'] ?? '') !== $expected[$locale]['translating']) {
    throw new RuntimeException('Translated JavaScript strings do not match for '.$locale);
}

echo $locale.": plugin metadata, frontend HTML and JavaScript localization passed.\n";
