import { tracked } from "@glimmer/tracking";

export default class Page {
  number = 1;
  @tracked endIndex;
  @tracked nextItemIndex;
  @tracked startIndex;

  constructor(options = {}) {
    let { nextItemIndex, endIndex, startIndex } = options;
    this.startIndex = startIndex || 0;
    this.endIndex = endIndex || 0;
    this.nextItemIndex = nextItemIndex || 0;
  }
}
