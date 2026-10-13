<?php
// Exercise WPML's documented language filters without requiring a licensed WPML install.
require $argv[1].'/wp-load.php';
require_once WP_PLUGIN_DIR.'/georg-kloster-slavonic-translator/georg-kloster-slavonic-translator.php';
set_exception_handler(static function (Throwable $error): void { fwrite(STDERR, $error->getMessage()."\n"); exit(1); });
$pageLanguage = 'en';
add_filter('locale', static fn () => 'en_US');
add_filter('determine_locale', static fn () => 'en_US');
add_filter('wpml_current_language', static function () use (&$pageLanguage) { return $pageLanguage; });
add_filter('wpml_active_languages', static fn () => [
    'en' => ['default_locale' => 'en_US'], 'ru' => ['default_locale' => 'ru_RU'],
    'de' => ['default_locale' => 'de_DE'], 'uk' => ['default_locale' => 'uk'],
    'pl' => ['default_locale' => 'pl_PL'], 'custom-fr' => ['default_locale' => 'fr_CA'],
]);
do_action('wp');
unload_textdomain('georg-kloster-slavonic-translator', true);
wp_cu_translator_load_textdomain();
foreach ([['ru', 'Текст для перевода'], ['de', 'Zu übersetzender Text'], ['uk', 'Текст для перекладу'], ['pl', 'Tekst do przetłumaczenia'], ['en', 'Text to translate'], ['custom-fr', 'Text to translate'], ['ru', 'Текст для перевода']] as [$language, $label]) {
    $pageLanguage = $language;
    $html = wp_cu_translator_shortcode(['dictionary' => 'no']);
    if (! str_contains($html, $label)) {
        throw new RuntimeException('WPML current page language failed: '.$language);
    }
}
$pageLanguage = 'custom-fr';
if (wp_cu_translator_ui_locale() !== 'fr_CA') { throw new RuntimeException('Custom WPML locale was restricted.'); }
$_POST['georsltr_locale'] = 'ru_RU';
wp_cu_translator_request_locale($_POST['georsltr_locale']);
if (__('The text is too long.', 'georg-kloster-slavonic-translator') !== 'Текст слишком длинный.') {
    throw new RuntimeException('AJAX did not preserve the rendered language.');
}
$_POST['georsltr_locale'] = '../../ru_RU';
wp_cu_translator_request_locale($_POST['georsltr_locale']);
if (($argv[2] ?? '') === 'standard-pack-only') {
    $domain = 'georg-kloster-slavonic-translator';
    if (! is_readable(WP_LANG_DIR.'/plugins/'.$domain.'-ru_RU.mo')) {
        throw new RuntimeException('Install the standard Russian WordPress language pack in the test fixture first.');
    }
    // Simulate the WordPress.org ZIP, which does not ship bundled PO/MO files.
    add_filter('load_textdomain_mofile', static function ($file, $loadedDomain) use ($domain) {
        return $loadedDomain === $domain && str_starts_with($file, WP_PLUGIN_DIR.'/') ? ABSPATH.'missing-bundled-catalog.mo' : $file;
    }, 10, 2);
    $pageLanguage = 'en';
    wp_cu_translator_load_textdomain();
    $pageLanguage = 'ru';
    $html = wp_cu_translator_shortcode(['dictionary' => 'no']);
    if (! str_contains($html, 'Текст для перевода')) {
        throw new RuntimeException('Standard WordPress language pack failed without bundled catalogs.');
    }
    $data = (string) wp_scripts()->get_data('wp-cu-translator', 'data');
    if (! str_contains($data, wp_json_encode('Переводим…'))) {
        throw new RuntimeException('JavaScript strings failed with the standard language pack.');
    }
    echo "Standard WordPress Russian language pack passed without bundled catalogs.\n";
}
echo "WPML page switching, custom locale, English fallback and AJAX language passed.\n";
