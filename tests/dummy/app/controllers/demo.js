import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { storageFor } from "ember-local-storage";

export default Controller.extend({
  settings: storageFor("print-settings"),

  queryParams: ["sectionCount", "columnCount"],

  // Content Settings
  sectionCount: 300,
  columnCount: 2,

  // Computed Props
  sectionData: computed("sectionCount", function() {
    return [...Array(Number(this.sectionCount))].map((_, i) => i);
  }),

  // Actions
  actions: {
    start(currentPage) {
      this.set("startTimeStamp", new Date());
      this.set("isRunning", true);
      this.set("currentPage", currentPage);
    },
    updateProgress(currentPage) {
      this.set("currentPage", currentPage);
    },
    complete() {
      this.set("renderTime", (new Date() - this.startTimeStamp) / 1000);
      this.set("isRunning", false);
      this.set("isComplete", true);
    }
  }
});
