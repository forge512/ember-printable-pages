import Component from "@ember/component";
import layout from "../templates/components/printable-pages";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { next } from "@ember/runloop";
import { task } from "ember-concurrency";

export default Component.extend({
  layout,
  documentData: service(),
  classNames: ["PrintablePages"],
  pageLayout: Object.freeze({
    height: "11in",
    width: "8.5in",
    margins: "0.5in"
  }),

  // LIFECYCLE HOOKS
  init() {
    this._super(...arguments);
    let reportObject = this.documentData.register(this.elementId);
    this.set("reportObject", reportObject);
    this.renderStartTask.perform(this.reportObject.lastPage, null);
  },

  chapters: alias("reportObject.chapters"),

  // TASKS
  renderStartTask: task(function*(currentPage) {
    if (this.onRenderStart) {
      next(() => this.onRenderStart(currentPage));
    }
  }).keepLatest(),

  renderProgressTask: task(function*() {
    if (this.onRenderProgress) {
      next(() => this.onRenderProgress(this.reportObject.lastPage));
    }
  }).keepLatest(),

  reportIfCompleteTask: task(function*() {
    if (this.reportObject.isFinishedRendering && this.onRenderComplete) {
      next(() => this.onRenderComplete(this.reportObject.lastPage));
    }
  }).keepLatest(),

  // ACTIONS
  actions: {
    registerChapter(id) {
      return this.documentData.registerChapter(this.elementId, id);
    },

    registerSection() {
      this.documentData.registerSection(...arguments);
    },

    addPage(chapterId) {
      this.documentData.addPage(this.elementId, chapterId);
      this.renderProgressTask.perform();
    }
  }
});
