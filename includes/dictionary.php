<?php
/** Church Slavonic dictionary interface supplied by Bible Desktop. */
if (! defined('ABSPATH')) {
    exit;
}

add_shortcode('wp_cu_dictionary', 'wp_cu_translator_dictionary_shortcode');
add_action('wp_ajax_georsltr_dictionary', 'wp_cu_translator_dictionary_ajax');
add_action('wp_ajax_nopriv_georsltr_dictionary', 'wp_cu_translator_dictionary_ajax');

/** Only the documented public module and validated parameters may reach the API. */
function wp_cu_translator_dictionary_path(array $input)
{
    $base = '/api/dictionaries/AZBYKA_CU_FULL';
    $operation = $input['operation'] ?? 'search';
    if ($operation === 'alphabet') {
        return $base.'/alphabet';
    }
    if ($operation === 'entry' && is_string($input['key'] ?? null) && preg_match('/^[a-f0-9]{40}$/D', $input['key'])) {
        return $base.'/entries/'.$input['key'];
    }
    $q = $input['q'] ?? '';
    $mode = $input['mode'] ?? 'word';
    $offset = filter_var($input['offset'] ?? 0, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 1000000]]);
    $letter = $input['letter'] ?? '';
    $validLetter = $letter === '' ? '' : filter_var($letter, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 36]]);
    if ($operation !== 'search' || ! is_string($q) || (function_exists('mb_strlen') ? mb_strlen($q) : strlen($q)) > 120 || ! in_array($mode, ['word', 'meaning'], true) || $offset === false || $validLetter === false) {
        return new WP_Error('invalid_dictionary_request');
    }
    $query = ['q' => sanitize_text_field($q), 'mode' => $mode, 'limit' => 20, 'offset' => $offset];
    if ($validLetter !== '') {
        $query['letter'] = $validLetter;
    }
    return add_query_arg($query, $base.'/search');
}

function wp_cu_translator_dictionary_ajax(): void
{
    check_ajax_referer('georsltr_dictionary', 'nonce');
    wp_cu_translator_request_locale(isset($_POST['georsltr_locale']) && is_string($_POST['georsltr_locale']) ? sanitize_text_field(wp_unslash($_POST['georsltr_locale'])) : '');
    $path = wp_cu_translator_dictionary_path(wp_unslash($_POST));
    if (is_wp_error($path)) {
        wp_send_json_error(['message' => __('Check the dictionary search parameters.', 'georg-kloster-slavonic-translator')], 422);
    }
    $cacheKey = 'georsltr_dict_'.hash('sha256', wp_cu_translator_settings()['api_url'].$path);
    $body = get_transient($cacheKey);
    if (! is_array($body)) {
        $response = wp_cu_translator_api_request('GET', $path);
        if (! $response['ok']) {
            $message = $response['status'] === 429 ? __('Too many dictionary requests. Please try again later.', 'georg-kloster-slavonic-translator') : __('The dictionary service is temporarily unavailable.', 'georg-kloster-slavonic-translator');
            wp_send_json_error(['message' => $message], max(400, min(599, $response['status'])));
        }
        $body = $response['body'];
        set_transient($cacheKey, $body, 5 * MINUTE_IN_SECONDS);
    }
    wp_send_json_success($body);
}

function wp_cu_translator_dictionary_assets(): void
{
    wp_cu_translator_register_assets();
    wp_enqueue_style('wp-cu-translator');
    wp_enqueue_style('georsltr-dictionary', WP_CU_TRANSLATOR_URL.'assets/dictionary.css', ['wp-cu-translator'], WP_CU_TRANSLATOR_VERSION);
    wp_enqueue_script('georsltr-dictionary', WP_CU_TRANSLATOR_URL.'assets/dictionary.js', [], WP_CU_TRANSLATOR_VERSION, true);
    wp_localize_script('georsltr-dictionary', 'georsltr_dictionary_config', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('georsltr_dictionary'),
        'strings' => [
            'loading' => __('Searching…', 'georg-kloster-slavonic-translator'),
            'failed' => __('The dictionary service is temporarily unavailable.', 'georg-kloster-slavonic-translator'),
            'empty' => __('No matching entries found.', 'georg-kloster-slavonic-translator'),
            'copy' => __('Copy word', 'georg-kloster-slavonic-translator'),
            'copied' => __('Copied', 'georg-kloster-slavonic-translator'),
            'source' => __('Read the source', 'georg-kloster-slavonic-translator'),
            'use' => __('Use in translator', 'georg-kloster-slavonic-translator'),
            'selection' => __('Select a word in the translation first.', 'georg-kloster-slavonic-translator'),
            'lookup' => __('Look up selected word', 'georg-kloster-slavonic-translator'),
        ],
    ]);
}

