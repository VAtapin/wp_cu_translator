<?php
/**
 * Plugin Name: WP CU Translator
 * Plugin URI: https://github.com/VAtapin/wp_cu_translator
 * Description: Church Slavonic translator for WordPress powered by the Bible Desktop API.
 * Version: 1.0.0
 * Requires at least: 6.3
 * Requires PHP: 8.0
 * Author: Vladimir Atapin
 * Author URI: https://atapin.de/
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wp-cu-translator
 * Domain Path: /languages
 */

if (! defined('ABSPATH')) {
    exit;
}
define('WP_CU_TRANSLATOR_VERSION', '1.0.0');
define('WP_CU_TRANSLATOR_OPTION', 'wp_cu_translator_settings');
define('WP_CU_TRANSLATOR_INSTALLATION_OPTION', 'wp_cu_translator_installation_id');
define('WP_CU_TRANSLATOR_FILE', __FILE__);
define('WP_CU_TRANSLATOR_URL', plugin_dir_url(__FILE__));

register_activation_hook(__FILE__, 'wp_cu_translator_activate');

add_action('plugins_loaded', 'wp_cu_translator_load_textdomain');
add_action('admin_init', 'wp_cu_translator_register_settings');
add_action('admin_menu', 'wp_cu_translator_admin_menu');
add_action('admin_post_wp_cu_translator_check_connection', 'wp_cu_translator_check_connection');
add_action('wp_enqueue_scripts', 'wp_cu_translator_register_assets');
add_action('wp_ajax_wp_cu_translator_translate', 'wp_cu_translator_ajax_translate');
add_action('wp_ajax_nopriv_wp_cu_translator_translate', 'wp_cu_translator_ajax_translate');
add_shortcode('wp_cu_translator', 'wp_cu_translator_shortcode');

function wp_cu_translator_load_textdomain(): void
{
    load_plugin_textdomain('wp-cu-translator', false, dirname(plugin_basename(__FILE__)).'/languages');
}

function wp_cu_translator_defaults(): array
{
    return [
        'api_url' => 'https://bible-desktop.com',
        'api_key' => '',
        'timeout' => 65,
    ];
}

function wp_cu_translator_activate(): void
{
    if (get_option(WP_CU_TRANSLATOR_OPTION, null) === null) {
        add_option(WP_CU_TRANSLATOR_OPTION, wp_cu_translator_defaults(), '', false);
    }

    wp_cu_translator_installation_id();
}

function wp_cu_translator_installation_id(): string
{
    $installationId = (string) get_option(WP_CU_TRANSLATOR_INSTALLATION_OPTION, '');
    if (! wp_is_uuid($installationId, 4)) {
        $installationId = wp_generate_uuid4();
        update_option(WP_CU_TRANSLATOR_INSTALLATION_OPTION, $installationId, false);
    }

    return $installationId;
}

function wp_cu_translator_settings(): array
{
    $settings = get_option(WP_CU_TRANSLATOR_OPTION, []);

    return wp_parse_args(is_array($settings) ? $settings : [], wp_cu_translator_defaults());
}

function wp_cu_translator_register_settings(): void
{
    register_setting('wp_cu_translator', WP_CU_TRANSLATOR_OPTION, [
        'type' => 'array',
        'sanitize_callback' => 'wp_cu_translator_sanitize_settings',
        'default' => wp_cu_translator_defaults(),
    ]);
}

/**
 * Preserve a stored API key when its password field is left empty.
 *
 * @param mixed $input
 */
function wp_cu_translator_sanitize_settings($input): array
{
    $current = wp_cu_translator_settings();
    $input = is_array($input) ? $input : [];
    $apiUrl = untrailingslashit(esc_url_raw(trim((string) ($input['api_url'] ?? ''))));

    if ($apiUrl === '' || ! wp_http_validate_url($apiUrl) || strtolower((string) wp_parse_url($apiUrl, PHP_URL_SCHEME)) !== 'https') {
        add_settings_error(WP_CU_TRANSLATOR_OPTION, 'invalid_api_url', __('Enter a valid Bible Desktop HTTPS URL.', 'wp-cu-translator'));
        $apiUrl = $current['api_url'];
    }

    $apiKey = trim((string) ($input['api_key'] ?? ''));
    if (! empty($input['delete_api_key'])) {
        $apiKey = '';
    } elseif ($apiKey === '') {
        $apiKey = (string) $current['api_key'];
    }

    return [
        'api_url' => $apiUrl,
        'api_key' => sanitize_text_field($apiKey),
        'timeout' => max(5, min(120, absint($input['timeout'] ?? 65))),
    ];
}

function wp_cu_translator_admin_menu(): void
{
    add_options_page(
        __('WP CU Translator', 'wp-cu-translator'),
        __('WP CU Translator', 'wp-cu-translator'),
        'manage_options',
        'wp-cu-translator',
        'wp_cu_translator_settings_page'
    );
}

