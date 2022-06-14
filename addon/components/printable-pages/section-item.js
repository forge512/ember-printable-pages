import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { guidFor } from "@ember/object/internals";
import { action } from "@ember/object";
export default class SectionItem extends Component {
  elementId = "ember-" + guidFor(this);
  @tracked element;

  @action
  onInsert(element) {
    console.log(
      `%c <section-item:${this.elementId}> did-insert`,
      "color: darkgrey"
    );
    this.element = element;

    let height = this.element.offsetHeight;
    if (
      this.args.section.maxItemHeight === null ||
      this.args.section.maxItemHeight < height
    ) {
      this.args.section.maxItemHeight = height;
    }

    if (
      this.args.section.minItemHeight === null ||
      height < this.section.minItemHeight
    ) {
      this.args.section.minItemHeight = height;
    }

    this.args.setLastRenderedItem(this.elementId);
  }

  @action
  willDestroy() {
    this._super(...arguments);
    this.args.setLastRenderedItem("-" + this.elementId);
  }
}
