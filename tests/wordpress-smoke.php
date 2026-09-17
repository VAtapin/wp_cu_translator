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

$pluginFile = WP_PLUGIN_DIR.'/church-slavonic-translator/church-slavonic-translator.php';
if (! is_file($pluginFile)) {
    throw new RuntimeException('The test plugin is not installed in WordPress.');
}
require_once $pluginFile;

$installationId = wp_cu_translator_installation_id();
if (! wp_is_uuid($installationId, 4) || $installationId !== wp_cu_translator_installation_id()) {
    throw new RuntimeException('A persistent version 4 installation UUID was not created.');
}

$expected = [
    'en_US' => [
        'name' => 'Church Slavonic Translator',
        'description' => 'Translate text into Church Slavonic using the Bible Desktop translation service.',
        'title' => 'Church Slavonic Translator',
        'translating' => 'Translating…',
    ],
    'ru_RU' => [
        'name' => 'Церковнославянский переводчик',
        'description' => 'Перевод текста на церковнославянский язык с помощью сервиса Bible Desktop.',
        'title' => 'Церковнославянский переводчик',
        'translating' => 'Переводим…',
    ],
    'de_DE' => [
        'name' => 'Kirchenslawischer Übersetzer',
        'description' => 'Übersetzt Texte mit dem Übersetzungsdienst Bible Desktop ins Kirchenslawische.',
        'title' => 'Kirchenslawischer Übersetzer',
        'translating' => 'Übersetzung läuft…',
    ],
];
if (! isset($expected[$locale])) {
    throw new RuntimeException('Unsupported smoke-test locale.');
}

unload_textdomain('church-slavonic-translator');
if ($locale !== 'en_US') {
    $catalog = dirname($pluginFile).'/languages/church-slavonic-translator-'.$locale.'.mo';
    if (! load_textdomain('church-slavonic-translator', $catalog)) {
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
if (! str_contains($html, '<h3 class="wp-cu-translator__title">')) {
    throw new RuntimeException('Translator shortcode title must use an h3 heading.');
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
