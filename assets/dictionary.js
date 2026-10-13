(() => {
    'use strict';
    const config = window.georsltr_dictionary_config || {};
    const strings = config.strings || {};
    const node = (tag, text, className) => {
        const element = document.createElement(tag);
        if (text !== undefined) element.textContent = text;
        if (className) element.className = className;
        return element;
    };
    const sourceUrl = (value) => {
        try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch (_) { return null; }
    };
    document.querySelectorAll('[data-georsltr-tools]').forEach((tools) => {
        const tabs = [...tools.querySelectorAll('[data-georsltr-tab]')];
        const activate = (tab) => {
            tabs.forEach((item) => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
            tools.querySelectorAll('[data-georsltr-panel]').forEach((panel) => { panel.hidden = panel.dataset.georsltrPanel !== tab.dataset.georsltrTab; });
            if (tab.dataset.georsltrTab === 'dictionary') tools.querySelector('[data-georsltr-dictionary]').dispatchEvent(new Event('georsltr-open'));
        };
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => activate(tab));
            tab.addEventListener('keydown', (event) => {
                let next;
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
                if (event.key === 'Home') next = tabs[0];
                if (event.key === 'End') next = tabs[tabs.length - 1];
                if (next) { event.preventDefault(); activate(next); next.focus(); }
            });
        });
        const actions = tools.querySelector('.wp-cu-translator__actions');
        const output = tools.querySelector('[data-wp-cu-translator-text]');
        if (actions && output) {
            const lookup = node('button', strings.lookup, 'wp-cu-translator__action'); lookup.type = 'button';
            lookup.addEventListener('click', () => {
                const selection = window.getSelection();
                if (!selection || !selection.rangeCount || !output.contains(selection.anchorNode) || !output.contains(selection.focusNode) || !selection.toString().trim() || Array.from(selection.toString().trim()).length > 120) {
                    tools.querySelector('[data-wp-cu-translator-status]').textContent = strings.selection;
                    return;
                }
                const word = selection.toString().trim(); activate(tabs.find((tab) => tab.dataset.georsltrTab === 'dictionary'));
                const form = tools.querySelector('[data-georsltr-search]'); form.elements.q.value = word; form.elements.mode.value = 'word'; form.elements.letter.value = '';
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            });
            actions.append(lookup);
        }
    });
    document.querySelectorAll('[data-georsltr-dictionary]').forEach((root) => {
        const form = root.querySelector('[data-georsltr-search]');
        const status = root.querySelector('[data-georsltr-dictionary-status]');
        const results = root.querySelector('[data-georsltr-results]');
        const article = root.querySelector('[data-georsltr-article]');
        const more = root.querySelector('[data-georsltr-more]');
        let alphabetPromise, requestNumber = 0, articleNumber = 0, nextOffset = 0, searchFields = {};
        const request = async (fields) => {
            const data = new FormData();
            Object.entries({ ...fields, action: 'georsltr_dictionary', nonce: config.nonce, georsltr_locale: form.elements.georsltr_locale.value }).forEach(([key, value]) => data.append(key, value));
            const response = await fetch(config.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: data });
            const json = await response.json();
            if (!response.ok || !json.success) throw new Error(json?.data?.message || strings.failed);
            return json.data;
        };
        const alphabet = () => {
            if (!alphabetPromise) alphabetPromise = request({ operation: 'alphabet' }).then((body) => {
                body.data.forEach((letter) => { const option = node('option', `${letter.label} (${letter.count})`); option.value = String(letter.chapter); form.elements.letter.append(option); });
            }).catch((error) => { alphabetPromise = null; status.textContent = error.message || strings.failed; });
            return alphabetPromise;
        };
        const showArticle = async (key) => {
            const number = ++articleNumber; status.textContent = strings.loading;
            try {
                const body = await request({ operation: 'entry', key });
                if (number !== articleNumber) return;
                const item = body.data.lexical;
                if (!item || item.body_format !== 'plain-text') throw new Error(strings.failed);
                article.replaceChildren(node('h4', item.headword), node('p', item.civil), node('p', item.definition));
                const copy = node('button', strings.copy, 'wp-cu-translator__action'); copy.type = 'button';
                copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(item.headword); copy.textContent = strings.copied; } catch (_) { status.textContent = strings.failed; } });
                article.append(copy);
                const tools = root.closest('[data-georsltr-tools]');
                if (tools) {
                    const use = node('button', strings.use, 'wp-cu-translator__action'); use.type = 'button';
                    use.addEventListener('click', () => { const text = tools.querySelector('textarea[name="text"]'); text.setRangeText(item.headword, text.selectionStart, text.selectionEnd, 'end'); tools.querySelector('[data-georsltr-tab="translator"]').click(); text.focus(); });
                    article.append(use);
                }
                const url = sourceUrl(item.source_url);
                if (url) { const link = node('a', strings.source); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; article.append(link); }
                (body.data.links || []).forEach((related) => { if (!/^[a-f0-9]{40}$/.test(related.key)) return; const link = node('button', related.label, 'wp-cu-translator__action'); link.type = 'button'; link.addEventListener('click', () => showArticle(related.key)); article.append(link); });
                article.hidden = false; article.tabIndex = -1; article.focus(); status.textContent = '';
            } catch (error) { if (number === articleNumber) status.textContent = error.message || strings.failed; }
        };
        const search = async (append = false) => {
            const number = ++requestNumber; ++articleNumber;
            if (!append) { nextOffset = 0; results.replaceChildren(); article.hidden = true; searchFields = { q: form.elements.q.value.trim(), mode: form.elements.mode.value, letter: form.elements.letter.value }; }
            const submit = form.querySelector('button[type="submit"]'); submit.disabled = true; more.disabled = true; more.hidden = true; status.textContent = strings.loading;
            try {
                const body = await request({ operation: 'search', ...searchFields, offset: nextOffset });
                if (number !== requestNumber) return;
                if (!Array.isArray(body.data)) throw new Error(strings.failed);
                body.data.forEach((item) => {
                    const button = node('button', undefined, 'georsltr-dictionary__entry'); button.type = 'button';
                    button.append(node('strong', item.headword), node('span', item.civil), node('span', item.definition));
                    button.addEventListener('click', () => showArticle(item.key)); results.append(button);
                });
                nextOffset = Number(body.offset) + body.data.length;
                more.hidden = !body.data.length || nextOffset >= Number(body.total); status.textContent = results.childElementCount ? '' : strings.empty;
            } catch (error) { if (number === requestNumber) status.textContent = error.message || strings.failed; }
            finally { if (number === requestNumber) { submit.disabled = false; more.disabled = false; } }
        };
        root.addEventListener('georsltr-open', alphabet);
        form.addEventListener('submit', (event) => { event.preventDefault(); alphabet(); search(); });
        form.elements.letter.addEventListener('change', () => search());
        more.addEventListener('click', () => search(true));
        if (!root.closest('[data-georsltr-tools]')) form.elements.letter.addEventListener('focus', alphabet);
    });
})();
