import { next } from "@ember/runloop";
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
    // eslint-disable-next-line no-console
    this.sections.map((s) => console.log(s.toString(), s.pages));
  }

  @action
  renderNextItem(pageIndex, remainingHeight) {
    console.log(
      `<Models::Chapter#renderNextItem(${pageIndex}, ${remainingHeight})`
    );
    this.instrument();

    let section = this.sections.find((s) => s.isFullyRendered == false);

    // If no section, then this chapter is done!
    if (this.isFinishedRendering) {
      return;
    }
    if (!section.pages.at(pageIndex)) {
      section.addPage(pageIndex, 0);
    }
    let page = section.pages.at(pageIndex);

    if (page.delayRender) return;

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

    console.log(`-------`);
    this.instrument();
    console.log(
      `</> Models::Chapter#renderNextItem(${pageIndex}, ${remainingHeight})`
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
    console.group(`<Models::Chapter#removeItemFromPage(${pageIndex})`);
    this.instrument();

    let section = this.lastSectionInPage(pageIndex);
    let pageInSection = section.pages.at(pageIndex);

    // Take an item away from the current page
    if (pageInSection.endIndex === 0) {
      section.pages.splice(pageIndex, 1);
      section.pages.splice(pageIndex, 0, null);
    } else {
      pageInSection.endIndex = pageInSection.endIndex - 1;
    }
    section.nextItemIndex = section.nextItemIndex - 1;
    // section.isFullyRendered = false;

    console.log("------");
    this.instrument();
    console.groupEnd(`</> Models::Chapter#removeItemFromPage(${pageIndex})`);
  }

  // Rename to 'removeLastItem'
  @action
  removeLastItem(pageIndex, addPageFn) {
    next(() => {
      console.group(`<Models::Chapter#removeLastItem(${pageIndex}, fn)`);
      this.instrument();

      let itemCountForPage = this.itemCountForPage(pageIndex);

      // If there is only one item on the page, don't remove it
      // as it won't fit anywhere else
      if (itemCountForPage === 1) {
        // eslint-disable-next-line no-console
        console.warn(
          "ember-printable-pages could not fit a section item within a full page. " +
            "Content is likely clipped or page/column breaks are in unexpected places. " +
            `See page ${pageIndex + 1}.`
        );

        if (!this.isFinishedRendering) {
          this.renderNextPage(pageIndex, addPageFn);
        }
        return;
      }

      this.removeItemFromPage(pageIndex);

      console.groupEnd();
    });
  }

  @action
  renderNextPage(pageIndex, addPageFn) {
    next(() => {
      console.log(`Chapter#renderNextPage(${pageIndex}, fn)`);
      this.instrument();
      let chapterPage = this.pages.at(pageIndex + 1);
      if (!chapterPage) addPageFn(this.id);

      let lastSectionInPage = this.lastSectionInPage(pageIndex);

      if (!lastSectionInPage) {
        let nextSection = this.sections.find((s) => s.isFullyRendered == false);
        nextSection.addItemToPage(pageIndex + 1);
      } else if (!lastSectionInPage.isFullyRendered) {
        lastSectionInPage.reconcilePageStartIndex(pageIndex + 1);
      } else {
        //Ensure there are any other sections left.
        let nextSection = this.sections[lastSectionInPage.index + 1];
        if (nextSection) {
          nextSection.addItemToPage(pageIndex + 1);
        }
      }

      console.log("----");
      this.instrument();
      console.log(`</> Chapter#renderNextPage(${pageIndex}, fn)`);
    });
  }

  itemCountForPage(pageIndex) {
    return this.sections.reduce((a, v) => a + v.itemCountForPage(pageIndex), 0);
  }
}
