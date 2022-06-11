import Component from "@ember/component";
import layout from "../templates/components/printable-pages";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { next, scheduleOnce } from "@ember/runloop";
import { task } from "ember-concurrency";
import { Promise } from "rsvp";
import EmberObject, { computed, get } from "@ember/object";
import { registerWaiter } from "@ember/test";
import Ember from "ember";
import { isBlank } from "@ember/utils";

const DEFAULT_DIMENSIONS = {
  units: "in",
  dimensions: {
    width: 8.5,
    height: 11
  },
  margins: {
    top: 0.5,
    right: 0.5,
    bottom: 0.5,
    left: 0.5
  }
};

let getOrDefault = (context, namespace, key) => {
  let value = get(context, `${namespace}.${key}`);
  if (isBlank(value)) {
    return DEFAULT_DIMENSIONS[namespace][key];
  } else {
    return value;
  }
};

export default Component.extend({
  layout,
  documentData: service(),
  classNames: ["PrintablePages"],
  _isRendering: false,

  // LIFECYCLE HOOKS
  init() {
    this._super(...arguments);
    this.renderTask.perform();
  },

  didUpdateAttrs() {
    this._super(...arguments);
    this.rerenderTask.perform();
  },

  // COMPUTED PROPS
  chapters: alias("reportObject.chapters"),

  pageLayout: computed(
    "dimensions.{width,height}",
    "margins.{top,right,left,bottom}",
    "orientation",
    "units",
    function() {
      let units = isBlank(this.units) ? DEFAULT_DIMENSIONS.units : this.units;
      let width = getOrDefault(this, "dimensions", "width");
      let height = getOrDefault(this, "dimensions", "height");
      let top = getOrDefault(this, "margins", "top");
      let right = getOrDefault(this, "margins", "right");
      let bottom = getOrDefault(this, "margins", "bottom");
      let left = getOrDefault(this, "margins", "left");

      let innerWidth = width - right - left;
      let innerHeight = height - top - bottom;

      return EmberObject.create({
        innerWidth: `${innerWidth}${units}`,
        innerHeight: `${innerHeight}${units}`,
        top: `${top}${units}`,
        right: `${right}${units}`,
        bottom: `${bottom}${units}`,
        left: `${left}${units}`
      });
    }
  ),

  // TASKS
  // eslint-disable-next-line require-yield
  renderTask: task(function*() {
    let reportObject = this.documentData.register(this.elementId);
    this.set("reportObject", reportObject);
    this.set("rerendering", false);
    this.reportStartTask.perform(this.reportObject.lastPage, null);
  }),

  rerenderTask: task(function*() {
    yield new Promise(resolve => {
      next(() => {
        if (this.isDestroyed) return resolve();

        // Unregister, clear reportObject, clear the dom
        this.documentData.unregister(this.elementId);
        this.set("reportObject", null);
        this.set("rerendering", true);

        // Re-render after next render
        let rerender = () => {
          if (this.isDestroyed) return;

          this.renderTask.perform();
          resolve();
        };

        scheduleOnce("afterRender", this, rerender);
      });
    });
  }).drop(),

  reportStartTask: task(function*(currentPage) {
    if (Ember.testing && !this._isRendering) {
      this._isRendering = true;
      registerWaiter(() => !this._isRendering);
    }

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
          this.onRenderProgress(get(this, "reportObject.lastPage"));
          resolve();
        });
      });
    }
  }).keepLatest(),

  reportIfCompleteTask: task(function*() {
    if (get(this, "reportObject.isFinishedRendering")) {
      yield new Promise(resolve => {
        next(() => {
          if (this.isDestroyed) return resolve();

          this.set("_isRendering", false);

          if (this.onRenderComplete) {
            this.onRenderComplete(get(this, "reportObject.lastPage"));
          }

          resolve();
        });
      });
    }
  }).keepLatest(),

  // ACTIONS
  actions: {
    registerChapter(id, opts) {
      return this.documentData.registerChapter(this.elementId, id, opts);
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
