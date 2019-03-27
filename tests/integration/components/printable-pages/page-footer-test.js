import { module, skip } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

module("Integration | Component | printable-pages/page-footer", function(
  hooks
) {
  setupRenderingTest(hooks);

  skip("it renders", async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{printable-pages/page-footer}}`);

    assert.equal(this.element.textContent.trim(), "");

    // Template block usage:
    await render(hbs`
      {{#printable-pages/page-footer}}
        template block text
      {{/printable-pages/page-footer}}
    `);

    assert.equal(this.element.textContent.trim(), "template block text");
  });
});
