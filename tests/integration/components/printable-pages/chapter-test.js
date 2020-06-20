import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

module("Integration | Component | printable-pages/chapter", function(hooks) {
  setupRenderingTest(hooks);

  module("with multiple chapters", function() {
    let renderTemplate = function(context) {
      context.set(
        "sectionData",
        [...Array(Number(context.sectionCount))].map((_, i) => i)
      );
      return render(hbs`
      {{#printable-pages as |document|}}
        {{#document.chapter as |chapter|}}
          {{! template-lint-disable no-inline-styles}}
          {{#chapter.page-header as |header|}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-header}}

          {{#chapter.section columnCount=this.columnCount data=this.sectionData}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);"></div>
          {{/chapter.section}}

          {{#chapter.page-footer as |footer|}}
            <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-footer}}
          {{! template-lint-enable no-inline-styles}}
        {{/document.chapter}}

        {{#document.chapter as |chapter|}}
          {{! template-lint-disable no-inline-styles}}
          {{#chapter.page-header as |header|}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-header}}

          {{#chapter.section columnCount=this.columnCount data=this.sectionData}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);"></div>
          {{/chapter.section}}

          {{#chapter.page-footer as |footer|}}
            <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-footer}}
          {{! template-lint-enable no-inline-styles}}
        {{/document.chapter}}
      {{/printable-pages}}
    `);
    };

    test("1 page each, 1 item", async function(assert) {
      this.set("columnCount", 1);
      this.set("sectionCount", 1);

      await renderTemplate(this);

      assert.dom("[data-test-chapter]").exists({ count: 2 });
      assert.dom("[data-test-page]").exists({ count: 2 });

      assert
        .dom("[data-test-chapter='0'] [data-test-page]")
        .exists({ count: 1 });
      assert
        .dom("[data-test-chapter='1'] [data-test-page]")
        .exists({ count: 1 });
    });

    test("2 pages each, 2nd page in each chapter has 1 item", async function(assert) {
      this.set("columnCount", 1);
      this.set("sectionCount", 16);

      await renderTemplate(this);

      assert.dom("[data-test-chapter]").exists({ count: 2 });
      assert.dom("[data-test-page]").exists({ count: 4 });

      assert
        .dom("[data-test-chapter='0'] [data-test-page]")
        .exists({ count: 2 });
      assert
        .dom("[data-test-chapter='1'] [data-test-page]")
        .exists({ count: 2 });

      assert
        .dom(
          "[data-test-chapter='0'] [data-test-page='1'] [data-test-section-item]"
        )
        .exists({ count: 15 });
      assert
        .dom(
          "[data-test-chapter='0'] [data-test-page='2'] [data-test-section-item]"
        )
        .exists({ count: 1 });

      assert
        .dom(
          "[data-test-chapter='1'] [data-test-page='3'] [data-test-section-item]"
        )
        .exists({ count: 15 });
      assert
        .dom(
          "[data-test-chapter='1'] [data-test-page='4'] [data-test-section-item]"
        )
        .exists({ count: 1 });
    });
  });
});
