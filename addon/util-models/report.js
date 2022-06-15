import { tracked } from "@glimmer/tracking";
import { TrackedObject, TrackedArray } from "tracked-built-ins";

export default class Report {
  @tracked chapterMap = {};
  @tracked chapters = []

  get chapterCount() {
    return this.chapters?.length;
  }

  get lastPage() {
    return this.chapters?.[this.chapterCount - 1]?.endPage;
  }

  get isFinishedRendering() {
    return (
      this.chapters.filter((c) => c.isFinishedRendering).length ===
      this.chapters.length
    );
  }
}
