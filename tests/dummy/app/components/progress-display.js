import Component from "@ember/component";
import layout from "../templates/components/progress-display";

export default Component.extend({
  layout,
  actions: {
    start(currentPage, endPage) {
      this.set("isRunning", true);
      this.set("currentPage", currentPage);
      this.set("endPage", endPage);
    },
    updateProgress(currentPage, endPage) {
      this.set("currentPage", currentPage);
      this.set("endPage", endPage);
    },
    complete() {
      this.set("isRunning", false);
    }
  }
});
