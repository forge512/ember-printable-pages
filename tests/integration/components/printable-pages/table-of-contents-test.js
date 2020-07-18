import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

module("Integration | Component | printable-pages/table-of-contents", function(
  hooks
) {
  setupRenderingTest(hooks);

  let renderTemplate = function() {
    return render(hbs`
      <PrintablePages as |document|>
        <document.table-of-contents as |toc|>
          <toc.layout as |toc-layout|>
            <toc-layout.page-header>Table of Contents Header</toc-layout.page-header>

            {{#each toc.meta.chapters as |chapter i|}}
              <toc-layout.section>
                <div data-test-toc-item={{i}}>
                  {{chapter.name}}.... {{chapter.startPage}}-{{chapter.endPage}}
                </div>
              </toc-layout.section>
            {{/each}}

            <toc-layout.page-footer>Table of Contents Footer</toc-layout.page-footer>
          </toc.layout>
        </document.table-of-contents>

        <document.chapter @name="Chapter 1" as |chapter|>
          <chapter.section>Chapter 1: content here</chapter.section>
        </document.chapter>

        <document.chapter @name="Chapter 2" as |chapter|>
          <chapter.section>Chapter 2: content here</chapter.section>
        </document.chapter>

        <document.chapter @name="Chapter 3" as |chapter|>
          <chapter.section>Chapter 3: content here</chapter.section>
        </document.chapter>
      </PrintablePages>
    `);
  };

  test("basic table of contents", async function(assert) {
    await renderTemplate(this);

    assert.dom("[data-test-page]").exists({ count: 4 });

    assert.dom("[data-test-chapter='0'] [data-test-page]").exists({ count: 1 });
    assert.dom("[data-test-chapter='1'] [data-test-page]").exists({ count: 1 });
    assert.dom("[data-test-chapter='2'] [data-test-page]").exists({ count: 1 });

    // Verify that we have a TOC page
    assert.dom("[data-test-toc] [data-test-page]").exists({ count: 1 });

    assert
      .dom("[data-test-page='1'] [data-test-toc-item='0']")
      .hasText("Chapter 1.... 2-2");
    assert
      .dom("[data-test-page='1'] [data-test-toc-item='1']")
      .hasText("Chapter 2.... 3-3");
    assert
      .dom("[data-test-page='1'] [data-test-toc-item='2']")
      .hasText("Chapter 3.... 4-4");
  });
});
