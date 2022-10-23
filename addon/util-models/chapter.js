import Page from "./page";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { log, group, groupEnd } from "../utils/logger";

export default class Chapter {
  sectionMap = {};
  sections = [];
  @tracked pages = [];
  @tracked endPage;
  @tracked startPage;

  constructor({ id, index, startPage, endPage, name, isToc }) {
    this.id = id;
    this.index = index;
    this.startPage = startPage;
    this.endPage = endPage;
    this.name = name;
    this.isToc = isToc;
  }

  get sectionCount() {
    return this.sections?.length || 0;
  }

  get isFinishedRendering() {
    return !this.sections.find((s) => !s.isFullyRendered);
  }

  instrument() {
    group("sections");
    this.sections.map((s) =>
      log(
        s.toString(),
        s.pages.map((p) => p?.toJson())
      )
    );
    groupEnd("sections");
  }

  @action
  renderNextItem(pageIndex, remainingHeight) {
    group(this.logPrefix(), `#renderNextItem( pageIndex: ${pageIndex}, remainingHeight: ${remainingHeight})`);
    this.instrument();

    let section = this.sections.find((s) => s.isFullyRendered == false);

    // If no section, then this chapter is done!
    if (this.isFinishedRendering) {
      this.log("isFinishedRendering");
      groupEnd(this.logPrefix(), `#renderNextItem(${pageIndex}, ${remainingHeight})`);
      return;
    }

    let didAddNewPage = false;
    if (!section.pages.at(pageIndex)) {
      didAddNewPage = true;
      section.addPage(pageIndex, section.nextItemIndex);
      section.nextItemIndex = section.nextItemIndex + 1;
    }
    let page = section.pages.at(pageIndex);

    if (!page) debugger;

    // If rendered 2 or more items AND similar in height (within 200px)
    if (section.nextItemIndex > 1 && section.itemHeightDiff < 200) {
      let remainingItemCount = section.data.length - section.nextItemIndex;
      let heightGuess = (section.maxItemHeight + section.minItemHeight) / 2;
      let fastForwardCount = Math.round((section.columnCount * remainingHeight) / heightGuess);
      fastForwardCount = Math.max(1, fastForwardCount);
      fastForwardCount = Math.min(fastForwardCount, remainingItemCount);

      page.endIndex = page.endIndex + fastForwardCount;
      section.nextItemIndex = section.nextItemIndex + fastForwardCount;
    } else if (!didAddNewPage) {
      // ELSE increment forward by 1
      page.endIndex = section.nextItemIndex;
      section.nextItemIndex = section.nextItemIndex + 1;
    }

    section.updateIsFullyRendered();
    this.instrument();

    groupEnd(this.logPrefix(), `#renderNextItem( pageIndex: ${pageIndex}, remainingHeight: ${remainingHeight})`);
  }

  @action
  lastSectionInPage(pageIndex) {
    // Find sections with data in page at pageIndex
    let sectionsInPage = this.sections.filter((section) => !!section.pages.at(pageIndex));
    return sectionsInPage[sectionsInPage.length - 1];
  }

  @action
  removeItemFromPage(pageIndex) {
    group(this.logPrefix(), `#removeItemFromPage(${pageIndex})`);
    this.instrument();

    let section = this.lastSectionInPage(pageIndex);
    let pageInSection = section.pages.at(pageIndex);

    // Take an item away from the current page
    if (pageInSection.endIndex === 0) {
      let pagesClone = [...section.pages];
      pagesClone.splice(pageIndex, 1);
      pagesClone.splice(pageIndex, 0, null);
      section.pages = pagesClone;
    } else {
      pageInSection.endIndex = pageInSection.endIndex - 1;
    }
    section.nextItemIndex = section.nextItemIndex - 1;
    section.isFullyRendered = false;

    this.instrument();
    groupEnd(this.logPrefix(), `#removeItemFromPage(${pageIndex})`);
  }

  @action
  moveLastItem(pageIndex, addPageFn) {
    group(this.logPrefix(), `#moveLastItem(${pageIndex}, fn)`);
    this.instrument();

    // If there is only one item on the page, don't move it
    if (this.lastSectionDidNotFit(pageIndex)) {
      log(this.logPrefix(), `#moveLastItem(${pageIndex}, fn) -- lastSectionDidNotFit`);
      if (!this.isFinishedRendering) addPageFn(this.id);
      return;
    }

    // Remove an item from the page
    this.removeItemFromPage(pageIndex);

    // If the next page exists, move item to that page.
    // Else add a page
    if (this.pages.at(pageIndex + 1)) {
      log(this.logPrefix(), `#moveLastItem(${pageIndex}, fn) -- move to next page`);
      let lastSectionInPage = this.lastSectionInPage(pageIndex);
      lastSectionInPage.reconcilePageStartIndex(pageIndex + 1);
    }

    this.instrument();
    groupEnd(this.logPrefix(), `#moveLastItem(${pageIndex}, fn)`);
  }

  lastSectionDidNotFit(pageIndex) {
    let itemCountForPage = this.itemCountForPage(pageIndex);

    if (itemCountForPage === 1) {
      // eslint-disable-next-line no-console
      console.warn(
        "ember-printable-pages could not fit a section item within a full page. " +
          "Content is likely clipped or page/column breaks are in unexpected places. " +
          `See page ${pageIndex + 1}.`
      );

      return true;
    }

    return false;
  }

  itemCountForPage(pageIndex) {
    return this.sections.reduce((a, v) => a + v.itemCountForPage(pageIndex), 0);
  }

  log() {
    log(this.logPrefix(), ...arguments);
  }

  logPrefix() {
    return `<util-models:chapter:${this.id}:index-${this.index}>`;
  }
}
