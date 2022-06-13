import Modifier from "ember-modifier";
import { task, timeout, waitForProperty } from "ember-concurrency";
import { tracked } from "@glimmer/tracking";
import { isBlank, isPresent } from "@ember/utils";
import { later, next, schedule } from "@ember/runloop";

export default class PageRenderer extends Modifier {
  get lastRenderedItemId() {
    return this.args.named?.lastRenderedItemId;
  }

  didReceiveArguments() {
    this.renderNext.perform();
  }

  didInstall() {
    this.setBodyHeight.perform();
  }

  @task
  *setBodyHeight() {
    // The first render is used to measure the header and footer height
    // and set the page body to fixed height (in this component's
    // onInsert hook). If the bodyElement hasn't been set
    // to a fixed height yet then wait before checking for overflow.

    let topOfBreakAfter = this.element
      .querySelector(".js-page-break-after")
      .getBoundingClientRect().top;
    let topOfElement = this.element.getBoundingClientRect().top;
    let wrapperHeight = topOfBreakAfter - topOfElement;
    // The ember test environment scales the page down by 50%
    let config = getOwner(this).resolveRegistration("config:environment");
    if (config.environment === "test") wrapperHeight = wrapperHeight * 2;

    wrapperHeight = Math.ceil(wrapperHeight);
    // Use height based on parent (100%) so that parent owns the overall page height

    // Set the body to a fixed height
    this.element.style.setProperty("height", `calc(100% - ${wrapperHeight}px)`);
  }

  @task
  *renderNext() {
    // This component determines whether it needs more items,
    // or fewer based upon where the `.js-visibility-tail` is
    // located in the dom relative to the `.js-page-body` element.

    yield waitForProperty(this.element.style, "height", (h) => !!h);

    let tailElement = this.element.querySelector(".js-visibility-tail");
    let tailBounding = tailElement.getBoundingClientRect();
    // Grab the bounding rect for the `.js-page-body` element
    let pageBounding = this.element
      .querySelector(".js-page-body")
      .getBoundingClientRect();

    let tailPosition =
      Math.floor(pageBounding.bottom) - Math.ceil(tailBounding.bottom);

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

  didUpdateArguments() {}
}
