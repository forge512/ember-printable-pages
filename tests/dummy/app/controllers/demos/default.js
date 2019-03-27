import Controller from "@ember/controller";
import { computed } from "@ember/object";

export default Controller.extend({
  sectionData: computed(function() {
    return [...Array(1000)].map((_, i) => i);
  }),

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
