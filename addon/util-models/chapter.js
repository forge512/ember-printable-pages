import EmberObject, { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { A } from "@ember/array";
import { next } from "@ember/runloop";
import Page from "./page";

export default EmberObject.extend({
  init() {
    this._super(...arguments);
    this.set("sectionMap", EmberObject.create());
    this.set("sections", A([]));
    let firstPage = Page.create();
    this.set("pages", A([firstPage]));
  },
  id: null,
  pages: null,
  sectionMap: null,
  sections: null,
  index: null,
  startPage: 1,
  endPage: 1,
  sectionCount: alias("sections.length"),

  // COMPUTED PROPS
  isFinishedRendering: computed("sections.@each.isFullyRendered", function() {
    return this.sections.isEvery("isFullyRendered");
  }),

  instrument() {
    // eslint-disable-next-line no-console
    this.sections.map(s => console.log(s.toString(), s.pages.toArray()));
  },

  renderNextItem(pageIndex, remainingHeight) {
    // console.log(`Chapter#renderNextItem(${pageIndex}, ${remainingHeight})`);
    // this.instrument();

    let section = this.sections.findBy("isFullyRendered", false);

    // If no section, then this chapter is done!
    if (this.isFinishedRendering) return;

    if (!section.pages.objectAt(pageIndex)) {
      section.addPage(pageIndex, 0);
    }
    let page = section.pages.objectAt(pageIndex);

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
      page.set("endIndex", page.endIndex + fastForwardCount);
      section.set("nextItemIndex", section.nextItemIndex + fastForwardCount);
    } else {
      // ELSE increment forward by 1
      page.set("endIndex", section.nextItemIndex);
      section.incrementProperty("nextItemIndex");
    }

    section.updateIsFullyRendered();
    // console.log(`-------`);
    // this.instrument();
    // console.log(`</> Chapter#renderNextItem(${pageIndex}, ${remainingHeight})`);
  },

  lastSectionInPage(pageIndex) {
    // Find sections with data in page at pageIndex
    let sectionsInPage = this.sections.filter(
      section => !!section.pages.objectAt(pageIndex)
    );
    return sectionsInPage[sectionsInPage.length - 1];
  },

  itemCountForPage(pageIndex) {
    return this.sections.reduce((a, v) => a + v.itemCountForPage(pageIndex), 0);
  },

  removeItemFromPage(pageIndex) {
    // console.log(`Chapter#removeItemFromPage(${pageIndex})`);
    // this.instrument();

    let section = this.lastSectionInPage(pageIndex);
    let pageInSection = section.pages.objectAt(pageIndex);

    // Take an item away from the current page
    if (pageInSection.endIndex === 0) {
      section.pages.removeAt(pageIndex);
      section.pages.insertAt(pageIndex, null);
    } else {
      pageInSection.decrementProperty("endIndex");
    }
    section.decrementProperty("nextItemIndex");
    section.set("isFullyRendered", false);

    // console.log("------");
    // this.instrument();
    // console.log(`</> Chapter#removeItemFromPage(${pageIndex})`);
  },

  // Rename to 'removeLastItem'
  moveLastItemToNextPage(pageIndex, addPage) {
    next(() => {
      // console.log(`Chapter#moveLastItemToNextPage(${pageIndex}, fn)`);
      // this.instrument();

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
          this.renderNextPage(pageIndex, addPage);
        }
        return;
      }

      this.removeItemFromPage(pageIndex);
    });
  },

  renderNextPage(pageIndex, addPage) {
    next(() => {
      // console.log(`Chapter#renderNextPage(${pageIndex}, fn)`);
      // this.instrument();
      let chapterPage = this.pages.objectAt(pageIndex + 1);
      if (!chapterPage) addPage(this.id);

      let lastSectionInPage = this.lastSectionInPage(pageIndex);

      if (!lastSectionInPage) {
        let nextSection = this.sections.findBy("isFullyRendered", false);
        nextSection.addItemToPage(pageIndex + 1);
      } else if (!lastSectionInPage.isFullyRendered) {
        lastSectionInPage.reconcilePageStartIndex(pageIndex + 1);
      } else {
        //Ensure there are any other sections left.
        let nextSection = this.sections[lastSectionInPage.index + 1];
        if (nextSection) {
          nextSection.addItemToPage(pageIndex + 1);
          nextSection.updateIsFullyRendered();
        }
      }

      // console.log("----");
      // this.instrument();
      // console.log(`</> Chapter#renderNextPage(${pageIndex}, fn)`);
    });
  }
});
