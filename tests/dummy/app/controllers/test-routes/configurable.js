import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
export default class extends Controller {
  queryParams = ["sectionCount", "columnCount"];

  @tracked sectionCount = 200;
  @tracked columnCount = 2;

  @tracked startTimeStamp;
  @tracked isRunning;
  @tracked renderTime;
  @tracked currentPage;
  @tracked isCurrent;

  get sectionData() {
    return [...Array(Number(this.sectionCount))].map((_, i) => i);
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
