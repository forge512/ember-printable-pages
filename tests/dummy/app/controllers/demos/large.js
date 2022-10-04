import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class extends Controller {
  queryParams = ["sectionCount", "columnCount"];

  @tracked sectionCount = 1000;
  @tracked columnCount = 2;
  @tracked boxHeight = 50;

  @tracked startTimeStamp;
  @tracked isRunning;
  @tracked renderTime;
  @tracked currentPage;
  @tracked isComplete;

  get sectionData() {
    return [...Array(Number(this.sectionCount))].map((_, i) => i);
  }

  @action
  onStart(currentPage) {
    this.startTimeStamp = new Date();
    this.isRunning = true;
    this.currentPage = currentPage;
  }

  @action
  onUpdateProgress(currentPage) {
    this.currentPage = currentPage;
  }

  @action
  onComplete() {
    this.renderTime = (new Date() - this.startTimeStamp) / 1000;
    this.isRunning = false;
    this.isComplete = true;
  }
}
