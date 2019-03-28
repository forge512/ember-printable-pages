import Component from "@ember/component";
import layout from "../templates/components/printable-pages";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { next, scheduleOnce } from "@ember/runloop";
import { task } from "ember-concurrency";
import { Promise } from "rsvp";
import { get } from "@ember/object";

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
    this.renderTask.perform();
  },

  didUpdateAttrs() {
    this._super(...arguments);

    // Unregister, clear reportObject, clear the dom
    this.documentData.unregister(this.elementId);
    this.set("reportObject", null);
    this.set("rerendering", true);

    // Re-render after next render
    scheduleOnce("afterRender", this, () => this.renderTask.perform());
  },

  chapters: alias("reportObject.chapters"),

  // TASKS
  // eslint-disable-next-line require-yield
  renderTask: task(function*() {
    let reportObject = this.documentData.register(this.elementId);
    this.set("reportObject", reportObject);
    this.set("rerendering", false);
    this.reportStartTask.perform(this.reportObject.lastPage, null);
  }),

  reportStartTask: task(function*(currentPage) {
    if (this.onRenderStart) {
      yield new Promise(resolve => {
        next(() => {
          this.onRenderStart(currentPage);
          resolve();
        });
      });
    }
  }).keepLatest(),

  reportProgressTask: task(function*() {
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
    if (
      get(this, "reportObject.isFinishedRendering") &&
      this.onRenderComplete
    ) {
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
      this.reportProgressTask.perform();
    }
  }
});
