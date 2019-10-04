import Service from "@ember/service";
import EmberObject from "@ember/object";
import Report from "../util-models/report";
import Chapter from "../util-models/chapter";
import Page from "../util-models/page";
import Section from "../util-models/section";

export default Service.extend({
  init() {
    this._super(...arguments);
    this.set("reports", EmberObject.create());
  },

  // register/unregister reports
  register(id) {
    let report = Report.create();
    this.reports.set(id, report);
    return report;
  },

  unregister(id) {
    this.reports.set(id, null);
  },

  registerChapter(reportId, chapterId) {
    let report = this.reports[reportId];

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
  }
});
