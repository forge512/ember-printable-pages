import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/page-layout";
import { htmlSafe } from "@ember/template";

export default Component.extend({
  layout,
  classNames: "PrintablePages-pageLayout",
  pageStyles: "",

  // LIFECYCLE HOOKS
  init() {
    this._super(...arguments);
    this.set(
      "pageStyles",
      htmlSafe(
        `height:${this.pageLayout.innerHeight};` +
          `width:${this.pageLayout.innerWidth};`
      )
    );
    this.set(
      "containerStyles",
      htmlSafe(
        `padding-top:${this.pageLayout.top};` +
          `padding-right:${this.pageLayout.right};` +
          `padding-bottom:${this.pageLayout.bottom};` +
          `padding-left:${this.pageLayout.left};`
      )
    );
  }
});