function wp_cu_translator_settings_page(): void
{
    if (! current_user_can('manage_options')) {
        return;
    }

    $settings = wp_cu_translator_settings();
    $connection = get_transient('wp_cu_translator_connection_'.get_current_user_id());
    delete_transient('wp_cu_translator_connection_'.get_current_user_id());
    ?>
    <div class="wrap">
        <h1><?php echo esc_html__('WP CU Translator', 'wp-cu-translator'); ?></h1>
        <p><?php echo esc_html__('Add the form with [wp_cu_translator]. The free tier works without a key; an optional key enables higher limits and always stays on the WordPress server.', 'wp-cu-translator'); ?></p>

        <?php if (is_array($connection)) : ?>
            <div class="notice notice-<?php echo $connection['ok'] ? 'success' : 'error'; ?> is-dismissible">
                <p><?php echo esc_html((string) $connection['message']); ?></p>
            </div>
        <?php endif; ?>

        <?php settings_errors(WP_CU_TRANSLATOR_OPTION); ?>

        <form method="post" action="options.php">
            <?php settings_fields('wp_cu_translator'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="wp-cu-translator-api-url"><?php echo esc_html__('Bible Desktop URL', 'wp-cu-translator'); ?></label></th>
                    <td>
                        <input id="wp-cu-translator-api-url" class="regular-text" type="url" name="<?php echo esc_attr(WP_CU_TRANSLATOR_OPTION); ?>[api_url]" value="<?php echo esc_attr((string) $settings['api_url']); ?>" required>
                        <p class="description"><?php echo esc_html__('Example:', 'wp-cu-translator'); ?> <code>https://bible-desktop.com</code></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="wp-cu-translator-api-key"><?php echo esc_html__('Bible Desktop API key', 'wp-cu-translator'); ?></label></th>
                    <td>
                        <input id="wp-cu-translator-api-key" class="regular-text" type="password" name="<?php echo esc_attr(WP_CU_TRANSLATOR_OPTION); ?>[api_key]" value="" autocomplete="new-password">
                        <p class="description"><?php echo esc_html($settings['api_key'] !== ''
                            ? __('The key is saved. Leave the field empty to keep it.', 'wp-cu-translator')
                            : __('Optional. Without a key, the plugin uses the free public tier. Add a key for higher limits.', 'wp-cu-translator')); ?></p>
                        <?php if ($settings['api_key'] !== '') : ?>
                            <label><input type="checkbox" name="<?php echo esc_attr(WP_CU_TRANSLATOR_OPTION); ?>[delete_api_key]" value="1"> <?php echo esc_html__('Delete the saved key', 'wp-cu-translator'); ?></label>
                        <?php endif; ?>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="wp-cu-translator-timeout"><?php echo esc_html__('Timeout', 'wp-cu-translator'); ?></label></th>
                    <td>
                        <input id="wp-cu-translator-timeout" class="small-text" type="number" min="5" max="120" name="<?php echo esc_attr(WP_CU_TRANSLATOR_OPTION); ?>[timeout]" value="<?php echo esc_attr((string) $settings['timeout']); ?>"> <?php echo esc_html__('seconds', 'wp-cu-translator'); ?>
                    </td>
                </tr>
            </table>
            <?php submit_button(__('Save settings', 'wp-cu-translator')); ?>
        </form>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <input type="hidden" name="action" value="wp_cu_translator_check_connection">
            <?php wp_nonce_field('wp_cu_translator_check_connection'); ?>
            <?php submit_button(__('Check connection', 'wp-cu-translator'), 'secondary', 'submit', false); ?>
            <span class="description"><?php echo esc_html__('The check does not send text to OpenAI and does not spend money.', 'wp-cu-translator'); ?></span>
        </form>
    </div>
    <?php
}

function wp_cu_translator_check_connection(): void
{
    if (! current_user_can('manage_options')) {
        wp_die(esc_html__('Insufficient permissions.', 'wp-cu-translator'));
    }

    check_admin_referer('wp_cu_translator_check_connection');
    $response = wp_cu_translator_api_request('GET', '/api/v1/church-slavonic/status');
    $message = $response['ok']
        ? __('Connection established. The Bible Desktop API is available.', 'wp-cu-translator')
        : sprintf(__('Could not connect: %s', 'wp-cu-translator'), $response['message']);

    set_transient('wp_cu_translator_connection_'.get_current_user_id(), [
        'ok' => $response['ok'],
        'message' => $message,
    ], MINUTE_IN_SECONDS);

    wp_safe_redirect(admin_url('options-general.php?page=wp-cu-translator'));
    exit;
}

function wp_cu_translator_register_assets(): void
{
    wp_register_style('wp-cu-translator', WP_CU_TRANSLATOR_URL.'assets/wp-cu-translator.css', [], WP_CU_TRANSLATOR_VERSION);
    wp_register_script('wp-cu-translator', WP_CU_TRANSLATOR_URL.'assets/wp-cu-translator.js', [], WP_CU_TRANSLATOR_VERSION, true);
}

/**
 * Render the translator. Multiple forms may coexist on one page.
 *
 * @param mixed $attributes
 */
function wp_cu_translator_shortcode($attributes = []): string
{
    $attributes = is_array($attributes) ? $attributes : [];
    $attributes = shortcode_atts(['title' => __('Church Slavonic Translator', 'wp-cu-translator')], $attributes, 'wp_cu_translator');
    wp_enqueue_style('wp-cu-translator');
    wp_enqueue_script('wp-cu-translator');
    wp_localize_script('wp-cu-translator', 'WPCUTranslator', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('wp_cu_translator_translate'),
        'strings' => [
            'translating' => __('Translating…', 'wp-cu-translator'),
            'translationFailed' => __('Translation could not be completed.', 'wp-cu-translator'),
            'recognizedAs' => __('Recognized as %s', 'wp-cu-translator'),
            'readyCached' => __('Ready — the result was loaded from cache.', 'wp-cu-translator'),
            'ready' => __('Ready.', 'wp-cu-translator'),
            'copied' => __('Copied', 'wp-cu-translator'),
            'copyFailed' => __('Could not copy', 'wp-cu-translator'),
            'copiedPlain' => __('Plain text copied', 'wp-cu-translator'),
        ],
    ]);

    $fontUrl = trailingslashit(wp_cu_translator_settings()['api_url']).'fonts/MonomakhUnicode.ttf';

    ob_start();
    ?>
    <section class="wp-cu-translator" data-wp-cu-translator>
        <h2 class="wp-cu-translator__title"><?php echo esc_html((string) $attributes['title']); ?></h2>
        <form class="wp-cu-translator__form" data-wp-cu-translator-form>
            <label class="wp-cu-translator__label">
                <?php echo esc_html__('Text to translate', 'wp-cu-translator'); ?>
                <textarea name="text" rows="7" maxlength="20000" required placeholder="<?php echo esc_attr__('Enter Russian or German text', 'wp-cu-translator'); ?>"></textarea>
            </label>

            <div class="wp-cu-translator__grid">
                <label class="wp-cu-translator__label">
                    <?php echo esc_html__('Source language', 'wp-cu-translator'); ?>
                    <select name="source_language">
                        <option value="auto"><?php echo esc_html__('Detect automatically', 'wp-cu-translator'); ?></option>
                        <option value="ru"><?php echo esc_html__('Russian', 'wp-cu-translator'); ?></option>
                        <option value="de"><?php echo esc_html__('German', 'wp-cu-translator'); ?></option>
                    </select>
                </label>
                <fieldset class="wp-cu-translator__options">
                    <legend><?php echo esc_html__('Orthography', 'wp-cu-translator'); ?></legend>
                    <label><input type="checkbox" name="accents" checked> <?php echo esc_html__('Accents', 'wp-cu-translator'); ?></label>
                    <label><input type="checkbox" name="titlo" checked> <?php echo esc_html__('Titlo', 'wp-cu-translator'); ?></label>
                    <label><input type="checkbox" name="breathings" checked> <?php echo esc_html__('Breathings', 'wp-cu-translator'); ?></label>
                    <label><input type="checkbox" name="slavonic_numbers"> <?php echo esc_html__('Slavonic numbers', 'wp-cu-translator'); ?></label>
                </fieldset>
            </div>

            <button class="wp-cu-translator__submit" type="submit"><?php echo esc_html__('Translate', 'wp-cu-translator'); ?></button>
            <p class="wp-cu-translator__status" data-wp-cu-translator-status role="status" aria-live="polite"></p>
        </form>

        <div class="wp-cu-translator__result" data-wp-cu-translator-result hidden>
            <p class="wp-cu-translator__match" data-wp-cu-translator-match hidden></p>
            <div class="wp-cu-translator__text" data-wp-cu-translator-text></div>
            <div class="wp-cu-translator__actions">
                <button type="button" data-wp-cu-translator-copy><?php echo esc_html__('Copy text', 'wp-cu-translator'); ?></button>
                <button type="button" data-wp-cu-translator-copy-rich><?php echo esc_html__('Copy with formatting', 'wp-cu-translator'); ?></button>
                <a href="<?php echo esc_url($fontUrl); ?>" download><?php echo esc_html__('Download font', 'wp-cu-translator'); ?></a>
            </div>
            <p class="wp-cu-translator__hint"><?php echo esc_html__('After downloading, open MonomakhUnicode.ttf and click Install. If Word does not select it automatically, select the pasted text and assign Monomakh Unicode manually.', 'wp-cu-translator'); ?></p>
        </div>
    </section>
    <?php

    return (string) ob_get_clean();
}

