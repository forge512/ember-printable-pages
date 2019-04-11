import Controller from "@ember/controller";
import { computed } from "@ember/object";

export default Controller.extend({
  queryParams: ["dataLength", "columnCount", "chapterCount"],
  dataLength: 1000,
  columnCount: 2,
  chapterCount: 1,
  sectionData: computed("dataLength", function() {
    return [...Array(Number(this.dataLength))].map((_, i) => i);
  }),
  chapters: computed("chapterCount", function() {
    return [...Array(Number(this.chapterCount))].map((_, i) => i);
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
