import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

module("Integration | Component | printable-pages/section", function (hooks) {
  setupRenderingTest(hooks);

  module("single-item section", function () {
    let renderTemplate = function (context) {
      context.set(
        "sectionData",
        [...Array(Number(context.sectionCount))].map((_, i) => i)
      );
      return render(hbs`
      {{#printable-pages as |document|}}
        {{#document.chapter as |chapter|}}

          {{! template-lint-disable no-inline-styles}}
          {{#chapter.page-header}}
            <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-header}}

          {{#chapter.section}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">
              Default Section Content
            </div>
          {{/chapter.section}}

          {{#chapter.page-footer as |footer|}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-footer}}
          {{! template-lint-enable no-inline-styles}}
        {{/document.chapter}}
      {{/printable-pages}}
    `);
    };

    test("it renders", async function (assert) {
      this.set("columnCount", 1);
      this.set("sectionCount", 1);

      await renderTemplate(this);

      assert.dom("[data-test-page='1'] [data-test-section]").hasText("Default Section Content");
    });
  });

  module("multiple single-item sections", function () {
    let renderTemplate = function (context) {
      context.set(
        "sectionData",
        [...Array(Number(context.sectionCount))].map((_, i) => i)
      );
      return render(hbs`
      {{#printable-pages as |document|}}
        {{#document.chapter as |chapter|}}

          {{! template-lint-disable no-inline-styles}}
          {{#chapter.page-header}}
            <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-header}}

          {{#chapter.section}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">
              Default Section 1 Content
            </div>
          {{/chapter.section}}

          {{#chapter.section}}
            <div style="height: 500px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">
              Default Section 2 Content
            </div>
          {{/chapter.section}}

          {{#chapter.section}}
            <div style="height: 500px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">
              Default Section 3 Content
            </div>
          {{/chapter.section}}

          {{#chapter.page-footer as |footer|}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-footer}}
          {{! template-lint-enable no-inline-styles}}
        {{/document.chapter}}
      {{/printable-pages}}
    `);
    };

    test("it renders", async function (assert) {
      this.set("columnCount", 1);
      this.set("sectionCount", 1);

      await renderTemplate(this);

      assert.dom("[data-test-page='1'] [data-test-section]:nth-of-type(1)").hasText("Default Section 1 Content");

      assert.dom("[data-test-page='1'] [data-test-section]:nth-of-type(2)").hasText("Default Section 2 Content");

      assert.dom("[data-test-page='1'] [data-test-section]:nth-of-type(3)").doesNotExist();

      assert.dom("[data-test-page='2'] [data-test-section]:nth-of-type(1)").hasText("Default Section 3 Content");
    });
  });

  module("single-item section which is larger than the page", function () {
    let renderTemplate = function (context) {
      context.set(
        "sectionData",
        [...Array(Number(context.sectionCount))].map((_, i) => i)
      );
      return render(hbs`
      {{#printable-pages as |document|}}
        {{#document.chapter as |chapter|}}

          {{! template-lint-disable no-inline-styles}}
          {{#chapter.page-header}}
            <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-header}}

          {{#chapter.section}}
            <div style="height: 5000px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">
              Default Section Content
            </div>
          {{/chapter.section}}

          {{#chapter.section}}
            <div style="height: 200px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">
              Default Section 2 Content
            </div>
          {{/chapter.section}}

          {{#chapter.page-footer as |footer|}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-footer}}
          {{! template-lint-enable no-inline-styles}}
        {{/document.chapter}}
      {{/printable-pages}}
    `);
    };

    test("it renders", async function (assert) {
      this.set("columnCount", 1);
      this.set("sectionCount", 1);

      await renderTemplate(this);

      assert.dom("[data-test-page='1'] [data-test-section]").hasText("Default Section Content");

      assert.dom("[data-test-page='2'] [data-test-section]").hasText("Default Section 2 Content");
    });
  });

  module("single-item section which is larger than the page on the second page", function () {
    let renderTemplate = function (context) {
      context.set(
        "sectionData",
        [...Array(Number(context.sectionCount))].map((_, i) => i)
      );
      return render(hbs`
    {{#printable-pages as |document|}}
      {{#document.chapter as |chapter|}}

        {{! template-lint-disable no-inline-styles}}
        {{#chapter.page-header}}
          <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
          </div>
        {{/chapter.page-header}}

        {{#chapter.section}}
          <div style="height: 500px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">
            Default Section 1 Content
          </div>
        {{/chapter.section}}

        {{#chapter.section}}
          <div style="height: 500px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">
            Default Section 2 Content
          </div>
        {{/chapter.section}}

        {{#chapter.page-footer as |footer|}}
          <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
          </div>
        {{/chapter.page-footer}}
        {{! template-lint-enable no-inline-styles}}
      {{/document.chapter}}
    {{/printable-pages}}
  `);
    };

    test("it renders", async function (assert) {
      this.set("columnCount", 1);
      this.set("sectionCount", 1);

      await renderTemplate(this);

      assert.dom("[data-test-page='2'] [data-test-section]").hasText("Default Section 2 Content");
    });
  });
});
