import Component from "@ember/component";
import layout from "../templates/components/printable-report";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { next } from "@ember/runloop";
import { task } from "ember-concurrency";

export default Component.extend({
  layout,
  report: service(),
  classNames: ["PrintablePages"],

  // LIFECYCLE HOOKS
  init() {
    this._super(...arguments);
    let reportObject = this.report.register(this.elementId);
    this.set("reportObject", reportObject);
    this.renderStartTask.perform(this.reportObject.lastPage, null);
  },

  chapters: alias("reportObject.chapters"),

  // TASKS
  renderStartTask: task(function*(currentPage, endPage) {
    if (this.onRenderStart) {
      next(() => this.onRenderStart(currentPage));
    }
  }),

  renderProgressTask: task(function*() {
    if (this.onRenderProgress) {
      next(() => this.onRenderProgress(this.reportObject.lastPage));
    }
  }),

  reportIfCompleteTask: task(function*() {
    if (this.reportObject.isFinishedRendering && this.onRenderComplete) {
      next(() => this.onRenderComplete(this.reportObject.lastPage));
    }
  }),

  // ACTIONS
  actions: {
    registerChapter(id) {
      return this.report.registerChapter(this.elementId, id);
    },

    registerSection() {
      this.report.registerSection(...arguments);
    },

    addPage(chapterId) {
      this.report.addPage(this.elementId, chapterId);
      this.renderProgressTask.perform();
    }
  }
});
