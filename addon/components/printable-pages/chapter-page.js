import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/chapter-page";
import { htmlSafe } from "@ember/template";
import { next } from "@ember/runloop";
import { inject as service } from "@ember/service";

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
    if (this.overflowedElement) return;

    // TODO tweak on this after adding support for page header/footer
    if (this.firstRender) {
      this.set("firstRender", false);
      return;
    }

    let pageBounding = this.element
      .querySelector(".js-page-body")
      .getBoundingClientRect();
    let tailBounding = this.element
      .querySelector(".js-visibility-tail")
      .getBoundingClientRect();
    // Add 1 to pageBounding to avoid rounding errors
    let hasOverflow =
      tailBounding.bottom > pageBounding.bottom + 1 ||
      tailBounding.right > pageBounding.right + 1;

    //// If the first item overflowed then...
    //// - Release the page height so the user can see all the content (page breaks won't work quite right)
    //// - Tell 'afterRender' we are full so the second item is given to the next page
    //if (this.singleItemOverflowedPage && hasOverflow) {
    //  // Setting bodyStyle will cause a re-render. Tell this function to ignore the next render.
    //  this.set("firstRender", true);
    //  this.set("bodyStyle", htmlSafe(`column-count: ${this.columnCount};`));
    //  return this.afterRender({
    //    pageNumber: this.pageNumber,
    //    hasOverflow: true
    //  });
    //}

    // if the previously overflowed element is still in the dom then return...
    // we are waiting for the chapter to move the item to the next page
    if (this.overflowedElement && hasOverflow) {
      if (this.element.querySelector(`#${this.overflowedElement}`)) return;

      this.set("overflowedElement", null);
    }

    if (hasOverflow) {
      // eslint-disable-next-line
      // console.log(this.toString(), "didRender --- overflowed");
      this.set(
        "overflowedElement",
        this.element.querySelector(".js-visibility-tail").previousElementSibling
      );
      this.onPageOverflow();
    } else {
      let extraSpace = pageBounding.bottom - tailBounding.bottom;
      next(() => {
        this.renderNextItem(extraSpace);
        this.set("alreadyNotified", true);
      });
    }
  },

  // INTERNAL STATE
  sectionRegistrationIndex: 0,
  firstRender: true,

  // HELPER FUNCTIONS
  _setPageBodyHeight(wrapperHeight) {
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

    onReadyForNextItem() {
      this.set("readyForNextItem", true);
    }
  }
});
