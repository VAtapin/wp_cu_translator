=== Atapin Church Slavonic Translator ===
Contributors: atapin
Tags: church slavonic, translator, bible, orthodox, ai
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 8.0
Stable tag: 1.0.5
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Translate text into Church Slavonic using the Bible Desktop translation service.

== Description ==

Atapin Church Slavonic Translator adds a compact translation form through the `[wp_cu_translator]` shortcode. It accepts Russian and German text, supports automatic language detection and lets the visitor choose accents, titlo, breathings and Slavonic numbers.

The plugin works without an API key using the free public Bible Desktop API tier. The free tier has usage limits to protect the service and control external AI processing costs. An optional API key can be configured for higher limits and additional authorized functionality. No secret API credentials are bundled with the plugin.

The browser sends the form to WordPress. WordPress then contacts Bible Desktop server-to-server, so an optional Bible Desktop API key is never included in the page HTML or JavaScript.

The plugin name, description, settings page, messages and public form are available in English, Russian and German. WordPress selects the language from its current locale.

Biblical references, exact verses, confidently recognized quotations and cached results can be returned without a new paid OpenAI request. Other texts use the model and spending limits configured by the Bible Desktop administrator.

== Installation ==

1. In WordPress open **Plugins → Add New → Upload Plugin** and upload `atapin-church-slavonic-translator.zip`.
2. Activate **Atapin Church Slavonic Translator**. The free public tier works immediately.
3. Optionally create a key under **Bible Desktop → System → AI integration → External sites** and save it under **Atapin Church Slavonic Translator → Settings** for higher limits.
4. Use **Check connection**. This check does not call OpenAI.
5. Add `[wp_cu_translator]` to a page.

Optional custom title:

`[wp_cu_translator title="Перевод на церковнославянский"]`

== Shortcodes and settings ==

The plugin has its own WordPress admin menu. **Atapin Church Slavonic Translator → Settings** contains the Bible Desktop URL, optional API key, timeout and connection check. **Atapin Church Slavonic Translator → Shortcodes** lists each supported shortcode with a ready-to-copy example and explanation. The same shortcode reference is also available at the bottom of the settings page.

== Frequently Asked Questions ==

= Does the plugin expose the API key to visitors? =

No. Translation requests are proxied by WordPress, and an optional key remains on the WordPress server. The free tier needs no secret key.

= Does every translation cost money? =

No. Bible references, matching quotations and cached translations may be handled without a new OpenAI request. Global hourly and daily limits remain controlled by Bible Desktop.

= How do I use Church Slavonic text in Microsoft Word? =

Use **Copy with formatting** and install Monomakh Unicode from the link below the result. If Word does not select it automatically, select the pasted text and assign Monomakh Unicode manually.

== External Services ==

This plugin relies on the external Bible Desktop service to translate text into Church Slavonic. Only when a visitor submits the translation form, the WordPress server sends the source text, source-language selection and orthography options to `https://bible-desktop.com/api/v1/church-slavonic/translate`. Request headers include the plugin client name, a non-secret installation UUID for usage quotas and a per-visitor HMAC identifier derived from the visitor's IP address using a WordPress secret for rate limiting. If configured, the optional Bible Desktop API key is also sent server-to-server. The visitor's original IP address is not sent to Bible Desktop by the plugin; the service receives the WordPress server's IP address as part of the network connection.

Only when an administrator presses **Check connection**, the WordPress server calls `https://bible-desktop.com/api/v1/church-slavonic/status`. This request includes the plugin client name, installation UUID and optional API key, but no translation text or visitor identifier, and does not invoke OpenAI. Activation and viewing the translation form do not send requests to Bible Desktop.

When a visitor clicks **Download font**, their browser requests `https://bible-desktop.com/fonts/MonomakhUnicode.ttf` directly from Bible Desktop. This download reveals the visitor's IP address and ordinary browser request information to that service. The plugin does not automatically load the remote font.

Bible Desktop may send submitted text to OpenAI to generate a translation. Biblical references, matching quotations and cached results may be processed without a new OpenAI request. The plugin itself does not connect directly to OpenAI. OpenAI API terms: https://openai.com/policies/business-terms/ ; privacy policy: https://openai.com/policies/privacy-policy/ .

If an administrator changes **Bible Desktop URL**, the API and font requests use that configured service instead. The administrator must check that service's data handling and inform site visitors before offering the form.

The service is operated by Bible Desktop. API Terms of Service: https://bible-desktop.com/pages/api-terms . API Privacy Policy: https://bible-desktop.com/pages/api-privacy . These documents cover the API, translation data and optional OpenAI processing.

== Privacy ==

The plugin does not create its own database tables and does not store translation text. The Bible Desktop URL, optional external API key, timeout and non-secret installation UUID are stored in the WordPress options table. Requests are subject to the logging, retention and AI settings configured on the connected Bible Desktop server.

== Changelog ==

= 1.0.5 =
* Use the distinctive Atapin Church Slavonic Translator name and matching WordPress.org slug/text domain.
* Document external translation requests, identifiers, font downloads and OpenAI processing, with direct provider terms and privacy links.
* Inform visitors about external text processing before submission and link to the configured provider documents.
* Preserve existing shortcode names, settings and installation identifiers.

= 1.0.4 =
* Added a complete responsive fallback layout for the public form, using zero-specificity `:where()` selectors and no `!important` rules.
* Added dedicated styling hooks for text, language, orthography and copy controls. Theme CSS can override every interface rule.

= 1.0.3 =
* Removed all translator interface styling, so the active WordPress theme controls the form, buttons, checkboxes and layout.
* Kept only the Monomakh Unicode output font and paragraph preservation required for translated Church Slavonic text.

= 1.0.2 =
* Let the active WordPress theme control the translator typography and standard form controls.
* Changed the frontend translator title from an h2 to an h3 heading.

= 1.0.1 =
* Added a dedicated Atapin Church Slavonic Translator administration menu with Settings and Shortcodes pages.
* Added a shortcode reference with ready-to-copy examples and explanations to the settings page and the separate Shortcodes page.

= 1.0.0 =
* Initial release with server-side Bible Desktop integration, connection check and `[wp_cu_translator]` shortcode.
* Added Russian, German and automatic source-language selection.
* Added orthography options, plain and formatted copying, and Monomakh Unicode download guidance.
* Added English, Russian and German localization for plugin metadata, administration and public output.
* Added an immediately usable free public tier, persistent installation UUID, server-side quotas and optional API keys for higher limits.
