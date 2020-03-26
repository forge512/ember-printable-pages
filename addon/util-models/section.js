import EmberObject, { computed } from "@ember/object";
import { A } from "@ember/array";

export default EmberObject.extend({
  init() {
    this._super(...arguments);
    this.set("pages", A([]));
  },

  id: null,
  columnCount: 1,
  nextItemIndex: 0,
  isFullyRendered: false,
  renderDataLength: 0,
  pages: null,
  maxItemHeight: null,
  minItemHeight: null,
  itemHeightDiff: computed("maxItemHeight", "minItemHeight", function() {
    return this.maxItemHeight - this.minItemHeight;
  }),
  itemCountForPage(pageIndex) {
    let page = this.pages.objectAt(pageIndex);
    if (!page) return 0;
    return page.endIndex - page.startIndex + 1;
  },

  reconcilePageStartIndex(pageIndex) {
    let previousPage = this.pages.objectAt(pageIndex - 1);
    let startIndex = previousPage.endIndex + 1;
    let page = this.pages.objectAt(pageIndex);
    if (!page) {
      this.addPage(pageIndex, startIndex);
    } else {
      page.set("startIndex", startIndex);
    }
    this.incrementProperty("nextItemIndex");
    this.updateIsFullyRendered();
  },

  updateIsFullyRendered() {
    this.set("isFullyRendered", this.nextItemIndex >= this.data.length);
  },

  addPage(pageIndex, startIndex) {
    let page = EmberObject.create({
      startIndex: startIndex,
      endIndex: startIndex
    });

    if (this.pages.length === 0) {
      this.pages.pushObjects([...Array(pageIndex), page]);
    } else {
      this.pages.pushObject(page);
    }
  },

  addItemToPage(pageIndex) {
    let page = this.pages.objectAt(pageIndex);
    if (!page) {
      this.addPage(pageIndex, 0);
    } else {
      page.incrementProperty("endIndex");
      this.incrementProperty("nextItemIndex");
    }
  }
});
