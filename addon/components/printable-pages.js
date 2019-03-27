import Component from "@ember/component";
import layout from "../templates/components/printable-pages";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { next } from "@ember/runloop";
import { task } from "ember-concurrency";
import { Promise } from "rsvp";

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
      yield new Promise(resolve => {
        next(() => {
          this.onRenderStart(currentPage);
          resolve();
        });
      });
    }
  }).keepLatest(),

  renderProgressTask: task(function*() {
    if (this.onRenderProgress) {
      yield new Promise(resolve => {
        next(() => {
          this.onRenderProgress(this.reportObject.lastPage);
          resolve();
        });
      });
    }
  }).keepLatest(),

  reportIfCompleteTask: task(function*() {
    if (this.reportObject.isFinishedRendering && this.onRenderComplete) {
      yield new Promise(resolve => {
        next(() => {
          this.onRenderComplete(this.reportObject.lastPage);
          resolve();
        });
      });
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
