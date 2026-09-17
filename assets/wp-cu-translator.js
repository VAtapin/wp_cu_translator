(() => {
    'use strict';

    const config = window.WPCUTranslator || {};
    const strings = config.strings || {};
    const message = (key, fallback) => strings[key] || fallback;

    const copyPlain = async (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
    };

    const escapeHtml = (value) => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const formattedHtml = (text) => text
        .split(/\n{2,}/)
        .map((paragraph) => `<p style="font-family: 'Monomakh Unicode', serif;">${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
        .join('');

    const copyRich = async (text) => {
        if (!navigator.clipboard || !window.ClipboardItem || !window.isSecureContext) {
            await copyPlain(text);
            return false;
        }

        const item = new ClipboardItem({
            'text/plain': new Blob([text], { type: 'text/plain' }),
            'text/html': new Blob([formattedHtml(text)], { type: 'text/html' }),
        });
        await navigator.clipboard.write([item]);
        return true;
    };

    const temporaryLabel = (button, text) => {
        const original = button.textContent;
        button.textContent = text;
        window.setTimeout(() => { button.textContent = original; }, 1800);
    };

    const initialize = (root) => {
        const form = root.querySelector('[data-wp-cu-translator-form]');
        const status = root.querySelector('[data-wp-cu-translator-status]');
        const result = root.querySelector('[data-wp-cu-translator-result]');
        const output = root.querySelector('[data-wp-cu-translator-text]');
        const match = root.querySelector('[data-wp-cu-translator-match]');
        const submit = form.querySelector('button[type="submit"]');
        let translatedText = '';

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            status.classList.remove('wp-cu-translator__status--error');
            status.textContent = message('translating', 'Translating…');
            submit.disabled = true;

            const data = new FormData(form);
            data.append('action', 'wp_cu_translator_translate');
            data.append('nonce', config.nonce || '');

            try {
                const response = await fetch(config.ajaxUrl, {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: data,
                });
                const json = await response.json();
                if (!response.ok || !json.success) {
                    throw new Error(json?.data?.message || message('translationFailed', 'Translation could not be completed.'));
                }

                translatedText = json.data.translated_text || '';
                output.textContent = translatedText;
                if (json.data.matched_reference) {
                    match.textContent = message('recognizedAs', 'Recognized as %s').replace('%s', json.data.matched_reference);
                    match.hidden = false;
                } else {
                    match.hidden = true;
                }
                result.hidden = false;
                status.textContent = json.data.cache_hit
                    ? message('readyCached', 'Ready — the result was loaded from cache.')
                    : message('ready', 'Ready.');
                result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (error) {
                status.textContent = error instanceof Error
                    ? error.message
                    : message('translationFailed', 'Translation could not be completed.');
                status.classList.add('wp-cu-translator__status--error');
            } finally {
                submit.disabled = false;
            }
        });

        root.querySelector('[data-wp-cu-translator-copy]').addEventListener('click', async (event) => {
            if (!translatedText) return;
            try {
                await copyPlain(translatedText);
                temporaryLabel(event.currentTarget, message('copied', 'Copied'));
            } catch (_) {
                temporaryLabel(event.currentTarget, message('copyFailed', 'Could not copy'));
            }
        });

        root.querySelector('[data-wp-cu-translator-copy-rich]').addEventListener('click', async (event) => {
            if (!translatedText) return;
            try {
                const rich = await copyRich(translatedText);
                temporaryLabel(
                    event.currentTarget,
                    rich ? message('copied', 'Copied') : message('copiedPlain', 'Plain text copied'),
                );
            } catch (_) {
                temporaryLabel(event.currentTarget, message('copyFailed', 'Could not copy'));
            }
        });
    };

    document.querySelectorAll('[data-wp-cu-translator]').forEach(initialize);
})();
