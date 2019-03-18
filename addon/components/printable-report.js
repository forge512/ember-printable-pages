import Component from "@ember/component";
import layout from "../templates/components/printable-report";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";

export default Component.extend({
  layout,
  report: service(),
  classNames: ["PrintableReport"],

  // LIFECYCLE HOOKS
  init() {
    this._super(...arguments);
    let reportObject = this.report.register(this.elementId);
    this.set("reportObject");
  },

  chapters: alias("reportObject.chapters"),

  // ACTIONS
  actions: {
    registerChapter(id) {
      return this.report.registerChapter(this.elementId, id);
    },

    registerSection() {
      this.report.registerSection(...arguments);
    },

    addPage(chapterId) {
      this.report.addPage(this.elementId, chapterId);
    }
  }
});
