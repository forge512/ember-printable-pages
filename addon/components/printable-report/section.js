import Component from "@ember/component";
import layout from "../../templates/components/printable-report/section";
import { raw, array, getBy } from "ember-awesome-macros";
import { alias } from "@ember/object/computed";
import { htmlSafe } from "@ember/template";

export default Component.extend({
  layout,
  classNames: ["PrintableReport-Section", "js-printable-report-section"],
  attributeBindings: ["style"],

  // LIFECYCLE HOOKS
  init() {
    this._super(...arguments);
    this.style = htmlSafe(`column-count: ${this.columnCount};`);
  },
  didInsertElement() {
    this._super(...arguments);
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
