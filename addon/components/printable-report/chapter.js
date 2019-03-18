import Component from "@ember/component";
import layout from "../../templates/components/printable-report/chapter";
import {
  raw,
  getBy,
  array,
  equal,
  add,
  difference
} from "ember-awesome-macros";
import { alias } from "@ember/object/computed";
import EmberObject, { computed } from "@ember/object";
import { A } from "@ember/array";
import { isBlank } from "@ember/utils";
import { next, run } from "@ember/runloop";
import { inject as service } from "@ember/service";

export default Component.extend({
  layout,
  classNames: ["PrintableReport-Chapter"],

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
      console.log(this.toString(), "onPageOverflow", pageIndex);
      this.chapter.moveLastItemToNextPage(pageIndex);
      this.addPage(this.elementId);
    },

    renderNextItem(pageIndex) {
      console.log(this.toString(), "renderNextItem", pageIndex);
      this.chapter.renderNextItem(pageIndex);
    }
  }
});
