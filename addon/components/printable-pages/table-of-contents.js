import Component from "@ember/component";
import layout from "../../templates/components/printable-pages/table-of-contents";
import { computed } from "@ember/object";

export default Component.extend({
  layout,
  classNames: ["PrintablePages-toc"],

  "data-test-toc": true,

  chapterMeta: computed(
    "chapters.@each.{startPage,endPage,name,isToc}",
    function() {
      return this.chapters.map(c => ({
        startPage: c.startPage,
        endPage: c.endPage,
        name: c.name,
        isToc: c.isToc
      }));
    }
  ),

  chapterMetaWithoutToc: computed("chapterMeta.@each.isToc", function() {
    return this.chapterMeta.filter(c => !c.isToc);
  })
});
