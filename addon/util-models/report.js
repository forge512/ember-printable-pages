import EmberObject, { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { A } from "@ember/array";

export default EmberObject.extend({
  init() {
    this._super(...arguments);
    this.set("chapterMap", EmberObject.create());
    this.set("chapters", A([]));
  },

  chapterMap: null,
  chapters: null,
  chapterCount: alias("chapters.length"),
  lastPage: alias("chapters.lastObject.endPage"),
  isFinishedRendering: computed(
    "chapters.@each.isFinishedRendering",
    function() {
      return this.chapters.isEvery("isFinishedRendering");
    }
  )
});
