# Changelog

## 1.0.4

- Added responsive fallback styling for the public form with zero-specificity `:where()` selectors and no `!important` declarations.
- Added dedicated classes for every public form control so a site theme can override the fallback styling cleanly.

## 1.0.3

- Removed all translator interface styling, so the active WordPress theme controls the form, buttons, checkboxes and layout.
- Kept only the Monomakh Unicode output font and paragraph preservation required for translated Church Slavonic text.

## 1.0.2

- Let the active WordPress theme control the translator typography and standard form controls.
- Changed the frontend translator title from an h2 to an h3 heading.

## 1.0.1

- Added a dedicated WordPress admin menu for the translator with Settings and Shortcodes pages.
- Added ready-to-copy shortcode examples and explanations in the plugin administration.

## 1.0.0

- Added the `[wp_cu_translator]` shortcode and responsive translation form.
- Added an immediately usable free public API tier and optional server-side authentication for higher limits.
- Added a persistent non-secret installation UUID for fair server-side quota accounting.
- Added a free connection check, configurable timeout and HTTPS-only endpoint validation.
- Added Russian, German and automatic language selection.
- Added Church Slavonic orthography controls, corpus-match labels and cache status.
- Added plain-text and formatted copying plus Monomakh Unicode installation guidance.
- Added English, Russian and German localization for plugin metadata, administration and frontend messages.
- Added tag-driven GitHub Release packaging.
