import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render, settled } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import { timeout } from "ember-concurrency";
import { tracked } from "@glimmer/tracking";

/*
 * A note on testing strategy in this file...
 *
 * The magic of printable pages lies in how service:printable-page interacts with
 * component:printable-pages/chapter-page. The service guesses at how many items
 * will fit on a page in response the chapter-page component calls actions when it
 * is too full or it has room for more items.
 *
 * Because of the way the guesswork and overflow works, it is important to test
 * the placement of items across multiple pages so we can ensure the interactions
 * and element tracking behave as expected.
 *
 */

module("Integration | Component | printable-pages", function (hooks) {
  setupRenderingTest(hooks);

  module("homogeneous section items", function () {
    let renderTemplate = function (context) {
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

    module("1 column", function (hooks) {
      hooks.beforeEach(function () {
        this.set("columnCount", 1);
      });

      test("1 page, 1 item", async function (assert) {
        this.set("sectionCount", 1);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-section-item]").exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("1 page, 5 items (partially full page)", async function (assert) {
        this.set("sectionCount", 5);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-section-item]").exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("1 page, full page", async function (assert) {
        this.set("sectionCount", 15);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-section-item]").exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page has one item", async function (assert) {
        this.set("sectionCount", 16);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 15 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 1 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page is full", async function (assert) {
        this.set("sectionCount", 30);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 15 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 15 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 1 item", async function (assert) {
        this.set("sectionCount", 31);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 15 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 15 });
        assert.dom("[data-test-page='3'] [data-test-section-item]").exists({ count: 1 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 5 items", async function (assert) {
        this.set("sectionCount", 35);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 15 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 15 });
        assert.dom("[data-test-page='3'] [data-test-section-item]").exists({ count: 5 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });
    });

    module("2 columns", function (hooks) {
      hooks.beforeEach(function () {
        this.set("columnCount", 2);
      });

      test("1 page, full page", async function (assert) {
        this.set("sectionCount", 30);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-section-item]").exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page has one item", async function (assert) {
        this.set("sectionCount", 31);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 30 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 1 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page is full", async function (assert) {
        this.set("sectionCount", 60);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 30 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 30 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 1 item", async function (assert) {
        this.set("sectionCount", 61);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 30 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 30 });
        assert.dom("[data-test-page='3'] [data-test-section-item]").exists({ count: 1 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 5 items", async function (assert) {
        this.set("sectionCount", 65);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 30 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 30 });
        assert.dom("[data-test-page='3'] [data-test-section-item]").exists({ count: 5 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });
    });

    module("3 columns", function (hooks) {
      hooks.beforeEach(function () {
        this.set("columnCount", 3);
      });

      test("1 page, full page", async function (assert) {
        this.set("sectionCount", 45);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-section-item]").exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page has one item", async function (assert) {
        this.set("sectionCount", 46);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 45 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 1 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page is full", async function (assert) {
        this.set("sectionCount", 90);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 45 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 45 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 1 item", async function (assert) {
        this.set("sectionCount", 91);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 45 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 45 });
        assert.dom("[data-test-page='3'] [data-test-section-item]").exists({ count: 1 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 5 items", async function (assert) {
        this.set("sectionCount", 95);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 45 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 45 });
        assert.dom("[data-test-page='3'] [data-test-section-item]").exists({ count: 5 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });
    });
  });

  module("variable height section items", function () {
    let renderTemplate = function (context) {
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

          {{#chapter.section columnCount=this.columnCount data=this.sectionData as |section index|}}
            {{#if (eq (mod index 5) 0)}}
              <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{index}}</div>
            {{else if (eq (mod index 5) 1)}}
              <div style="height: 100px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{index}}</div>
            {{else if (eq (mod index 5) 2)}}
              <div style="height: 150px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{index}}</div>
            {{else if (eq (mod index 5) 3)}}
              <div style="height: 200px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{index}}</div>
            {{else if (eq (mod index 5) 4)}}
              <div style="height: 250px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);">{{index}}</div>
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

    module("1 column", function (hooks) {
      hooks.beforeEach(function () {
        this.set("columnCount", 1);
      });

      test("1 page, 1 item", async function (assert) {
        this.set("sectionCount", 1);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-section-item]").exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("1 page, 5 items (partially full page)", async function (assert) {
        this.set("sectionCount", 3);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-section-item]").exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("1 page, full page", async function (assert) {
        this.set("sectionCount", 6);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-section-item]").exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page has one item", async function (assert) {
        this.set("sectionCount", 7);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 6 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 1 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("2 pages, 2nd page is full", async function (assert) {
        this.set("sectionCount", 11);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 6 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 5 });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 1 item", async function (assert) {
        this.set("sectionCount", 12);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 6 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 5 });
        assert.dom("[data-test-page='3'] [data-test-section-item]").exists({ count: 1 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });

      test("3 pages, 3rd page has 3 items", async function (assert) {
        this.set("sectionCount", 14);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 6 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 5 });
        assert.dom("[data-test-page='3'] [data-test-section-item]").exists({ count: 3 });

        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
      });
    });
  });

  module("item height grows after initial render", function () {
    let renderTemplate = function (context) {
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
              {{#if this.displayExpandedItems}}<div style="height: 50px;">expanded</div>{{/if}}
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

    test("1 page, 16 items", async function (assert) {
      this.set("displayExpandedItems", false);
      this.set("columnCount", 1);
      this.set("sectionCount", 15);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 1 });
      assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 15 });
      assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();

      this.set("displayExpandedItems", true);
      await timeout(200);
      await settled();

      assert.dom("[data-test-page]").exists({ count: 2 });
      assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 8 });
      assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 7 });
    });
  });

  module("multiple sections", function () {
    let renderTemplate = function (context) {
      context.set(
        "sections",
        [...Array(Number(context.sectionCount))].map((_, i) => i)
      );
      context.set(
        "sectionData",
        [...Array(Number(context.itemsPerSection))].map((_, i) => i)
      );
      return render(hbs`
        {{#printable-pages as |document|}}
          {{#document.chapter as |chapter|}}
            {{! template-lint-disable no-inline-styles}}
            {{#chapter.page-header as |header|}}
              <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
              </div>
            {{/chapter.page-header}}

            {{#each this.sections as |s i|}}
              {{#chapter.section data=this.sectionData as |section index|}}
                <div
                  style="height: 45px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);"
                  data-test-item-for-section={{i}}
                >
                  section {{i}}, item index {{index}}
                </div>
              {{/chapter.section}}
            {{/each}}

            {{#chapter.page-footer as |footer|}}
              <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
              </div>
            {{/chapter.page-footer}}
            {{! template-lint-enable no-inline-styles}}
          {{/document.chapter}}
        {{/printable-pages}}
      `);
    };

    test("1 page fitting 2 sections of 8 items", async function (assert) {
      this.set("sectionCount", 2);
      this.set("itemsPerSection", 8);

      await renderTemplate(this);
      assert.dom("[data-test-page='1'] [data-test-item-for-section='0']").exists({ count: 8 });
      assert.dom("[data-test-page='1'] [data-test-item-for-section='1']").exists({ count: 8 });
    });

    test("2 sections, 1 item overflows to second page", async function (assert) {
      this.set("sectionCount", 2);
      this.set("itemsPerSection", 9);

      await renderTemplate(this);
      assert.dom("[data-test-page='1'] [data-test-item-for-section='0']").exists({ count: 9 });
      assert.dom("[data-test-page='1'] [data-test-item-for-section='1']").exists({ count: 8 });

      assert.dom("[data-test-page='2'] [data-test-item-for-section='0']").doesNotExist();
      assert.dom("[data-test-page='2'] [data-test-item-for-section='1']").exists({ count: 1 });
    });

    test("3 sections, 1 item from secion 2 overflows to second page", async function (assert) {
      this.set("sectionCount", 3);
      this.set("itemsPerSection", 9);

      await renderTemplate(this);
      assert.dom("[data-test-page='1'] [data-test-item-for-section='0']").exists({ count: 9 });
      assert.dom("[data-test-page='1'] [data-test-item-for-section='1']").exists({ count: 8 });
      assert.dom("[data-test-page='1'] [data-test-item-for-section='2']").doesNotExist();

      assert.dom("[data-test-page='2'] [data-test-item-for-section='0']").doesNotExist();
      assert.dom("[data-test-page='2'] [data-test-item-for-section='1']").exists({ count: 1 });
      assert.dom("[data-test-page='2'] [data-test-item-for-section='2']").exists({ count: 9 });
    });
  });

  module("page sized section items (not using the iterator)", function () {
    let renderTemplate = function (context) {
      context.set("sectionCount", context.sectionCount);

      return render(hbs`
        {{#printable-pages as |document|}}
          {{#document.chapter as |chapter|}}
            {{! template-lint-disable no-inline-styles}}
            {{#chapter.page-header as |header|}}
              <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
              </div>
            {{/chapter.page-header}}

            {{#chapter.section}}
              <div style="height: 750px; background-color: rgba(0,0,0,0.12);">item 1</div>
            {{/chapter.section}}

            {{#if (gt this.sectionCount 1)}}
              {{#chapter.section}}
                <div style="height: 750px; background-color: rgba(0,0,0,0.12);">item 2</div>
              {{/chapter.section}}
            {{/if}}

            {{#if (gt this.sectionCount 2)}}
              {{#chapter.section}}
                <div style="height: 750px; background-color: rgba(0,0,0,0.12);">item 3</div>
              {{/chapter.section}}
            {{/if}}

            {{#if (gt this.sectionCount 3)}}
              {{#chapter.section}}
                <div style="height: 750px; background-color: rgba(0,0,0,0.12);">item 4</div>
              {{/chapter.section}}
            {{/if}}

            {{#if (gt this.sectionCount 4)}}
              {{#chapter.section}}
                <div style="height: 750px; background-color: rgba(0,0,0,0.12);">item 5</div>
              {{/chapter.section}}
            {{/if}}

            {{#chapter.page-footer as |footer|}}
              <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
              </div>
            {{/chapter.page-footer}}
            {{! template-lint-enable no-inline-styles}}
          {{/document.chapter}}
        {{/printable-pages}}
      `);
    };

    test("1 item", async function (assert) {
      this.set("sectionCount", 1);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 1 });
      assert.dom("[data-test-page='1'] [data-test-section]").exists({ count: this.sectionCount });
      assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
    });

    test("2 items", async function (assert) {
      this.set("sectionCount", 2);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 2 });
      assert.dom("[data-test-page='1'] [data-test-section]").exists({ count: 1 });
      assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();

      assert.dom("[data-test-page='2'] [data-test-section]").exists({ count: 1 });
      assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
    });

    test("3 items", async function (assert) {
      this.set("sectionCount", 3);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 3 });
      assert.dom("[data-test-page='1'] [data-test-section]").exists({ count: 1 });
      assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();

      assert.dom("[data-test-page='2'] [data-test-section]").exists({ count: 1 });
      assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();

      assert.dom("[data-test-page='3'] [data-test-section]").exists({ count: 1 });
      assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
    });

    test("5 items", async function (assert) {
      this.set("sectionCount", 5);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 5 });
      [...Array(Number(this.sectionCount))]
        .map((_, i) => i + 1)
        .forEach((i) => assert.dom(`[data-test-page='${i}'] [data-test-section]`).exists({ count: 1 }));
    });
  });

  module("page sized section items (using the iterator)", function () {
    let renderTemplate = function (context) {
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

            {{#chapter.section data=this.sectionData as |section|}}
              <div style="height: 750px; background-color: rgba(0,0,0,0.12);">item {{section}}</div>
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

    test("1 item", async function (assert) {
      this.set("sectionCount", 1);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 1 });
      assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: this.sectionCount });
      assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
    });

    test("2 items", async function (assert) {
      this.set("sectionCount", 2);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 2 });
      assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 1 });
      assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();

      assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 1 });
      assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
    });

    test("3 items", async function (assert) {
      this.set("sectionCount", 3);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 3 });
      assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 1 });
      assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();

      assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 1 });
      assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();

      assert.dom("[data-test-page='3'] [data-test-section-item]").exists({ count: 1 });
      assert.dom("[data-test-page='3'] [data-test-page-header]").exists();
      assert.dom("[data-test-page='3'] [data-test-page-footer]").exists();
    });

    test("8 items", async function (assert) {
      this.set("sectionCount", 8);

      await renderTemplate(this);

      assert.dom("[data-test-page]").exists({ count: 8 });
      [...Array(Number(this.sectionCount))]
        .map((_, i) => i + 1)
        .forEach((i) => assert.dom(`[data-test-page='${i}'] [data-test-section-item]`).exists({ count: 1 }));
    });
  });

  module("layout customization", function () {
    let renderTemplate = function (context) {
      context.set(
        "sectionData",
        [...Array(Number(context.sectionCount))].map((_, i) => i)
      );
      return render(hbs`
        {{#printable-pages
          dimensions=(hash
            width=this.width
            height=this.height
          )
          margins=(hash
            top=this.top
            right=this.right
            bottom=this.bottom
            left=this.left
          )
          orientation=this.orientation
          units=this.units
          as |document|
        }}
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

    module("with undefined values", function (hooks) {
      hooks.beforeEach(function () {
        this.set("columnCount", 1);
      });

      test("1 page, 15 items", async function (assert) {
        this.set("sectionCount", 15);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-section-item]").exists({ count: this.sectionCount });
        assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
        assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
      });
    });

    module("with large margins values", function (hooks) {
      hooks.beforeEach(function () {
        this.set("columnCount", 1);
        this.set("top", 2);
        this.set("right", 2);
        this.set("bottom", 2);
        this.set("left", 2);
      });

      test("15 items", async function (assert) {
        this.set("sectionCount", 15);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 2 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 10 });
        assert.dom("[data-test-page='2'] [data-test-section-item]").exists({ count: 5 });
      });
    });

    module("with a larger page", function (hooks) {
      hooks.beforeEach(function () {
        this.set("columnCount", 1);
        this.set("width", 12);
        this.set("height", 14);
      });

      test("15 items", async function (assert) {
        this.set("sectionCount", 15);

        await renderTemplate(this);

        assert.dom("[data-test-page]").exists({ count: 1 });
        assert.dom("[data-test-page='1'] [data-test-section-item]").exists({ count: 15 });
      });
    });
  });

  // TODO: This is an expected behavior of the addon which we may need to change as a
  // breaking change during the octane upgrade.
  module("changing arguments", function () {
    test("triggers a rerender", async function (assert) {
      let headerRenderCount = 0;
      this.headerDidRender = () => (headerRenderCount += 1);

      this.randomArg = new (class Randon {
        @tracked value = 1;
      })();

      await render(hbs`
        <PrintablePages @trackedForRefresh={{hash randomArg=this.randomArg.value}} as |document|>
          {{#document.chapter as |chapter|}}
            {{! template-lint-disable no-inline-styles}}

            {{#chapter.page-header as |header|}}
              <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);"
                {{did-insert this.headerDidRender}}
              >
                randomArg: {{this.randomArg.value}}
              </div>
            {{/chapter.page-header}}

            {{! template-lint-enable no-inline-styles}}
          {{/document.chapter}}
        </PrintablePages>
      `);

      assert.dom("[data-test-page]").exists({ count: 1 });
      assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
      assert.strictEqual(headerRenderCount, 1);

      this.randomArg.value = 2;
      await settled();

      assert.strictEqual(headerRenderCount, 2, "changing random argument of <PrintablePages> will trigger a re-render");
    });
  });
});
