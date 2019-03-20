import Component from "@ember/component";
import layout from "../../templates/components/printable-report/page-header";

export default Component.extend({
  layout,
  classNames: ["PrintablePages-pageHeader"],
  shouldRender: true
});
