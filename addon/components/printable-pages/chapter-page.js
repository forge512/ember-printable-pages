import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/chapter-page";
import { htmlSafe } from "@ember/template";
import { next } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { isPresent } from "@ember/utils";

export default Component.extend({
  layout,
  documentData: service(),
  classNames: ["PrintablePages-chapterPage"],

  // LIFECYCLE HOOKS
  didInsertElement() {
    let topOfBreakAfter = this.element
      .querySelector(".js-page-break-after")
      .getBoundingClientRect().top;
    let topOfElement = this.element.getBoundingClientRect().top;
    let wrapperHeight = topOfBreakAfter - topOfElement;

    // set the page body height
    this._setPageBodyHeight(wrapperHeight);
  },

  didRender() {
    this._super(...arguments);

    // The first render is used to measure the header and footer height
    // and set the page body to fixed height (in this component's
    // didInsertElement hook). Don't ask to render more items
    if (this.firstRender) {
      this.set("firstRender", false);
      return;
    }

    // This component determines whether it needs more items,
    // or fewer based upon where the `.js-visibility-tail` is
    // located in the dom relative to the `.js-page-body` element.
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
    if (
      isPresent(this.previousTailPosition) &&
      this.previousTailPosition === tailPosition &&
      this.previousLastRenderedItemId === this.lastRenderedItemId
    ) {
      return;
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
      this.set("overflowed", true);
      this.onPageOverflow();
    } else if (!this.overflowed) {
      // If the page did not overflow this time AND it has never overflowed...
      // tell the context this page can handle more item(s)
      next(() => {
        if (this.isDestroyed) return;
        this.renderNextItem(tailPosition);
      });
    } else {
      // did not overflow this time, but did in the past...
      // then the page is probably settled. let context know
      // it can render the next page if it wants
      this.renderNextPage();
    }

    this.set("previousTailPosition", tailPosition);
    this.set("previousLastRenderedItemId", this.lastRenderedItemId);
  },

  // INTERNAL STATE
  sectionRegistrationIndex: 0,
  firstRender: true,

  // HELPER FUNCTIONS
  _setPageBodyHeight(wrapperHeight) {
    wrapperHeight = Math.ceil(wrapperHeight);
    // Use height based on parent (100%) so that parent owns the overall page
    // height. This allows adding an extra 0.25in of height in print css to
    // ensure column wrapping doesn't hide data
    this.set(
      "bodyStyles",
      htmlSafe(`height: calc(100% - ${wrapperHeight}px);`)
    );
  },

  actions: {
    // Register the section if this page is the first in the chapter.
    // Return the section index in the page as the section's id. This
    // is the unique id for the section across all pages.
    registerSection(data) {
      let id = this.sectionRegistrationIndex;

      if (this.pageIndexInChapter === 0) {
        this.registerSection(id, data);
      }

      this.incrementProperty("sectionRegistrationIndex");
      return id;
    },
    renderedItem(elementId) {
      this.lastRenderedItemId = elementId;
    }
  }
});
