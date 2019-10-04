import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

module("Integration | Component | printable-pages/page-footer", function(
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
          {{#chapter.page-header}}
            <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-header}}

          {{#chapter.section columnCount=this.columnCount data=this.sectionData}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);"></div>
          {{/chapter.section}}

          {{#chapter.page-footer as |footer|}}
            <div style="min-height: 50px; background-color: rgba(0,0,0,0.08);">
              <span data-test-footer-chapter-number>{{footer.pageMeta.chapterNumber}}</span>
              <span data-test-footer-page-number>{{footer.pageMeta.pageNumber}}</span>
              <span data-test-footer-is-first>{{footer.pageMeta.isFirst}}</span>
              <span data-test-footer-is-first-in-chapter>{{footer.pageMeta.isFirstInChapter}}</span>
              <span data-test-footer-is-last>{{footer.pageMeta.isLast}}</span>
              <span data-test-footer-is-last-in-chapter>{{footer.pageMeta.isLastInChapter}}</span>
              <span data-test-footer-total>{{footer.pageMeta.total}}</span>
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
            <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-header}}

          {{#chapter.section columnCount=this.columnCount data=this.sectionData}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);"></div>
          {{/chapter.section}}

          {{#chapter.page-footer as |footer|}}
            <div style="min-height: 50px; background-color: rgba(0,0,0,0.08);">
              <span data-test-footer-chapter-number>{{footer.pageMeta.chapterNumber}}</span>
              <span data-test-footer-page-number>{{footer.pageMeta.pageNumber}}</span>
              <span data-test-footer-is-first>{{footer.pageMeta.isFirst}}</span>
              <span data-test-footer-is-first-in-chapter>{{footer.pageMeta.isFirstInChapter}}</span>
              <span data-test-footer-is-last>{{footer.pageMeta.isLast}}</span>
              <span data-test-footer-is-last-in-chapter>{{footer.pageMeta.isLastInChapter}}</span>
              <span data-test-footer-total>{{footer.pageMeta.total}}</span>
            </div>
          {{/chapter.page-footer}}
          {{! template-lint-enable no-inline-styles}}
        {{/document.chapter}}

        {{#document.chapter as |chapter|}}

          {{! template-lint-disable no-inline-styles}}
          {{#chapter.page-header as |header|}}
            <div style="height: 50px; background-color: rgba(0,0,0,0.08);">
            </div>
          {{/chapter.page-header}}

          {{#chapter.section columnCount=this.columnCount data=this.sectionData}}
            <div style="height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.12);"></div>
          {{/chapter.section}}

          {{#chapter.page-footer as |footer|}}
            <div style="min-height: 50px; margin-bottom: 5px; background-color: rgba(0,0,0,0.08);">
              <span data-test-footer-chapter-number>{{footer.pageMeta.chapterNumber}}</span>
              <span data-test-footer-page-number>{{footer.pageMeta.pageNumber}}</span>
              <span data-test-footer-is-first>{{footer.pageMeta.isFirst}}</span>
              <span data-test-footer-is-first-in-chapter>{{footer.pageMeta.isFirstInChapter}}</span>
              <span data-test-footer-is-last>{{footer.pageMeta.isLast}}</span>
              <span data-test-footer-is-last-in-chapter>{{footer.pageMeta.isLastInChapter}}</span>
              <span data-test-footer-total>{{footer.pageMeta.total}}</span>
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
      .dom("[data-test-chapter] [data-test-page-footer]")
      .exists({ count: 1 });

    assert.dom("[data-test-footer-chapter-number]").hasText("1");
    assert.dom("[data-test-footer-page-number]").hasText("1");
    assert.dom("[data-test-footer-is-first]").hasText("true");
    assert.dom("[data-test-footer-is-first-in-chapter]").hasText("true");
    assert.dom("[data-test-footer-is-last]").hasText("true");
    assert.dom("[data-test-footer-is-last-in-chapter]").hasText("true");
    assert.dom("[data-test-footer-total]").hasText("1");
  });

  test("multi-page single-chapter document - has expected page meta info", async function(assert) {
    this.set("columnCount", 1);
    this.set("sectionCount", 17);

    await renderSingleChapterTemplate(this);

    assert
      .dom("[data-test-chapter] [data-test-page-footer]")
      .exists({ count: 2 });

    // Chapter 1 Page 1
    assert
      .dom("[data-test-page='1'] [data-test-footer-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-footer-page-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-first]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-last-in-chapter]")
      .hasText("false");
    assert.dom("[data-test-page='1'] [data-test-footer-total]").hasText("2");

    // Chapter 1 Page 2
    assert
      .dom("[data-test-page='2'] [data-test-footer-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='2'] [data-test-footer-page-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-first-in-chapter]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-last]")
      .hasText("true");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='2'] [data-test-footer-total]").hasText("2");
  });

  test("single-page multi-chapter document - has expected page meta info", async function(assert) {
    this.set("columnCount", 1);
    this.set("sectionCount", 1);

    await renderMultiChapterTemplate(this);

    assert
      .dom("[data-test-chapter] [data-test-page-footer]")
      .exists({ count: 2 });

    assert
      .dom("[data-test-page='1'] [data-test-footer-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-footer-page-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-first]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='1'] [data-test-footer-total]").hasText("2");

    assert
      .dom("[data-test-page='2'] [data-test-footer-chapter-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='2'] [data-test-footer-page-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-last]")
      .hasText("true");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='2'] [data-test-footer-total]").hasText("2");
  });

  test("multi-page multi-chapter document - has expected page meta info", async function(assert) {
    this.set("columnCount", 1);
    this.set("sectionCount", 17);

    await renderMultiChapterTemplate(this);

    assert
      .dom("[data-test-chapter] [data-test-page-footer]")
      .exists({ count: 4 });

    // Chapter 1 Page 1
    assert
      .dom("[data-test-page='1'] [data-test-footer-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-footer-page-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-first]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='1'] [data-test-footer-is-last-in-chapter]")
      .hasText("false");
    assert.dom("[data-test-page='1'] [data-test-footer-total]").hasText("4");

    // Chapter 1 Page 2
    assert
      .dom("[data-test-page='2'] [data-test-footer-chapter-number]")
      .hasText("1");
    assert
      .dom("[data-test-page='2'] [data-test-footer-page-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-first-in-chapter]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='2'] [data-test-footer-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='2'] [data-test-footer-total]").hasText("4");

    // Chapter 2 Page 1
    assert
      .dom("[data-test-page='3'] [data-test-footer-chapter-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='3'] [data-test-footer-page-number]")
      .hasText("3");
    assert
      .dom("[data-test-page='3'] [data-test-footer-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='3'] [data-test-footer-is-first-in-chapter]")
      .hasText("true");
    assert
      .dom("[data-test-page='3'] [data-test-footer-is-last]")
      .hasText("false");
    assert
      .dom("[data-test-page='3'] [data-test-footer-is-last-in-chapter]")
      .hasText("false");
    assert.dom("[data-test-page='3'] [data-test-footer-total]").hasText("4");

    // Chapter 2 Page 2
    assert
      .dom("[data-test-page='4'] [data-test-footer-chapter-number]")
      .hasText("2");
    assert
      .dom("[data-test-page='4'] [data-test-footer-page-number]")
      .hasText("4");
    assert
      .dom("[data-test-page='4'] [data-test-footer-is-first]")
      .hasText("false");
    assert
      .dom("[data-test-page='4'] [data-test-footer-is-first-in-chapter]")
      .hasText("false");
    assert
      .dom("[data-test-page='4'] [data-test-footer-is-last]")
      .hasText("true");
    assert
      .dom("[data-test-page='4'] [data-test-footer-is-last-in-chapter]")
      .hasText("true");
    assert.dom("[data-test-page='4'] [data-test-footer-total]").hasText("4");
  });
});
