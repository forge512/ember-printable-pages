import Service from "@ember/service";
import Report from "../util-models/report";
import Chapter from "../util-models/chapter";
import Page from "../util-models/page";
import Section from "../util-models/section";
import { tracked } from "@glimmer/tracking";

export default class DocumentData extends Service {
  @tracked reportsMap = {};

  register(id) {
    window.documentData = this;
    console.log(`<service:document-data> register(${id})`);
    let report = new Report();
    this.reportsMap[id] = report;
    return report;
  }

  unregister(id) {
    this.reportsMap[id] = null;
  }

  registerChapter(reportId, chapterId, opts = {}) {
    console.log(
      `<service:document-data> registerChapter(${reportId}, ${chapterId})`
    );

    let report = this.reportsMap[reportId];

    if (!report) return;

    let chapter = new Chapter({
      id: chapterId,
      index: report.chapterCount,
      startPage: report.chapterCount + 1,
      endPage: report.chapterCount + 1,
      name: opts.name,
      isToc: opts.isToc,
    });

    report.chapterMap[chapterId] = chapter;
    report.chapters.push(chapter);

    return chapter;
  }

  registerSection(reportId, chapterId, sectionId, options = {}) {
    console.log(
      `<service:document-data> registerSection(${reportId}, ${chapterId}, ${sectionId})`
    );

    let { data, columnCount } = options;
    let report = this.reportsMap[reportId];
    let chapter = report.chapterMap[chapterId];

    let section = new Section({
      id: sectionId,
      data: data,
      columnCount: columnCount,
      index: chapter.sectionCount,
    });

    chapter.sectionMap[sectionId] = section;
    chapter.sections.push(section);

    return section;
  }

  addPage(reportId, chapterId) {
    console.log(`<service:document-data> addPage(${reportId}, ${chapterId})`);
    let report = this.reportsMap[reportId];
    let chapter = report.chapterMap[chapterId];
    let chapterIndex = report.chapters.indexOf(chapter);

    chapter.endPage = chapter.endPage + 1;
    chapter.pages = [
      ...chapter.pages,
      new Page({ number: chapter.pages.length }),
    ];

    for (let i = chapterIndex + 1; i < report.chapters.length; i++) {
      report.chapters[i].startPage = report.chapters[i].startPage + 1;
      report.chapters[i].endPage = report.chapters[i].endPage + 1;
    }
  }
}
