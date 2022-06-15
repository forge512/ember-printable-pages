import Controller from "@ember/controller";
import { storageFor } from "ember-local-storage";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class extends Controller {
  @storageFor("print-settings") settings;

  queryParams = ["sectionCount", "columnCount"];

  // Content Settings
  @tracked sectionCount = 300;
  @tracked columnCount = 2;

  @tracked startTimeStamp;
  @tracked isRunning;
  @tracked currentPage;
  @tracked isCurrent;

  // Computed Props
  get sectionData() {
    return [...Array(Number(this.sectionCount))].map((_, i) => i);
  }

  // Actions
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
