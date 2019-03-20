import Service from "@ember/service";
import EmberObject, { computed } from "@ember/object";
import { A } from "@ember/array";
import { array, equal, raw } from "ember-awesome-macros";
import { alias } from "@ember/object/computed";
import { run } from "@ember/runloop";

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

  renderNextItem(pageIndex) {
    let section = this.sections.findBy("isFullyRendered", false);

    // If no section, then this chapter is done!
    if (!section) {
      this.set("isFinishedRendering", true);
      return;
    }

    let nextItem = section.data[section.nextItemIndex];

    if (!section.pages[pageIndex]) {
      section.pages.set(pageIndex, EmberObject.create({ data: A([]) }));
    }
    let page = section.pages[pageIndex];

    page.data.pushObject(nextItem || {});
    section.incrementProperty("nextItemIndex");
    section.set(
      "isFullyRendered",
      section.nextItemIndex >= section.data.length
    );
  },

  moveLastItemToNextPage(pageIndex) {
    run(() => {
      // Find sections with data in page at pageIndex
      let sectionsInPage = this.sections.filter(
        section => !!section.pages[pageIndex]
      );
      // Grab the last section
      let section = sectionsInPage[sectionsInPage.length - 1];
      let currentPage = section.pages[pageIndex];
      let nextPage = section.pages[pageIndex + 1];
      if (!nextPage) {
        nextPage = EmberObject.create({ data: A([]) });
        section.pages.set(pageIndex + 1, nextPage);
      }
      let data = currentPage.data.popObject();
      nextPage.data.addObject(data);
    });
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
  nextItemIndex: 0,
  isFullyRendered: false,
  renderDataLength: 0,
  renderedItems: array.slice("data", 0, "renderDataLength"),
  hasFinishedRendering: equal("renderedItems.length", "data.length"),
  pages: null
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

  registerSection(reportId, chapterId, sectionId, data) {
    let report = this.reports[reportId];
    let chapter = report.chapterMap[chapterId];
    this.log("registerSection", reportId, chapterId, sectionId, data);

    let section = Section.create({
      id: sectionId,
      data: data,
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
