<?php

if ($argc !== 3) {
    fwrite(STDERR, "Usage: php tests/wordpress-smoke.php <wordpress-root> <en_US|ru_RU|de_DE>\n");
    exit(2);
}

$wordpressRoot = realpath($argv[1]);
$locale = $argv[2];
if ($wordpressRoot === false || ! is_file($wordpressRoot.'/wp-load.php')) {
    throw new RuntimeException('WordPress root was not found.');
}

require $wordpressRoot.'/wp-load.php';
require_once ABSPATH.'wp-admin/includes/plugin.php';

$pluginFile = WP_PLUGIN_DIR.'/atapin-church-slavonic-translator/atapin-church-slavonic-translator.php';
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
        'name' => 'Atapin Church Slavonic Translator',
        'description' => 'Translate text into Church Slavonic using the Bible Desktop translation service.',
        'title' => 'Atapin Church Slavonic Translator',
        'translating' => 'Translating…',
        'disclosure' => 'Your text is sent to the configured Bible Desktop service and may be processed by OpenAI.',
    ],
    'ru_RU' => [
        'name' => 'Atapin — Церковнославянский переводчик',
        'description' => 'Перевод текста на церковнославянский язык с помощью сервиса Bible Desktop.',
        'title' => 'Atapin — Церковнославянский переводчик',
        'translating' => 'Переводим…',
        'disclosure' => 'Ваш текст отправляется в настроенный сервис Bible Desktop и может обрабатываться OpenAI.',
    ],
    'de_DE' => [
        'name' => 'Atapin — Kirchenslawischer Übersetzer',
        'description' => 'Übersetzt Texte mit dem Übersetzungsdienst Bible Desktop ins Kirchenslawische.',
        'title' => 'Atapin — Kirchenslawischer Übersetzer',
        'translating' => 'Übersetzung läuft…',
        'disclosure' => 'Ihr Text wird an den konfigurierten Bible-Desktop-Dienst gesendet und kann von OpenAI verarbeitet werden.',
    ],
];
if (! isset($expected[$locale])) {
    throw new RuntimeException('Unsupported smoke-test locale.');
}

unload_textdomain('atapin-church-slavonic-translator');
if ($locale !== 'en_US') {
    $catalog = dirname($pluginFile).'/languages/atapin-church-slavonic-translator-'.$locale.'.mo';
    if (! load_textdomain('atapin-church-slavonic-translator', $catalog)) {
        throw new RuntimeException('Could not load '.$catalog);
    }
}

$metadata = get_plugin_data($pluginFile, false, true);
if (($metadata['PluginURI'] ?? '') !== 'https://kalender.georg-kloster.ru/calendar-api') {
    throw new RuntimeException('Plugin URI does not match.');
}
if (($metadata['Name'] ?? '') !== $expected[$locale]['name']) {
    throw new RuntimeException('Translated plugin name does not match for '.$locale);
}
if (($metadata['Description'] ?? '') !== $expected[$locale]['description']) {
    throw new RuntimeException('Translated plugin description does not match for '.$locale);
}

wp_cu_translator_register_assets();
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

$stylesheet = (string) file_get_contents(dirname($pluginFile).'/assets/wp-cu-translator.css');
foreach ([
    ':where(.wp-cu-translator)',
    ':where(.wp-cu-translator .wp-cu-translator__form)',
    ':where(.wp-cu-translator .wp-cu-translator__grid)',
    ':where(.wp-cu-translator .wp-cu-translator__options)',
    'font-family: "Monomakh Unicode", "Times New Roman", serif;',
] as $expectedCss) {
    if (! str_contains($stylesheet, $expectedCss)) {
        throw new RuntimeException('Translator stylesheet is missing its universal frontend rule: '.$expectedCss);
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

$localizedData = (string) wp_scripts()->get_data('wp-cu-translator', 'data');
if (! preg_match('/var WPCUTranslator = (.+);/', $localizedData, $match)) {
    throw new RuntimeException('Localized JavaScript configuration was not generated for '.$locale);
}
$javascriptConfig = json_decode($match[1], true, 512, JSON_THROW_ON_ERROR);
if (($javascriptConfig['strings']['translating'] ?? '') !== $expected[$locale]['translating']) {
    throw new RuntimeException('Translated JavaScript strings do not match for '.$locale);
}

echo $locale.": plugin metadata, frontend HTML and JavaScript localization passed.\n";
