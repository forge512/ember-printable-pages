import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { next, scheduleOnce } from "@ember/runloop";
import { task } from "ember-concurrency";
import { Promise } from "rsvp";
import { get } from "@ember/object";
import { isBlank } from "@ember/utils";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import { log } from "../utils/logger";
import { buildWaiter } from "@ember/test-waiters";

let waiter = buildWaiter("render-waiter");
let waiterToken;

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

  @tracked rerendering = true;
  @tracked reportObject;
  element;

  constructor() {
    super(...arguments);
    this.renderTask.perform();
  }

  @action
  onInsert(element) {
    this.element = element;
  }

  get chapters() {
    return this.reportObject?.chapters;
  }

  get pageLayout() {
    let units = get(this.args, 'units');
    if(isBlank(units)) {
      units = DEFAULT_DIMENSIONS['units'];
    }
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
  @task *renderTask() {
    this.reportObject = this.documentData.register(this.elementId);
    this.rerendering = false;
    this.reportStartTask.perform(this.reportObject.lastPage, null);
  }

  @task({ drop: true })
  *rerenderTask() {
    log("<component:printable-pages> #rerenderTask");
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
    if (waiterToken) waiter.endAsync(waiterToken);

    waiterToken = waiter.beginAsync();

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
    if (this.args.onRenderProgress) {
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

          waiter.endAsync(waiterToken);

          if (this.args.onRenderComplete) {
            this.args.onRenderComplete(this.reportObject?.lastPage);
          }

          resolve();
        });
      });
    }
  }

  @action
  onUpdate() {
    this.rerenderTask.perform();
  }

  // ACTIONS
  @action
  registerChapter(id, opts) {
    return this.documentData.registerChapter(this.elementId, id, opts);
  }

  @action
  registerSection() {
    return this.documentData.registerSection(...arguments);
  }

  @action
  addPage(chapterId) {
    if (this.rerendering) return;

    this.documentData.addPage(this.elementId, chapterId);
    this.reportProgressTask.perform();
  }

  @action
  addFirstPageToChapters() {
    this.chapters.forEach((chapter) => this.addPage(chapter.id));
  }
}
