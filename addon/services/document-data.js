import Service from "@ember/service";
import EmberObject from "@ember/object";
import { A } from "@ember/array";
import { array, difference, raw } from "ember-awesome-macros";
import { alias } from "@ember/object/computed";
import { next } from "@ember/runloop";

/*
 * Report
 */
const Report = EmberObject.extend({
  init() {
    this._super(...arguments);
    this.set("chapterMap", EmberObject.create());
    this.set("chapters", A([]));
  },

  chapterMap: null,
  chapters: null,
  chapterCount: alias("chapters.length"),
  lastPage: alias("chapters.lastObject.endPage"),
  isFinishedRendering: array.isEvery(
    "chapters",
    raw("isFinishedRendering"),
    raw(true)
  )
});

/*
 * Chapter
 */
const Chapter = EmberObject.extend({
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
  isFinishedRendering: array.isEvery(
    "sections",
    raw("isFullyRendered"),
    raw(true)
  ),

  renderNextItem(pageIndex, remainingHeight) {
    let section = this.sections.findBy("isFullyRendered", false);

    // If no section, then this chapter is done!
    if (this.isFinishedRendering) return;

    if (!section.pages[pageIndex]) {
      section.addPage(pageIndex, 0);
    }
    let page = section.pages[pageIndex];

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
      this.log(
        `increment page ${pageIndex + 1} by ${fastForwardCount} - min ${
          section.minItemHeight
        }, max ${section.maxItemHeight}, guess ${heightGuess}`
      );
      page.set("endIndex", page.endIndex + fastForwardCount);
      section.set("nextItemIndex", section.nextItemIndex + fastForwardCount);
    } else {
      // ELSE increment forward by 1
      this.log(`increment page ${pageIndex + 1} by 1`);
      page.set("endIndex", section.nextItemIndex);
      section.incrementProperty("nextItemIndex");
    }

    section.set(
      "isFullyRendered",
      section.nextItemIndex >= section.data.length
    );
  },

  lastSectionInPage(pageIndex) {
    // Find sections with data in page at pageIndex
    let sectionsInPage = this.sections.filter(
      section => !!section.pages[pageIndex]
    );
    return sectionsInPage[sectionsInPage.length - 1];
  },

  itemCountForPage(pageIndex) {
    return this.sections.reduce((a, v) => a + v.itemCountForPage(pageIndex), 0);
  },

  removeItemFromPage(pageIndex) {
    let section = this.lastSectionInPage(pageIndex);
    let pageInSection = section.pages[pageIndex];

    // Take an item away from the current page
    if (pageInSection.endIndex === 0) {
      section.pages.set(pageIndex, null);
    } else {
      pageInSection.decrementProperty("endIndex");
    }
    section.decrementProperty("nextItemIndex");
    section.set("isFullyRendered", false);
  },

  // Rename to 'removeLastItem'
  moveLastItemToNextPage(pageIndex, addPage) {
    next(() => {
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
          this.renderNextPage(pageIndex + 1, addPage);
        }
        return;
      }

      this.removeItemFromPage(pageIndex);
    });
  },

  renderNextPage(pageIndex, addPage) {
    next(() => {
      let chapterPage = this.pages[pageIndex + 1];
      if (!chapterPage) addPage(this.id);

      let lastSectionInPage = this.lastSectionInPage(pageIndex);

      if (!lastSectionInPage.isFullyRendered) {
        lastSectionInPage.reconcilePageStartIndex(pageIndex + 1);
      } else {
        let nextSection = this.sections[lastSectionInPage.index + 1];
        nextSection.addItemToPage(pageIndex + 1);
      }
    });
  },
  log() {
    // TODO make this an app enablable flag via config file
    // eslint-disable-next-line no-constant-condition
    if (false) {
      console.log(this.toString(), ...arguments); // eslint-disable-line no-console
    }
  }
});

let Page = EmberObject.extend({
  number: 1
});

/*
 * Section
 */
let Section = EmberObject.extend({
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

/*
 *
 * Service
 *
 */
export default Service.extend({
  init() {
    this._super(...arguments);
    this.set("reports", EmberObject.create());
  },

  // register/unregister reports
  register(id) {
    this.log("register", id);
    let report = Report.create();
    this.reports.set(id, report);
    return report;
  },
  unregister(id) {
    this.log("unregister", id);
    this.reports.set(id, null);
  },

  registerChapter(reportId, chapterId) {
    let report = this.reports[reportId];
    this.log("registerChapter", report.chapterCount, reportId, chapterId);

    let chapter = Chapter.create({
      id: chapterId,
      index: report.chapterCount,
      startPage: report.chapterCount + 1,
      endPage: report.chapterCount + 1
    });

    report.chapterMap.set(chapterId, chapter);
    report.chapters.pushObject(chapter);

    return chapter;
  },

  registerSection(reportId, chapterId, sectionId, { data, columnCount }) {
    let report = this.reports[reportId];
    let chapter = report.chapterMap[chapterId];
    this.log("registerSection", reportId, chapterId, sectionId, data);

    let section = Section.create({
      id: sectionId,
      data: data,
      columnCount: columnCount,
      index: chapter.sectionCount
    });
    chapter.sectionMap.set(sectionId, section);
    chapter.sections.pushObject(section);

    return section;
  },

  addPage(reportId, chapterId) {
    let report = this.reports[reportId];
    let chapter = report.chapterMap[chapterId];
    let chapterIndex = report.chapters.indexOf(chapter);

    chapter.incrementProperty("endPage");
    chapter.pages.pushObject(Page.create({ number: chapter.pages.length }));

    for (let i = chapterIndex + 1; i < report.chapters.length; i++) {
      report.chapters[i].incrementProperty("startPage");
      report.chapters[i].incrementProperty("endPage");
    }
  },

  /*
   * HELPER STUFF
   */
  log() {
    // eslint-disable-next-line
    // console.log(this.toString(), ...arguments);
  }
});
