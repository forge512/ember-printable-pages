import Component from "@ember/component";
import layout from "../templates/components/progress-display";

export default Component.extend({
  layout,
  actions: {
    start(currentPage, endPage) {
      this.set("startTimeStamp", new Date());
      this.set("isRunning", true);
      this.set("currentPage", currentPage);
      this.set("endPage", endPage);
    },
    updateProgress(currentPage, endPage) {
      this.set("currentPage", currentPage);
      this.set("endPage", endPage);
    },
    complete() {
      this.set("renderTime", (new Date() - this.startTimeStamp) / 1000);
      this.set("isRunning", false);
      this.set("isComplete", true);
    }
  }
});
