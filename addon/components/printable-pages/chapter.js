import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/chapter";
import { add, difference } from "ember-awesome-macros";
import { alias } from "@ember/object/computed";

export default Component.extend({
  layout,
  classNames: ["PrintablePages-chapter"],

  // LIFECYCLE HOOKS
  didInsertElement() {
    this._super(...arguments);
    let chapter = this.register(this.elementId);
    this.set("chapter", chapter);
  },

  // COMPUTED PROPS
  pages: alias("chapter.pages"),
  startPage: alias("chapter.startPage"),
  endPage: alias("chapter.endPage"),
  pageCount: add(1, difference("endPage", "startPage")),

  actions: {
    onPageOverflow(pageIndex) {
      this.chapter.moveLastItemToNextPage(pageIndex);
      // If the last page overflows then add a new page
      if (pageIndex + 1 === this.pageCount) {
        this.addPage(this.elementId);
      }
    },

    renderNextItem(pageIndex, remainingHeight) {
      this.chapter.renderNextItem(pageIndex, remainingHeight);
      this.checkIfComplete();
    },

    renderNextPage(pageIndex) {
      this.chapter.renderNextPage(pageIndex);
    },
  }
});
