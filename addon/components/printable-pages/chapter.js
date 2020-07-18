import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/chapter";
import { alias } from "@ember/object/computed";
import { computed } from "@ember/object";

export default Component.extend({
  layout,
  classNames: ["PrintablePages-chapter"],

  // LIFECYCLE HOOKS
  didInsertElement() {
    this._super(...arguments);
    let chapter = this.register(this.elementId, {
      name: this.name,
      isToc: !!this.isToc
    });
    this.set("chapter", chapter);
  },

  // COMPUTED PROPS
  pages: alias("chapter.pages"),
  startPage: alias("chapter.startPage"),
  endPage: alias("chapter.endPage"),
  pageCount: computed("endPage", "startPage", function() {
    return 1 + this.endPage - this.startPage;
  }),
  "data-test-chapter": alias("chapter.index"),

  actions: {
    onPageOverflow(pageIndex) {
      this.chapter.moveLastItemToNextPage(pageIndex, this.addPage);
    },

    renderNextItem(pageIndex, remainingHeight) {
      this.chapter.renderNextItem(pageIndex, remainingHeight);
      this.checkIfComplete();
    },

    renderNextPage(pageIndex) {
      this.chapter.renderNextPage(pageIndex, this.addPage);
    }
  }
});
