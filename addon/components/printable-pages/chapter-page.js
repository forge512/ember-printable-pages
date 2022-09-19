import Component from "@glimmer/component";
import { next } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { isPresent } from "@ember/utils";
import { getOwner } from "@ember/application";
import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import { tracked } from "@glimmer/tracking";
import { task, timeout, waitForProperty } from "ember-concurrency";

export default class ChapterPage extends Component {
  elementId = "ember-" + guidFor(this);
  @tracked element = null;
  @tracked lastRenderedItemId = null;

  @service documentData;

  // INTERNAL STATE
  sectionRegistrationIndex = 0;

  // Register the section if this page is the first in the chapter.
  // Return the section index in the page as the section's id. This
  // is the unique id for the section across all pages.
  @action
  registerSection(data) {
    let id = this.sectionRegistrationIndex;
    if (this.args.pageIndexInChapter === 0) {
      this.args.registerSection(id, data);
    }

    this.sectionRegistrationIndex = this.sectionRegistrationIndex + 1;
    return id;
  }

  @action
  onInsert(element) {
    this.element = element;
    console.log(`<chapter-page:${this.elementId}> on-insert`, this.elementId);

    this.renderNext.perform();
  }

  @action
  onUpdate() {
    console.log(`<chapter-page:${this.elementId}> did-update`, this.elementId);
    this.renderNext.perform();
  }

  // @action

  @task({ keepLatest: true })
  *setLastRenderedItem(elementId) {
    console.log(
      `<chapter-page:${this.elementId}> setLastRenderedItem`,
      elementId
    );
    this.lastRenderedItemId = elementId;
    this.renderNext.perform();
  }

  @task
  *waitForFixedBody() {
    yield waitForProperty(this, "element");
    yield waitForProperty(this, "pageBodyElement", (b) => b?.style?.height);
  }

  get pageElement() {
    return this.element;
  }

  get pageBodyElement() {
    return this.element.querySelector(".js-page-body");
  }

  get visibilityTailElement() {
    return this.element.querySelector(".js-visibility-tail");
  }

  get pageBreakElement() {
    return this.element.querySelector(".js-page-break-after");
  }

  @task({ drop: true })
  *renderNext() {
    yield this.waitForFixedBody.perform();

    // This component determines whether it needs more items,
    // or fewer based upon where the `.js-visibility-tail` is
    // located in the dom relative to the `.js-page-body` element.

    let tailBounding = this.visibilityTailElement.getBoundingClientRect();
    // Grab the bounding rect for the `.js-page-body` element
    let pageBounding = this.pageBodyElement.getBoundingClientRect();

    let tailPosition =
      Math.floor(pageBounding.bottom) - Math.ceil(tailBounding.bottom);

    console.log(
      `<chapter-page:${this.elementId}> renderNext`,
      this.element,
      `${tailPosition}px`
    );

    // If the tail hasn't moved, then do nothing.
    // This can happen if the page count increments in a
    // separate render from adding/removing section items.
    //
    // Consider 'movement' to be more than 2px. This feels brittle
    // and may need to be revised.
    if (isPresent(this.previousTailPosition)) {
      let tailMovement = Math.abs(this.previousTailPosition - tailPosition);
      if (
        tailMovement <= 2 &&
        this.previousLastRenderedItemId === this.lastRenderedItemId
      ) {
        return;
      }
    }

    // Determine if the page has overflowed.
    let hasOverflow = tailPosition < 0;

    // NOTE One side effect of the conditionals below is that once
    // a page thinks it is full, it will never ask for another item.
    // This means if items change size (shrink) once rendered then
    // extra whitespace will be left at the bottom of hte page. If
    // items grow, and overflow the page, the page _will_ ask for
    // an item to be removed.
    if (hasOverflow) {
      // If the page overflowed...
      // call onPageOverflow so the parent context can remove an item
      this.overflowed = true;
      this.args.onPageOverflow();
    } else if (!this.overflowed) {
      // If the page did not overflow this time AND it has never overflowed...
      // tell the context this page can handle more item(s)
      next(() => {
        if (this.isDestroyed) return;
        this.args.renderNextItem(tailPosition);
      });
    } else if (!this.isSettled) {
      // did not overflow this time, but did in the past...
      // then the page is probably settled. let context know
      // it can render the next page if it wants

      this.isSettled = true;
      this.args.renderNextPage();
    }

    this.previousTailPosition = tailPosition;
    this.previousLastRenderedItemId = this.lastRenderedItemId;
  }
}
