import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/section";
import { htmlSafe } from "@ember/template";
import { computed, get } from "@ember/object";
import { empty } from "@ember/object/computed";

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
    this.set("section", this.sectionMap[id]);
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
  hasOnlyBlock: empty("data"),
  page: computed("section.pages.[]", "pageIndexInChapter", function() {
    if (!this.section) return;
    return this.section.pages.objectAt(this.pageIndexInChapter);
  }),
  items: computed("section.data.[]", "page.{startIndex,endIndex}", function() {
    let { startIndex, endIndex } = this.page;
    return this.section.data.slice(startIndex, endIndex + 1);
  })
});
