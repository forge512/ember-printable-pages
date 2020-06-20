import Component from "@ember/component";
import layout from "../templates/components/print-settings";
import { storageFor } from "ember-local-storage";

export default Component.extend({
  settings: storageFor("print-settings"),
  layout,
  tagName: ""
});
