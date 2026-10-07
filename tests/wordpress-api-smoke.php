<?php

// Opt-in live test: sends public sample text to Bible Desktop using the free tier.
if ($argc !== 2 || ! is_file($argv[1].'/wp-load.php')) {
    fwrite(STDERR, "Usage: php tests/wordpress-api-smoke.php <wordpress-root>\n");
    exit(2);
}
require $argv[1].'/wp-load.php';
require_once WP_PLUGIN_DIR.'/atapin-church-slavonic-translator/atapin-church-slavonic-translator.php';

// The Kalendar test site has canned HTTP fixtures; bypass only that local fixture.
$fixture = realpath($argv[1].'/wp-content/mu-plugins/fixtures.php');
foreach (($GLOBALS['wp_filter']['pre_http_request']->callbacks ?? []) as $priority => $callbacks) {
    foreach ($callbacks as $callback) {
        if ($fixture !== false && $callback['function'] instanceof Closure && (new ReflectionFunction($callback['function']))->getFileName() === $fixture) {
            remove_filter('pre_http_request', $callback['function'], $priority);
        }
    }
}

// Do not use or modify saved API credentials during a public-tier test.
add_filter('pre_option_'.WP_CU_TRANSLATOR_OPTION, 'wp_cu_translator_defaults');
add_action('http_api_debug', static function ($response): void {
    if (is_wp_error($response)) {
        fwrite(STDERR, 'Transport: '.$response->get_error_message()."\n");
    }
});
try {
    foreach (['api-terms' => 'Church Slavonic translation API', 'api-privacy' => 'OpenAI processing and translation retention'] as $slug => $heading) {
        $document = wp_safe_remote_get('https://bible-desktop.com/pages/'.$slug, ['redirection' => 0, 'sslverify' => true]);
        if (is_wp_error($document) || wp_remote_retrieve_response_code($document) !== 200 || ! str_contains(wp_remote_retrieve_body($document), $heading)) {
            throw new RuntimeException('The public provider document is missing: '.$slug);
        }
        echo $slug.": public translation disclosure passed\n";
    }
    foreach ([
        ['GET', '/api/v1/church-slavonic/status', null],
        ['POST', '/api/v1/church-slavonic/translate', ['text' => 'Ин. 1:1', 'source_language' => 'ru', 'options' => ['accents' => true, 'titlo' => true, 'breathings' => true, 'slavonic_numbers' => false]]],
        ['POST', '/api/v1/church-slavonic/translate', ['text' => 'Доброе утро.', 'source_language' => 'ru', 'options' => ['accents' => true, 'titlo' => true, 'breathings' => true, 'slavonic_numbers' => false]]],
    ] as [$method, $path, $payload]) {
        $result = wp_cu_translator_api_request($method, $path, $payload, $payload === null ? '' : wp_cu_translator_visitor_identifier());
        if (! $result['ok']) {
            throw new RuntimeException($path.' failed: HTTP '.$result['status'].' '.$result['message']);
        }
        if ($payload !== null && trim((string) ($result['body']['data']['translated_text'] ?? '')) === '') {
            throw new RuntimeException('The live API did not return translation text.');
        }
        echo $path.': HTTP '.$result['status'].' passed'.($payload !== null ? ' ('.($result['body']['data']['source_type'] ?? 'unknown').')' : '')."\n";
    }
} catch (RuntimeException $exception) {
    fwrite(STDERR, $exception->getMessage()."\n");
    exit(1);
}