/** @param array<string, mixed> $attributes */
function wp_cu_translator_dictionary_combined(array $attributes): string
{
    wp_cu_translator_dictionary_assets();
    $id = wp_unique_id('georsltr-tools-');
    $translator = wp_cu_translator_shortcode(array_merge($attributes, ['dictionary' => 'no']));
    $dictionary = wp_cu_translator_dictionary_shortcode();
    $allowedHtml = wp_kses_allowed_html('post');
    foreach (['form', 'label', 'input', 'textarea', 'select', 'option', 'fieldset', 'legend', 'button', 'section', 'header', 'div', 'p'] as $tag) {
        $allowedHtml[$tag] = array_fill_keys(['class', 'id', 'role', 'aria-*', 'data-*', 'tabindex', 'hidden', 'type', 'name', 'value', 'rows', 'maxlength', 'required', 'placeholder', 'checked', 'disabled', 'autocomplete'], true);
    }
    ob_start();
    ?>
    <div class="georsltr-tools" data-georsltr-tools>
        <div class="georsltr-tools__tabs" role="tablist" aria-label="<?php echo esc_attr__('Language tools', 'georg-kloster-slavonic-translator'); ?>">
            <button id="<?php echo esc_attr($id.'translator-tab'); ?>" type="button" role="tab" aria-selected="true" aria-controls="<?php echo esc_attr($id.'translator'); ?>" data-georsltr-tab="translator"><?php echo esc_html__('Translator', 'georg-kloster-slavonic-translator'); ?></button>
            <button id="<?php echo esc_attr($id.'dictionary-tab'); ?>" type="button" role="tab" aria-selected="false" tabindex="-1" aria-controls="<?php echo esc_attr($id.'dictionary'); ?>" data-georsltr-tab="dictionary"><?php echo esc_html__('Dictionary', 'georg-kloster-slavonic-translator'); ?></button>
        </div>
        <div id="<?php echo esc_attr($id.'translator'); ?>" role="tabpanel" aria-labelledby="<?php echo esc_attr($id.'translator-tab'); ?>" data-georsltr-panel="translator"><?php echo wp_kses($translator, $allowedHtml); ?></div>
        <div id="<?php echo esc_attr($id.'dictionary'); ?>" role="tabpanel" aria-labelledby="<?php echo esc_attr($id.'dictionary-tab'); ?>" data-georsltr-panel="dictionary" hidden><?php echo wp_kses($dictionary, $allowedHtml); ?></div>
    </div>
    <?php
    return (string) ob_get_clean();
}

/** @param mixed $attributes */
function wp_cu_translator_dictionary_shortcode($attributes = []): string
{
    wp_cu_translator_load_textdomain();
    $attributes = shortcode_atts(['title' => __('Church Slavonic dictionary', 'georg-kloster-slavonic-translator')], is_array($attributes) ? $attributes : [], 'wp_cu_dictionary');
    wp_cu_translator_dictionary_assets();
    ob_start();
    ?>
    <section class="wp-cu-translator georsltr-dictionary" data-georsltr-dictionary>
        <header class="wp-cu-translator__header">
            <img class="wp-cu-translator__mark" src="<?php echo esc_url(WP_CU_TRANSLATOR_URL.'assets/translator-mark.png'); ?>" width="48" height="48" alt="">
            <h3 class="wp-cu-translator__title"><?php echo esc_html((string) $attributes['title']); ?></h3>
        </header>
        <form class="georsltr-dictionary__form" data-georsltr-search>
            <input type="hidden" name="georsltr_locale" value="<?php echo esc_attr(wp_cu_translator_ui_locale()); ?>">
            <label class="wp-cu-translator__label"><?php echo esc_html__('Word or Russian meaning', 'georg-kloster-slavonic-translator'); ?>
                <input class="wp-cu-translator__select" type="search" name="q" maxlength="120" autocomplete="off">
            </label>
            <div class="georsltr-dictionary__filters">
                <label class="wp-cu-translator__label"><?php echo esc_html__('Search in', 'georg-kloster-slavonic-translator'); ?>
                    <select class="wp-cu-translator__select" name="mode">
                        <option value="word"><?php echo esc_html__('Church Slavonic word', 'georg-kloster-slavonic-translator'); ?></option>
                        <option value="meaning"><?php echo esc_html__('Russian meaning', 'georg-kloster-slavonic-translator'); ?></option>
                    </select>
                </label>
                <label class="wp-cu-translator__label"><?php echo esc_html__('Alphabet', 'georg-kloster-slavonic-translator'); ?>
                    <select class="wp-cu-translator__select" name="letter">
                        <option value=""><?php echo esc_html__('All letters', 'georg-kloster-slavonic-translator'); ?></option>
                    </select>
                </label>
            </div>
            <p class="wp-cu-translator__hint"><?php echo esc_html__('Search with or without accents. Definitions are in Russian; a meaning match is not a sentence translation.', 'georg-kloster-slavonic-translator'); ?></p>
            <button class="wp-cu-translator__submit" type="submit"><?php echo esc_html__('Search', 'georg-kloster-slavonic-translator'); ?></button>
        </form>
        <p class="wp-cu-translator__hint wp-cu-translator__privacy"><?php echo esc_html__('Dictionary searches are sent to the configured Bible Desktop service. Entries retain their original spelling and source attribution.', 'georg-kloster-slavonic-translator'); ?>
            <a href="<?php echo esc_url(trailingslashit(wp_cu_translator_settings()['api_url']).'pages/api-privacy'); ?>"><?php echo esc_html__('Privacy Policy', 'georg-kloster-slavonic-translator'); ?></a>
        </p>
        <p class="wp-cu-translator__status" data-georsltr-dictionary-status role="status" aria-live="polite"></p>
        <div class="georsltr-dictionary__results" data-georsltr-results></div>
        <button class="wp-cu-translator__action" data-georsltr-more type="button" hidden><?php echo esc_html__('Load more', 'georg-kloster-slavonic-translator'); ?></button>
        <article class="georsltr-dictionary__article" data-georsltr-article hidden></article>
    </section>
    <?php
    return (string) ob_get_clean();
}
