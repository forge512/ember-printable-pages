export default class Report {
  chapterMap = {};
  chapters = [];

  get chapterCount() {
    return this.chapters?.length;
  }

  get lastPage() {
    return this.chapters?.[this.chapterCount - 1]?.endPage;
  }

  get isFinishedRendering() {
    return !this.chapters.find((c) => !c.isFinishedRendering);
  }

  addChapter(chapter) {
    this.chapterMap[chapter.id] = chapter;
    this.chapters.push(chapter);
  }
}
