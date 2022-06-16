import { tracked } from "@glimmer/tracking";
import { TrackedObject, TrackedArray } from "tracked-built-ins";

export default class Report {
  chapterMap = {};
  chapters = []

  get chapterCount() {
    return this.chapters?.length;
  }

  get lastPage() {
    return this.chapters?.[this.chapterCount - 1]?.endPage;
  }

  get isFinishedRendering() {
      return !this.chapters.find((c) => !c.isFinishedRendering);
  }
}
