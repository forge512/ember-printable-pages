import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render, settled } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

/*
 * A note on testing strategy in this file...
 *
 * The magic of printable pages lies in how service:printable-page interacts with
 * component:printable-pages/chapter-page. The service guesses at how many items
 * will fit on a page in response the chapter-page component to calls actions when it
 * is too full or it has room for more items.
 *
 * Because of the way the guesswork and overflow works, it is important to test
 * the placement of items across multiple pages so we can ensure the interactions
 * and element tracking behave as expected.
 *
 */

module("Integration | Component | printable-pages", function(hooks) {
  setupRenderingTest(hooks);

  module("homogeneous section items", function() {
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
      {{/printable-pages}}
    `);
    };

    module("1 column", function(hooks) {
      hooks.beforeEach(function() {
        this.set("columnCount", 1);
      });

      test("1 page, 1 item", async function(assert) {
        this.set("sectionCount", 1);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert
          .dom("[data-test-section-item]")
          .exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("1 page, 5 items (partially full page)", async function(assert) {
        this.set("sectionCount", 5);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert
          .dom("[data-test-section-item]")
          .exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("1 page, full page", async function(assert) {
        this.set("sectionCount", 16);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert
          .dom("[data-test-section-item]")
          .exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page has one item", async function(assert) {
        this.set("sectionCount", 17);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 16 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 1 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page is full", async function(assert) {
        this.set("sectionCount", 32);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 16 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 16 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 1 item", async function(assert) {
        this.set("sectionCount", 33);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 16 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 16 });
        assert
          .dom("[data-test-page='3'] [data-test-section-item]")
          .exists({ count: 1 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 5 items", async function(assert) {
        this.set("sectionCount", 37);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 16 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 16 });
        assert
          .dom("[data-test-page='3'] [data-test-section-item]")
          .exists({ count: 5 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });
    });

    module("2 columns", function(hooks) {
      hooks.beforeEach(function() {
        this.set("columnCount", 2);
      });

      test("1 page, full page", async function(assert) {
        this.set("sectionCount", 32);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert
          .dom("[data-test-section-item]")
          .exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page has one item", async function(assert) {
        this.set("sectionCount", 33);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 32 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 1 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page is full", async function(assert) {
        this.set("sectionCount", 64);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 32 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 32 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 1 item", async function(assert) {
        this.set("sectionCount", 65);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 32 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 32 });
        assert
          .dom("[data-test-page='3'] [data-test-section-item]")
          .exists({ count: 1 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 5 items", async function(assert) {
        this.set("sectionCount", 69);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 32 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 32 });
        assert
          .dom("[data-test-page='3'] [data-test-section-item]")
          .exists({ count: 5 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });
    });

    module("3 columns", function(hooks) {
      hooks.beforeEach(function() {
        this.set("columnCount", 3);
      });

      test("1 page, full page", async function(assert) {
        this.set("sectionCount", 48);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert
          .dom("[data-test-section-item]")
          .exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page has one item", async function(assert) {
        this.set("sectionCount", 49);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 48 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 1 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page is full", async function(assert) {
        this.set("sectionCount", 96);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 48 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 48 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 1 item", async function(assert) {
        this.set("sectionCount", 97);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 48 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 48 });
        assert
          .dom("[data-test-page='3'] [data-test-section-item]")
          .exists({ count: 1 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 5 items", async function(assert) {
        this.set("sectionCount", 101);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 48 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 48 });
        assert
          .dom("[data-test-page='3'] [data-test-section-item]")
          .exists({ count: 5 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });
    });
  });

  module("variable height section items", function() {
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

          {{#chapter.section columnCount=this.columnCount data=this.sectionData as |section|}}
            {{#if (eq (mod section.index 5) 0)}}
              <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{section.index}}</div>
            {{else if (eq (mod section.index 5) 1)}}
              <div style="height: 100px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{section.index}}</div>
            {{else if (eq (mod section.index 5) 2)}}
              <div style="height: 150px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{section.index}}</div>
            {{else if (eq (mod section.index 5) 3)}}
              <div style="height: 200px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{section.index}}</div>
            {{else if (eq (mod section.index 5) 4)}}
              <div style="height: 250px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{section.index}}</div>
            {{/if}}
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

    module("1 column", function(hooks) {
      hooks.beforeEach(function() {
        this.set("columnCount", 1);
      });

      test("1 page, 1 item", async function(assert) {
        this.set("sectionCount", 1);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert
          .dom("[data-test-section-item]")
          .exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("1 page, 5 items (partially full page)", async function(assert) {
        this.set("sectionCount", 3);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert
          .dom("[data-test-section-item]")
          .exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("1 page, full page", async function(assert) {
        this.set("sectionCount", 6);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert
          .dom("[data-test-section-item]")
          .exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page has one item", async function(assert) {
        this.set("sectionCount", 7);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 6 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 1 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page is full", async function(assert) {
        this.set("sectionCount", 12);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 6 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 6 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 1 item", async function(assert) {
        this.set("sectionCount", 13);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 6 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 6 });
        assert
          .dom("[data-test-page='3'] [data-test-section-item]")
          .exists({ count: 1 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 3 items", async function(assert) {
        this.set("sectionCount", 15);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert
          .dom("[data-test-page='1'] [data-test-section-item]")
          .exists({ count: 6 });
        assert
          .dom("[data-test-page='2'] [data-test-section-item]")
          .exists({ count: 6 });
        assert
          .dom("[data-test-page='3'] [data-test-section-item]")
          .exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });
    });
  });

  module("item height grows after initial render", function() {
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
            <div style="margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">
              <div style="height: 50px;"></div>
              {{#if this.displayExpandedItems}}<div style="height: 50px;"></div>{{/if}}
            </div>
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

    test("1 page, 16 items", async function(assert) {
      this.set("displayExpandedItems", false);
      this.set("columnCount", 1);
      this.set("sectionCount", 16);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 1 });
      assert
        .dom("[data-test-page='1'] [data-test-section-item]")
        .exists({ count: 16 });
      assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();

      this.set("displayExpandedItems", true);
      await settled();

      assert.dom("[data-test-page]").exists({ count: 2 });
      assert
        .dom("[data-test-page='1'] [data-test-section-item]")
        .exists({ count: 8 });
      assert
        .dom("[data-test-page='2'] [data-test-section-item]")
        .exists({ count: 8 });
    });
  });
});
