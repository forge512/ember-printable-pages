import EmberObject from '@ember/object';
import { difference } from "ember-awesome-macros";

export default EmberObject.extend({
  init() {
    this._super(...arguments);
    this.set("pages", EmberObject.create());
  },
  id: null,
  columnCount: 1,
  nextItemIndex: 0,
  isFullyRendered: false,
  renderDataLength: 0,
  pages: null,
  maxItemHeight: null,
  minItemHeight: null,
  itemHeightDiff: difference("maxItemHeight", "minItemHeight"),
  itemCountForPage(pageIndex) {
    let page = this.pages[pageIndex];
    if (!page) return 0;
    return page.endIndex - page.startIndex + 1;
  },

  reconcilePageStartIndex(pageIndex) {
    let previousPage = this.pages[pageIndex - 1];
    let startIndex = previousPage.endIndex + 1;
    let page = this.pages[pageIndex];
    if (!page) {
      this.addPage(pageIndex, startIndex);
    } else {
      page.set("startIndex", startIndex);
    }
    this.incrementProperty("nextItemIndex");
  },

  addPage(pageIndex, startIndex) {
    this.pages.set(
      pageIndex,
      EmberObject.create({
        startIndex: startIndex,
        endIndex: startIndex
      })
    );
  },

  addItemToPage(pageIndex) {
    let page = this.pages[pageIndex];
    if (!page) {
      this.addPage(pageIndex, 0);
    } else {
      page.incrementProperty("endIndex");
      this.incrementProperty("nextItemIndex");
    }
  }
});

