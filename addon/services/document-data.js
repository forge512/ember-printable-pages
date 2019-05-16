import Service from "@ember/service";
import EmberObject, { computed } from "@ember/object";
import { A } from "@ember/array";
import { difference } from "ember-awesome-macros";
import { alias } from "@ember/object/computed";
import { next } from "@ember/runloop";
import { isPresent } from "@ember/utils";

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
  isFinishedRendering: computed(
    "chapters.@each.isFinishedRendering",
    function() {
      return this.chapters.isEvery("isFinishedRendering", true);
    }
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
  isFinishedRendering: false,

  renderNextItem(pageIndex, remainingHeight) {
    let section = this.sections.findBy("isFullyRendered", false);

    // If no section, then this chapter is done!
    if (!section) {
      this.set("isFinishedRendering", true);
      return;
    }

    if (!section.pages[pageIndex]) {
      section.pages.set(
        pageIndex,
        EmberObject.create({
          startIndex: 0,
          endIndex: 0
        })
      );
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

  moveLastItemToNextPage(pageIndex) {
    next(() => {
      // Find sections with data in page at pageIndex
      let sectionsInPage = this.sections.filter(
        section => !!section.pages[pageIndex]
      );
      // Grab the last section
      let section = sectionsInPage[sectionsInPage.length - 1];
      let currentPage = section.pages[pageIndex];
      let nextPage = section.pages[pageIndex + 1];

      // If the same item overflows twice, then don't move
      // it as it won't fit on any page
      if (
        isPresent(section.overflowedItemIndex) &&
        section.overflowedItemIndex === currentPage.endIndex
      ) {
        console.warn(
          "ember-printable-pages could not fit a section item in a blank page. " +
            "Content is likely clipped or page/column breaks are in unexpected places. " +
            `See page ${pageIndex + 1}.`
        );
        if (nextPage) {
          throw "ember-printable-pages - A section item overflowed twice in the " +
            `middle of the document. See page ${pageIndex + 1}. ` +
            "Perhaps section items are growing in size after initial render.";
        }

        this.log(`create new page`);
        section.overflowedItemIndex = null;
        // The current page is definitely settled so let the next start immediately
        nextPage = EmberObject.create({
          startIndex: currentPage.endIndex + 1,
          endIndex: currentPage.endIndex + 1,
          delayRender: false
        });
        section.pages.set(pageIndex + 1, nextPage);
        return;
      }

      // Capture which item didn't fit
      section.set("overflowedItemIndex", currentPage.endIndex);

      // Take an item away from the current page
      currentPage.decrementProperty("endIndex");
      section.decrementProperty("nextItemIndex");

      // If the next page already exists move items to it
      if (nextPage) {
        this.log(`remove an item from page ${pageIndex + 1}`);
        nextPage.decrementProperty("startIndex");
        // section.decrementProperty("nextItemIndex");
      } else {
        this.log(`remove an item from page ${pageIndex + 1}, create new page`);
        nextPage = EmberObject.create({ delayRender: true });
        section.pages.set(pageIndex + 1, nextPage);
      }
    });
  },

  // This should get called during first render when a page
  // has settled.
  renderNextPage(pageIndex) {
    next(() => {
      // Find sections with data in page at pageIndex
      let sectionsInPage = this.sections.filter(
        section => !!section.pages[pageIndex]
      );
      // Grab the last section
      let section = sectionsInPage[sectionsInPage.length - 1];
      section.incrementProperty("nextItemIndex");
      let currentPage = section.pages[pageIndex];
      let nextPage = section.pages[pageIndex + 1];
      nextPage.setProperties({
        startIndex: currentPage.endIndex + 1,
        endIndex: currentPage.endIndex + 1,
        delayRender: false
      });
    });
  },
  log() {
    if (false) {
      console.log(this.toString(), ...arguments);
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
  itemHeightDiff: difference("maxItemHeight", "minItemHeight")
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
