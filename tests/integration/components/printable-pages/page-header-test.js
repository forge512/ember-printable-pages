import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

module("Integration | Component | printable-pages/page-header", function(
  hooks
) {
  setupRenderingTest(hooks);

  let renderSingleChapterTemplate = function(context) {
    context.set(
      "sectionData",
      [...Array(Number(context.sectionCount))].map((_, i) => i)
    );
    return render(hbs`
      {{#printable-pages as |document|}}
        {{#document.chapter as |chapter|}}

          {{! template-lint-disable no-inline-styles}}
          {{#chapter.page-header as |header|}}
            <div style="min-height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
              <span data-test-header-chapter-number>{{header.pageMeta.chapterNumber}}</span>
              <span data-test-header-page-number>{{header.pageMeta.pageNumber}}</span>
              <span data-test-header-is-first>{{header.pageMeta.isFirst}}</span>
              <span data-test-header-is-first-in-chapter>{{header.pageMeta.isFirstInChapter}}</span>
              <span data-test-header-is-last>{{header.pageMeta.isLast}}</span>
              <span data-test-header-is-last-in-chapter>{{header.pageMeta.isLastInChapter}}</span>
              <span data-test-header-total>{{header.pageMeta.total}}</span>
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

  let renderMultiChapterTemplate = function(context) {
    context.set(
      "sectionData",
      [...Array(Number(context.sectionCount))].map((_, i) => i)
    );
    return render(hbs`
      {{#printable-pages as |document|}}
        {{#document.chapter as |chapter|}}

          {{! template-lint-disable no-inline-styles}}
          {{#chapter.page-header as |header|}}
            <div style="min-height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
              <span data-test-header-chapter-number>{{header.pageMeta.chapterNumber}}</span>
              <span data-test-header-page-number>{{header.pageMeta.pageNumber}}</span>
              <span data-test-header-is-first>{{header.pageMeta.isFirst}}</span>
              <span data-test-header-is-first-in-chapter>{{header.pageMeta.isFirstInChapter}}</span>
              <span data-test-header-is-last>{{header.pageMeta.isLast}}</span>
              <span data-test-header-is-last-in-chapter>{{header.pageMeta.isLastInChapter}}</span>
              <span data-test-header-total>{{header.pageMeta.total}}</span>
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
            <div style="min-height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
              <span data-test-header-chapter-number>{{header.pageMeta.chapterNumber}}</span>
              <span data-test-header-page-number>{{header.pageMeta.pageNumber}}</span>
              <span data-test-header-is-first>{{header.pageMeta.isFirst}}</span>
              <span data-test-header-is-first-in-chapter>{{header.pageMeta.isFirstInChapter}}</span>
              <span data-test-header-is-last>{{header.pageMeta.isLast}}</span>
              <span data-test-header-is-last-in-chapter>{{header.pageMeta.isLastInChapter}}</span>
              <span data-test-header-total>{{header.pageMeta.total}}</span>
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

  test("single-page single-chapter document - has expected page meta info", async function(assert) {
    this.set("columnCount", 1);
    this.set("sectionCount", 1);

    await renderSingleChapterTemplate(this);

    assert
      .dom("[data-test-chapter] [data-test-page-header]")
      .exists({ count: 1 });

    assert.dom("[data-test-header-chapter-number]").hasText("1");
    assert.dom("[data-test-header-page-number]").hasText("1");
    assert.dom("[data-test-header-is-first]").hasText("true");
    assert.dom("[data-test-header-is-first-in-chapter]").hasText("true");
    assert.dom("[data-test-header-is-last]").hasText("true");
    assert.dom("[data-test-header-is-last-in-chapter]").hasText("true");
    assert.dom("[data-test-header-total]").hasText("1");
  });

  test("multi-page single-chapter document - has expected page meta info", async function(assert) {
    this.set("columnCount", 1);
    this.set("sectionCount", 17);

    await renderSingleChapterTemplate(this);

    assert
      .dom("[data-test-chapter] [data-test-page-header]")
      .exists({ count: 2 });

    // Chapter 1 Page 1
    assert
      .dom("[data-test-page='1'] [data-test-header-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-header-page-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-first]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-last-in-chapter]")
      .hasText("false");
    assert.dom("[data-test-page='1'] [data-test-header-total]").hasText("2");

    // Chapter 1 Page 2
    assert
      .dom("[data-test-page='2'] [data-test-header-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='2'] [data-test-header-page-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-first-in-chapter]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-last]")
      .hasText("true");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='2'] [data-test-header-total]").hasText("2");
  });

  test("single-page multi-chapter document - has expected page meta info", async function(assert) {
    this.set("columnCount", 1);
    this.set("sectionCount", 1);

    await renderMultiChapterTemplate(this);

    assert
      .dom("[data-test-chapter] [data-test-page-header]")
      .exists({ count: 2 });

    assert
      .dom("[data-test-page='1'] [data-test-header-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-header-page-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-first]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='1'] [data-test-header-total]").hasText("2");

    assert
      .dom("[data-test-page='2'] [data-test-header-chapter-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='2'] [data-test-header-page-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-last]")
      .hasText("true");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='2'] [data-test-header-total]").hasText("2");
  });

  test("multi-page multi-chapter document - has expected page meta info", async function(assert) {
    this.set("columnCount", 1);
    this.set("sectionCount", 17);

    await renderMultiChapterTemplate(this);

    assert
      .dom("[data-test-chapter] [data-test-page-header]")
      .exists({ count: 4 });

    // Chapter 1 Page 1
    assert
      .dom("[data-test-page='1'] [data-test-header-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-header-page-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-first]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='1'] [data-test-header-is-last-in-chapter]")
      .hasText("false");
    assert.dom("[data-test-page='1'] [data-test-header-total]").hasText("4");

    // Chapter 1 Page 2
    assert
      .dom("[data-test-page='2'] [data-test-header-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='2'] [data-test-header-page-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-first-in-chapter]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-header-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='2'] [data-test-header-total]").hasText("4");

    // Chapter 2 Page 1
    assert
      .dom("[data-test-page='3'] [data-test-header-chapter-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='3'] [data-test-header-page-number]")
      .hasText("3");
    assert
      .dom("[data-test-page='3'] [data-test-header-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='3'] [data-test-header-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='3'] [data-test-header-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='3'] [data-test-header-is-last-in-chapter]")
      .hasText("false");
    assert.dom("[data-test-page='3'] [data-test-header-total]").hasText("4");

    // Chapter 2 Page 2
    assert
      .dom("[data-test-page='4'] [data-test-header-chapter-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='4'] [data-test-header-page-number]")
      .hasText("4");
    assert
      .dom("[data-test-page='4'] [data-test-header-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='4'] [data-test-header-is-first-in-chapter]")
      .hasText("false");
    assert
      .dom("[data-test-page='4'] [data-test-header-is-last]")
      .hasText("true");
    assert
      .dom("[data-test-page='4'] [data-test-header-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='4'] [data-test-header-total]").hasText("4");
  });
});
