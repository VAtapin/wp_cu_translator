<?php
define('DOING_AJAX', true);
require $argv[1].'/wp-load.php';
require_once WP_PLUGIN_DIR.'/georg-kloster-slavonic-translator/georg-kloster-slavonic-translator.php';
set_exception_handler(static function (Throwable $error): void { fwrite(STDERR, $error->getMessage()."\n"); exit(1); });
foreach ([['operation' => 'entry', 'key' => '../../status'], ['operation' => 'other'], ['mode' => 'other'], ['letter' => '37'], ['offset' => '-1'], ['q' => str_repeat('a', 121)], ['q' => []]] as $invalid) {
    if (! is_wp_error(wp_cu_translator_dictionary_path($invalid))) { throw new RuntimeException('Unsafe dictionary input accepted.'); }
}
if (wp_cu_translator_dictionary_path(['operation' => 'alphabet']) !== '/api/dictionaries/AZBYKA_CU_FULL/alphabet') { throw new RuntimeException('Alphabet endpoint changed.'); }
$path = wp_cu_translator_dictionary_path(['q' => 'святая вода', 'mode' => 'meaning', 'letter' => '1', 'offset' => '20']);
parse_str((string) wp_parse_url($path, PHP_URL_QUERY), $params);
if ($params !== ['q' => 'святая вода', 'mode' => 'meaning', 'limit' => '20', 'offset' => '20', 'letter' => '1']) { throw new RuntimeException('Query parameters changed.'); }
$key = str_repeat('a', 40);
if (wp_cu_translator_dictionary_path(['operation' => 'entry', 'key' => $key]) !== '/api/dictionaries/AZBYKA_CU_FULL/entries/'.$key) { throw new RuntimeException('Article key changed.'); }
class GeorsltrDictionaryJsonExit extends RuntimeException {}
add_filter('wp_die_ajax_handler', static fn () => static function (): void { throw new GeorsltrDictionaryJsonExit(); });
$calls = 0;
add_filter('pre_http_request', static function ($pre, $args, $url) use (&$calls, $key) {
    ++$calls;
    if ($args['method'] !== 'GET' || $args['redirection'] !== 0 || ! $args['sslverify'] || ! str_contains($url, '/api/dictionaries/AZBYKA_CU_FULL/search')) { throw new RuntimeException('Dictionary transport contract weakened.'); }
    return ['headers' => [], 'body' => wp_json_encode(['data' => [['key' => $key, 'headword' => 'А҆́бїе', 'civil' => 'Абие', 'definition' => '<literal>Скоро, тотчас', 'body_format' => 'plain-text']], 'total' => 1, 'limit' => 20, 'offset' => 0]), 'response' => ['code' => 200, 'message' => 'OK'], 'cookies' => []];
}, 10, 3);
$_POST = ['nonce' => wp_create_nonce('georsltr_dictionary'), 'q' => 'абие', 'mode' => 'word', 'georsltr_locale' => 'ru_RU'];
$_REQUEST = $_POST;
$cacheKey = 'georsltr_dict_'.hash('sha256', wp_cu_translator_settings()['api_url'].wp_cu_translator_dictionary_path($_POST));
delete_transient($cacheKey);
foreach ([1, 2] as $attempt) {
    ob_start();
    try { wp_cu_translator_dictionary_ajax(); } catch (GeorsltrDictionaryJsonExit $ignored) {}
    $json = json_decode((string) ob_get_clean(), true, 512, JSON_THROW_ON_ERROR);
    if (! $json['success'] || $json['data']['data'][0]['definition'] !== '<literal>Скоро, тотчас') { throw new RuntimeException('Public dictionary data was altered.'); }
}
if ($calls !== 1) { throw new RuntimeException('Dictionary cache failed.'); }
delete_transient($cacheKey);
$html = do_shortcode('[wp_cu_dictionary title="<script>custom</script>"]');
if (! str_contains($html, 'data-georsltr-dictionary') || str_contains($html, '<script>custom</script>')) { throw new RuntimeException('Standalone shortcode escaped heading failed.'); }
$translationOnly = do_shortcode('[wp_cu_translator dictionary="no"]');
if (str_contains($translationOnly, 'data-georsltr-tools')) { throw new RuntimeException('Translation-only shortcode must stay available.'); }
echo "Dictionary input validation, transport, nonce, cache, literal definitions and shortcode escaping passed.\n";
