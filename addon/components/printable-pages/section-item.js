import Component from "@glimmer/component";
import { guidFor } from "@ember/object/internals";
import { action } from "@ember/object";
import { task } from "ember-concurrency";
export default class SectionItem extends Component {
  elementId = "ember-" + guidFor(this);
  element = null;

  @action
  onInsert(element) {
    this.element = element;
    this.onRender.perform();

    this.args.renderNext();
  }

  // eslint-disable-next-line require-yield
  @task *onRender() {
    let height = this.element.offsetHeight;
    if (this.args.section.maxItemHeight === null || this.args.section.maxItemHeight < height) {
      this.args.section.maxItemHeight = height;
    }

    if (this.args.section.minItemHeight === null || height < this.args.section.minItemHeight) {
      this.args.section.minItemHeight = height;
    }

    this.args.setLastRenderedItem(this.elementId);
  }

  @action
  willDestroy() {
    super.willDestroy(...arguments);
    this.args.setLastRenderedItem("-" + this.elementId);
  }
}
