import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync('assets/wp-cu-translator.js', 'utf8');
const element = () => ({
  textContent: '', hidden: true, disabled: false, handlers: {},
  classList: { add() {}, remove() {} },
  addEventListener(name, handler) { this.handlers[name] = handler; },
  scrollIntoView() {},
});
for (const success of [true, false]) {
  const controls = Object.fromEntries([
    'form', 'status', 'result', 'text', 'match', 'copy', 'copy-rich',
  ].map((name) => [name, element()]));
  const button = element();
  controls.form.querySelector = () => button;
  const root = { querySelector(selector) {
    return controls[selector.match(/data-wp-cu-translator-(.+)\]/)[1]];
  } };
  let request;
  runInNewContext(script, {
    window: {
      georsltr_config: { ajaxUrl: '/correct-ajax', nonce: 'correct-nonce', strings: { ready: 'Localized ready' } },
      WPCUTranslator: { ajaxUrl: '/unrelated-ajax', nonce: 'unrelated-nonce' },
    },
    document: { querySelectorAll: () => [root] },
    FormData: class { constructor() { this.fields = new Map(); } append(key, value) { this.fields.set(key, value); } },
    fetch: async (url, options) => {
      request = { url, options };
      return { ok: success, json: async () => success
        ? { success: true, data: { translated_text: '<sample translation>', matched_reference: 'John 1:1' } }
        : { success: false, data: { message: 'API quota reached' } } };
    },
  });
  await controls.form.handlers.submit({ preventDefault() {} });
  assert.equal(request.url, '/correct-ajax');
  assert.equal(request.options.body.fields.get('nonce'), 'correct-nonce');
  assert.equal(request.options.body.fields.get('action'), 'wp_cu_translator_translate');
  assert.equal(button.disabled, false);
  assert.equal(controls.status.textContent, success ? 'Localized ready' : 'API quota reached');
  if (success) {
    assert.equal(controls.text.textContent, '<sample translation>');
    assert.equal(controls.result.hidden, false);
    assert.equal(controls.match.textContent, 'Recognized as John 1:1');
  }
}
console.log('Frontend uses the prefixed configuration for AJAX URL, nonce, localization, results and API errors.');
