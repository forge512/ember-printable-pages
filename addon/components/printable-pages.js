import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { next, scheduleOnce } from "@ember/runloop";
import { task } from "ember-concurrency";
import { Promise } from "rsvp";
import { get } from "@ember/object";
import { registerWaiter } from "@ember/test";
import Ember from "ember";
import { isBlank } from "@ember/utils";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";

const DEFAULT_DIMENSIONS = {
  units: "in",
  dimensions: {
    width: 8.5,
    height: 11,
  },
  margins: {
    top: 0.5,
    right: 0.5,
    bottom: 0.5,
    left: 0.5,
  },
};

let getOrDefault = (context, namespace, key) => {
  let value = get(context, `${namespace}.${key}`);
  if (isBlank(value)) {
    return DEFAULT_DIMENSIONS[namespace][key];
  } else {
    return value;
  }
};

export default class PrintablePagesComponent extends Component {
  elementId = "ember-" + guidFor(this);

  @service documentData;

  @tracked isRendering = false;
  @tracked reportObject;
  @tracked rerendering;
  @tracked element;

  constructor() {
    super(...arguments);
    this.renderTask.perform();
  }

  @action
  onInsert(element) {
    this.element = element;
  }

  get chapters() {
    return this.reportObject.chapters;
  }

  get pageLayout() {
    let units = isBlank(this.units) ? DEFAULT_DIMENSIONS.units : this.units;
    let width = getOrDefault(this.args, "dimensions", "width");
    let height = getOrDefault(this.args, "dimensions", "height");
    let top = getOrDefault(this.args, "margins", "top");
    let right = getOrDefault(this.args, "margins", "right");
    let bottom = getOrDefault(this.args, "margins", "bottom");
    let left = getOrDefault(this.args, "margins", "left");

    let innerWidth = width - right - left;
    let innerHeight = height - top - bottom;

    return {
      innerWidth: `${innerWidth}${units}`,
      innerHeight: `${innerHeight}${units}`,
      top: `${top}${units}`,
      right: `${right}${units}`,
      bottom: `${bottom}${units}`,
      left: `${left}${units}`,
    };
  }

  // TASKS
  // eslint-disable-next-line require-yield
  @task
  *renderTask() {
    this.reportObject = this.documentData.register(this.elementId);
    this.rerendering = false;
    this.reportStartTask.perform(this.reportObject.lastPage, null);
  }

  @task({ drop: true })
  *rerenderTask() {
    yield new Promise((resolve) => {
      next(() => {
        if (this.isDestroyed) return resolve();

        // Unregister, clear reportObject, clear the dom
        this.documentData.unregister(this.elementId);
        this.reportObject = null;
        this.rerendering = true;

        // Re-render after next render
        let rerender = () => {
          if (this.isDestroyed) return;

          this.renderTask.perform();
          resolve();
        };

        scheduleOnce("afterRender", this, rerender);
      });
    });
  }

  @task({ keepLatest: true })
  *reportStartTask(currentPage) {
    if (Ember.testing && !this._isRendering) {
      this._isRendering = true;
      registerWaiter(() => !this._isRendering);
    }

    if (this.args.onRenderStart) {
      yield new Promise((resolve) => {
        next(() => {
          this.args.onRenderStart(currentPage);
          resolve();
        });
      });
    }
  }

  @task({ keepLatest: true })
  *reportProgressTask() {
    if (this.onRenderProgress) {
      yield new Promise((resolve) => {
        next(() => {
          this.args.onRenderProgress(this.reportObject?.lastPage);
          resolve();
        });
      });
    }
  }

  @task({ keepLatest: true })
  *reportIfCompleteTask() {
    if (this.reportObject?.isFinishedRendering) {
      yield new Promise((resolve) => {
        next(() => {
          if (this.isDestroyed) return resolve();

          this._isRendering = false;

          if (this.onRenderComplete) {
            this.args.onRenderComplete(this.reportObject?.lastPage);
          }

          resolve();
        });
      });
    }
  }

  // ACTIONS
  @action
  registerChapter(id, opts) {
    // console.log(`register chapter ${id}, ${opts}`);
    return this.documentData.registerChapter(this.elementId, id, opts);
  }

  @action
  registerSection() {
    // console.log(`register section ${arguments}`);
    this.documentData.registerSection(...arguments);
  }

  @action
  addPage(chapterId) {
    // console.log(`add page ${chapterId}`);
    this.documentData.addPage(this.elementId, chapterId);
    this.reportProgressTask.perform();
  }
}
