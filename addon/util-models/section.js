import { tracked } from "@glimmer/tracking";
import Page from "./page";
import { action } from "@ember/object";

export default class Section {
  @tracked pages = [];

  id;
  columnCount = 1;
  nextItemIndex = 0;
  renderDataLength = 0;
  maxItemHeight = null;
  minItemHeight = null;
  isFullyRendered = false;
  data = [];

  constructor(options = {}) {
    let { id, index, columnCount, data } = options;
    this.id = id;
    this.index = index;
    this.columnCount = columnCount || 1;
    this.data = data;
  }

  get itemHeightDiff() {
    return this.maxItemHeight - this.minItemHeight;
  }

  itemCountForPage(pageIndex) {
    let page = this.pages.at(pageIndex);
    if (!page) return 0;

    return page.endIndex - page.startIndex + 1;
  }

  reconcilePageStartIndex(pageIndex) {
    let previousPage = this.pages.at(pageIndex - 1);
    let startIndex = previousPage.endIndex + 1;
    let page = this.pages.at(pageIndex);
    if (!page) {
      console.log(`Section:${this.id} #reconcilePageStartIndex --- addPage`);
      page = this.addPage(pageIndex, startIndex);
    } else {
      page.startIndex = startIndex;
    }

    this.nextItemIndex = this.nextItemIndex + 1;
    console.log(
      `Section:${this.id} #reconcilePageStartIndex`,
      `${pageIndex} : ${page.startIndex}`
    );

    // this.updateIsFullyRendered();
  }

  // seems like this could be a getter
  updateIsFullyRendered() {
    console.log(
      `Section:${this.id} #updateIsFullyRendered`,
      this.nextItemIndex >= this.data.length
    );
    this.isFullyRendered = this.nextItemIndex >= this.data.length;
  }

  @action
  addPage(pageIndex, startIndex) {
    console.log(`Section:${this.id} #addPage`);

    let page = new Page({
      startIndex: startIndex,
      endIndex: startIndex,
    });

    if (this.pages.length === 0) {
      this.pages = [...Array(pageIndex), page];
    } else {
      this.pages = [...this.pages, page];
    }
    return page;
    // this.updateIsFullyRendered();
  }

  @action
  addItemToPage(pageIndex) {
    console.log(`Section:${this.id} #addItemToPage`);

    let page = this.pages.at(pageIndex);
    if (!page) {
      this.addPage(pageIndex, 0);
    } else {
      page.endIndex = page.endIndex + 1;
      this.nextItemIndex = this.nextItemIndex + 1;
      // this.updateIsFullyRendered();
    }
  }

  toString() {
    return `<Models::Section:${this.id}> ${this.data.length} items, nextItemIndex ${this.nextItemIndex}, isFullyRendered ${this.isFullyRendered}`;
  }
}
