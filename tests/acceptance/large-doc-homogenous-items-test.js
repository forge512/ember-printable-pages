import { module, test } from "qunit";
import { fillIn, find, visit } from "@ember/test-helpers";
import { setupApplicationTest } from "ember-qunit";

module("Acceptance | large doc homogenous items", function(hooks) {
  setupApplicationTest(hooks);

  test("3-column mode, single page, with header and footer", async function(assert) {
    await visit("/test-routes/configurable?columnCount=3&sectionCount=48");
    assert.dom("[data-test-page]").exists({ count: 1 });
    assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
    assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
  });

  test("3-column mode, 2 pages, with header and footer", async function(assert) {
    await visit("/test-routes/configurable?columnCount=3&sectionCount=49");
    assert.dom("[data-test-page]").exists({ count: 2 });
    assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
    assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
    assert.dom("[data-test-page='2'] [data-test-page-header]").exists();
    assert.dom("[data-test-page='2'] [data-test-page-footer]").exists();
  });

  test("re-rendering", async function(assert) {
    await visit("/demos/large?columnCount=3&sectionCount=10");
    assert.dom("[data-test-page]").exists({ count: 1 });
    assert.dom("[data-test-page='1'] [data-test-page-header]").exists();
    assert.dom("[data-test-page='1'] [data-test-page-footer]").exists();
    assert.dom("[data-test-page='1'] [data-test-section]").exists({ count: 1 });
    assert
      .dom("[data-test-page='1'] [data-test-section-item]")
      .exists({ count: 10 });
    await fillIn("[data-test-input-section-count]", 12);
    assert
      .dom("[data-test-page='1'] [data-test-section-item]")
      .exists({ count: 12 });
  });

  test("column count", async function(assert) {
    await visit("/demos/large?columnCount=1&sectionCount=10");

    let item = find("[data-test-section-item]");
    assert.ok(
      item.offsetWidth > 700,
      "sections are > 700px when in single column mode"
    );

    await fillIn("[data-test-column-count]", 2);
    item = find("[data-test-section-item]");
    assert.ok(
      item.offsetWidth > 330 && item.offsetWidth < 350,
      "sections are about 340px when in dual column mode"
    );

    await fillIn("[data-test-column-count]", 3);
    item = find("[data-test-section-item]");
    assert.ok(
      item.offsetWidth < 250,
      "sections are less than 250px when in 3 column mode"
    );
  });

  test("performance", async function(assert) {
    await visit("/demos/large?columnCount=2&sectionCount=500");
    let renderTime = Number(find("[data-test-render-time]").textContent);
    // On a MacBookPro under normal load this is less than 2 seconds
    assert.ok(renderTime < 6, "render time is less than 6s (sanity check)");
  });
});
