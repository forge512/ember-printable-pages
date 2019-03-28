import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/section";
import { getBy, array, sum, raw, isEmpty } from "ember-awesome-macros";
import { htmlSafe } from "@ember/template";
import { get } from "@ember/object";

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

    let id = this.register({
      data: this.data || [],
      columnCount: this.columnCount
    });
    this.set("id", id);
  },
  didUpdateAttrs() {
    let columnCountChanged =
      get(this, "section.columnCount") != this.sectionCount;
    let dataLengthChanged =
      get(this, "section.data.length") != get(this, "data.length");
    if (this.shouldRender && (columnCountChanged || dataLengthChanged)) {
      this.triggerRerender();
    }
  },

  // INPUT PROPS
  columnCount: 1,

  // COMPUTED PROPS
  hasOnlyBlock: isEmpty("data"),
  section: getBy("sectionMap", "id"),
  page: getBy("section.pages", "pageIndexInChapter"),
  items: array.slice(
    "section.data",
    "page.startIndex",
    sum("page.endIndex", raw(1))
  )
});