function wp_cu_translator_ajax_translate(): void
{
    check_ajax_referer('wp_cu_translator_translate', 'nonce');

    $text = isset($_POST['text']) ? sanitize_textarea_field(wp_unslash($_POST['text'])) : '';
    $sourceLanguage = isset($_POST['source_language']) ? sanitize_key(wp_unslash($_POST['source_language'])) : 'auto';

    if ($text === '') {
        wp_send_json_error(['message' => __('Enter text to translate.', 'wp-cu-translator')], 422);
    }
    if (! in_array($sourceLanguage, ['auto', 'ru', 'de'], true)) {
        wp_send_json_error(['message' => __('The selected source language is not supported.', 'wp-cu-translator')], 422);
    }
    if (function_exists('mb_strlen') ? mb_strlen($text) > 20000 : strlen($text) > 60000) {
        wp_send_json_error(['message' => __('The text is too long.', 'wp-cu-translator')], 422);
    }

    $response = wp_cu_translator_api_request('POST', '/api/v1/church-slavonic/translate', [
        'text' => $text,
        'source_language' => $sourceLanguage,
        'options' => [
            'accents' => ! empty($_POST['accents']),
            'titlo' => ! empty($_POST['titlo']),
            'breathings' => ! empty($_POST['breathings']),
            'slavonic_numbers' => ! empty($_POST['slavonic_numbers']),
        ],
    ], wp_cu_translator_visitor_identifier());

    if (! $response['ok']) {
        wp_send_json_error(['message' => $response['message']], max(400, min(599, (int) $response['status'])));
    }

    wp_send_json_success($response['body']['data']);
}

