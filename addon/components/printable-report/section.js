import Component from "@ember/component";
import layout from "../../templates/components/printable-report/section";
import { getBy } from "ember-awesome-macros";
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

    console.log(this.toString(), "register");
    let id = this.register(this.data || []);
    this.set("id", id);
  },

  // INPUT PROPS
  columnCount: 1,

  // COMPUTED PROPS
  section: getBy("sectionMap", "id"),
  page: getBy("section.pages", "pageIndexInChapter"),
  items: alias("page.data")
});
