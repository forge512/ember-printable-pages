import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/page-layout";
import { htmlSafe } from "@ember/template";

export default Component.extend({
  layout,
  classNames: "PrintablePages-pageLayout",
  pageStyles: "",

  // LIFECYCLE HOOKS
  didInsertElement() {
    this.set(
      "pageStyles",
      htmlSafe(
        `height:${this.pageLayout.height};` + `width:${this.pageLayout.width};`
      )
      // TODO margins need to be controlled in css so that we can
      // have margins in the dom to make it look like a printed page,
      // then use @page to control print margins in '@media print'
      // `padding:${this.pageLayout.margins};`
    );
  }
});