/**
 * @param array<string, mixed>|null $payload
 * @return array{ok: bool, status: int, message: string, body: array<string, mixed>}
 */
function wp_cu_translator_api_request(string $method, string $path, ?array $payload = null, string $clientIdentifier = ''): array
{
    $settings = wp_cu_translator_settings();

    $headers = [
        'Accept' => 'application/json',
        'Content-Type' => 'application/json',
        'X-Bible-Desktop-Client' => 'wp-cu-translator-wordpress',
        'X-Bible-Desktop-Installation' => wp_cu_translator_installation_id(),
    ];
    if ($settings['api_key'] !== '') {
        $headers['X-API-Key'] = $settings['api_key'];
    }
    if ($clientIdentifier !== '') {
        $headers['X-Bible-Desktop-Visitor'] = $clientIdentifier;
    }

    $args = [
        'method' => $method,
        'headers' => $headers,
        'timeout' => (int) $settings['timeout'],
        'redirection' => 0,
        'sslverify' => true,
        'reject_unsafe_urls' => true,
    ];
    if ($payload !== null) {
        $args['body'] = wp_json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    $response = wp_safe_remote_request(untrailingslashit($settings['api_url']).$path, $args);
    if (is_wp_error($response)) {
        return ['ok' => false, 'status' => 502, 'message' => __('Could not connect to Bible Desktop.', 'wp-cu-translator'), 'body' => []];
    }

    $status = (int) wp_remote_retrieve_response_code($response);
    $decoded = json_decode((string) wp_remote_retrieve_body($response), true);
    $body = is_array($decoded) ? $decoded : [];
    $message = wp_cu_translator_api_error_message($status, $body, $settings['api_key'] !== '');

    return [
        'ok' => $status >= 200 && $status < 300 && isset($body['data']) && is_array($body['data']),
        'status' => $status,
        'message' => $message,
        'body' => $body,
    ];
}

/** @param array<string, mixed> $body */
function wp_cu_translator_api_error_message(int $status, array $body = [], bool $hasApiKey = false): string
{
    if ($status === 429 && ($body['error'] ?? null) === 'quota_exceeded') {
        return $hasApiKey
            ? __('The higher translation limit has been reached. Please try again later.', 'wp-cu-translator')
            : __('The free daily limit has been reached. Add an API key for higher limits or try again after the reset.', 'wp-cu-translator');
    }

    return match ($status) {
        401 => __('The Bible Desktop API key is invalid.', 'wp-cu-translator'),
        422 => __('Check the entered text and translation settings.', 'wp-cu-translator'),
        429 => __('The translation request limit has been reached. Please try again later.', 'wp-cu-translator'),
        502, 503, 504 => __('The translation service is temporarily unavailable.', 'wp-cu-translator'),
        default => sprintf(__('Bible Desktop returned HTTP error %d.', 'wp-cu-translator'), $status),
    };
}

function wp_cu_translator_visitor_identifier(): string
{
    $address = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';

    return hash_hmac('sha256', $address, wp_salt('nonce'));
}
