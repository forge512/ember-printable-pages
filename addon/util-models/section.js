import { A } from "@ember/array";
import { tracked } from "@glimmer/tracking";
import Page from "./page";
import { TrackedObject, TrackedArray } from "tracked-built-ins";
import { action } from "@ember/object";

export default class Section {
  @tracked pages = A([]);
  @tracked id;
  @tracked columnCount = 1;
  @tracked nextItemIndex = 0;
  @tracked renderDataLength = 0;
  @tracked maxItemHeight = null;
  @tracked minItemHeight = null;
  @tracked isFullyRendered = false;
  @tracked data = A([]);

  constructor(options = {}) {
    let { id, index, columnCount, data } = options;
    this.id = id;
    this.index = index;
    this.columnCount = columnCount;
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
      this.addPage(pageIndex, startIndex);
    } else {
      page.startIndex = startIndex;
    }

    this.nextItemIndex = this.nextItemIndex + 1;
    // this.updateIsFullyRendered();
  }

  // seems like this could be a getter
  updateIsFullyRendered() {
    this.isFullyRendered = this.nextItemIndex >= this.data.length;
  }

  @action
  addPage(pageIndex, startIndex) {
    let page = new Page({
      startIndex: startIndex,
      endIndex: startIndex,
    });

    if (this.pages.length === 0) {
      this.pages = [...Array(pageIndex), page];
    } else {
      this.pages = [...this.pages, page];
    }
    // this.updateIsFullyRendered();
  }

  @action
  addItemToPage(pageIndex) {
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
    return `<section:${this.id}> ${this.data.length} items, nextItemIndex ${this.nextItemIndex}, isFullyRendered ${this.isFullyRendered}`;
  }
}
