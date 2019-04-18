import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/section-item";

export default Component.extend({
  layout,
  classNames: ["PrintablePages-sectionItem"],
  didInsertElement() {
    this._super(...arguments);
    let height = this.element.offsetHeight;
    if (
      this.section.maxItemHeight === null ||
      this.section.maxItemHeight < height
    ) {
      this.section.set("maxItemHeight", height);
    }

    if (
      this.section.minItemHeight === null ||
      height < this.section.minItemHeight
    ) {
      this.section.set("minItemHeight", height);
    }

    this.renderedItem(this.elementId);
  },

  willDestroyElement() {
    this._super(...arguments);
    this.renderedItem("-" + this.elementId);
  }
});
