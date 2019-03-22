import Component from "@ember/component";
import layout from "../../templates/components/printable-report/section";
import { getBy, array, sum, raw } from "ember-awesome-macros";
import { alias } from "@ember/object/computed";
import { htmlSafe } from "@ember/template";

export default Component.extend({
  layout,
  tagName: "",
  shouldRender: true,

  // LIFECYCLE HOOKS
  init() {
    this._super(...arguments);
    this.style = htmlSafe(`column-count: ${this.columnCount};`);
  },
  didInsertElement() {
    this._super(...arguments);
    if (!this.shouldRender) return;

    let id = this.register({data: this.data || [], columnCount: this.columnCount});
    this.set("id", id);
  },

  // INPUT PROPS
  columnCount: 1,

  // COMPUTED PROPS
  section: getBy("sectionMap", "id"),
  page: getBy("section.pages", "pageIndexInChapter"),
  items: array.slice(
    "section.data",
    "page.startIndex",
    sum("page.endIndex", raw(1))
  )
});
