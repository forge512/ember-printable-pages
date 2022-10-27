import Controller from "@ember/controller";
import { htmlSafe } from "@ember/template";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
export default class extends Controller {
  queryParams = ["dataLength", "columnCount", "chapterCount", "sectionOneHeight"];

  @tracked dataLength = 1000;
  @tracked columnCount = 2;
  @tracked chapterCount = 1;
  @tracked sectionOneHeight = 300;

  @tracked startTimeStamp;
  @tracked isRunning;
  @tracked renderTime;
  @tracked currentPage;
  @tracked isCurrent;

  get sectionData() {
    return [...Array(Number(this.dataLength))].map((_, i) => i);
  }
  get chapters() {
    return [...Array(Number(this.chapterCount))].map((_, i) => i);
  }
  get sectionOneHeightSanitized() {
    return htmlSafe(Number(this.sectionOneHeight));
  }

  @action
  start(currentPage) {
    this.startTimeStamp = new Date();
    this.isRunning = true;
    this.currentPage = currentPage;
  }

  @action
  updateProgress(currentPage) {
    this.currentPage = currentPage;
  }

  @action
  complete() {
    this.renderTime = (new Date() - this.startTimeStamp) / 1000;
    this.isRunning = false;
    this.isComplete = true;
  }
}
