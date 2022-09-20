import Page from "./page";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

export default class Chapter {
  sectionMap = {};
  sections = [];
  @tracked pages;
  @tracked endPage;
  @tracked startPage;

  constructor({ id, index, startPage, endPage, name, isToc }) {
    this.id = id;
    this.index = index;
    this.startPage = startPage;
    this.endPage = endPage;
    this.name = name;
    this.isToc = isToc;

    this.firstPage = new Page();
    this.pages = [this.firstPage];
  }

  get sectionCount() {
    return this.sections?.length || 0;
  }

  get isFinishedRendering() {
    return !this.sections.find((s) => !s.isFullyRendered);
  }

  instrument() {
    console.group("sections");
    this.sections.map((s) =>
      console.log(
        s.toString(),
        s.pages.map((p) => p?.toJson())
      )
    );
    console.groupEnd("sections");
  }

  @action
  renderNextItem(pageIndex, remainingHeight) {
    console.group(
      this.logPrefix(),
      `#renderNextItem( pageIndex: ${pageIndex}, remainingHeight: ${remainingHeight})`
    );
    this.instrument();

    let section = this.sections.find((s) => s.isFullyRendered == false);

    // If no section, then this chapter is done!
    if (this.isFinishedRendering) {
      this.log("isFinishedRendering");
      console.groupEnd(
        this.logPrefix(),
        `#renderNextItem(${pageIndex}, ${remainingHeight})`
      );
      return;
    }

    if (!section.pages.at(pageIndex)) {
      section.addPage(pageIndex, section.nextItemIndex);
    }
    let page = section.pages.at(pageIndex);

    // If rendered 2 or more items AND similar in height (within 200px)
    if (section.nextItemIndex > 1 && section.itemHeightDiff < 200) {
      let remainingItemCount = section.data.length - section.nextItemIndex;
      let heightGuess = (section.maxItemHeight + section.minItemHeight) / 2;
      let fastForwardCount = Math.round(
        (section.columnCount * remainingHeight) / heightGuess
      );
      fastForwardCount = Math.max(1, fastForwardCount);
      fastForwardCount = Math.min(fastForwardCount, remainingItemCount);

      page.endIndex = page.endIndex + fastForwardCount;
      section.nextItemIndex = section.nextItemIndex + fastForwardCount;
    } else {
      // ELSE increment forward by 1
      page.endIndex = section.nextItemIndex;
      section.nextItemIndex = section.nextItemIndex + 1;
    }

    section.updateIsFullyRendered();
    this.instrument();

    console.groupEnd(
      this.logPrefix(),
      `#renderNextItem( pageIndex: ${pageIndex}, remainingHeight: ${remainingHeight})`
    );
  }

  @action
  lastSectionInPage(pageIndex) {
    // Find sections with data in page at pageIndex
    let sectionsInPage = this.sections.filter(
      (section) => !!section.pages.at(pageIndex)
    );
    return sectionsInPage[sectionsInPage.length - 1];
  }

  @action
  removeItemFromPage(pageIndex) {
    console.group(this.logPrefix(), `#removeItemFromPage(${pageIndex})`);
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
    console.groupEnd(this.logPrefix(), `#removeItemFromPage(${pageIndex})`);
  }

  @action
  moveLastItem(pageIndex, addPageFn) {
    console.group(this.logPrefix(), `#moveLastItem(${pageIndex}, fn)`);
    this.instrument();

    // If there is only one item on the page, don't move it
    if (this.lastSectionDidNotFit(pageIndex)) {
      console.log(
        this.logPrefix(),
        `#moveLastItem(${pageIndex}, fn) -- lastSectionDidNotFit`
      );
      if (!this.isFinishedRendering) addPageFn(this.id);
      return;
    }

    // Remove an item from the page
    this.removeItemFromPage(pageIndex);

    // If the next page exists, move item to that page.
    // Else add a page
    if (this.pages.at(pageIndex + 1)) {
      console.log(
        this.logPrefix(),
        `#moveLastItem(${pageIndex}, fn) -- move to next page`
      );
      let lastSectionInPage = this.lastSectionInPage(pageIndex);
      lastSectionInPage.reconcilePageStartIndex(pageIndex + 1);
    }

    this.instrument();
    console.groupEnd(this.logPrefix(), `#moveLastItem(${pageIndex}, fn)`);
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

  // @action
  // renderNextPage(pageIndex, addPageFn) {
  //   console.group(this.logPrefix(), `#renderNextPage(${pageIndex}, fn)`);
  //   this.instrument();

  //   let lastSectionInPage = this.lastSectionInPage(pageIndex);

  //   // maybe move to renderNextItem?
  //   // if (!lastSectionInPage) {
  //   //   let nextSection = this.sections.find((s) => s.isFullyRendered == false);
  //   //   nextSection.addItemToPage(pageIndex + 1);
  //   if (!lastSectionInPage) {
  //     // no-op
  //   if (!lastSectionInPage?.isFullyRendered) {
  //     lastSectionInPage.reconcilePageStartIndex(pageIndex + 1);
  //   } else {
  //     this.log("---------------DO WEIRD THING---------------");
  //     //Ensure there are any other sections left.
  //     let nextSection = this.sections[lastSectionInPage.index + 1];
  //     if (nextSection) {
  //       nextSection.addItemToPage(pageIndex + 1);
  //     }
  //   }

  //   this.instrument();
  //   console.groupEnd(this.logPrefix(), `#renderNextPage(${pageIndex}, fn)`);
  // }

  itemCountForPage(pageIndex) {
    return this.sections.reduce((a, v) => a + v.itemCountForPage(pageIndex), 0);
  }

  log() {
    console.log(this.logPrefix(), ...arguments);
  }

  logPrefix() {
    return `<util-models:chapter:${this.id}:index-${this.index}>`;
  }
}
