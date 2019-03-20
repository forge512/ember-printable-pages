import Controller from "@ember/controller";
import { computed } from "@ember/object";

export default Controller.extend({
  sectionData: computed(function() {
    return [...Array(100)].map((_, i) => i);
  })
});
