import { tracked } from "@glimmer/tracking";

export default class Page {
  number = 1;
  @tracked endIndex;
  @tracked nextItemIndex;
  @tracked startIndex;

  constructor(options = {}) {
    let { number, nextItemIndex, endIndex, startIndex } = options;
    this.number = number || 1;
    this.startIndex = startIndex || 0;
    this.endIndex = endIndex || 0;
    this.nextItemIndex = nextItemIndex || 0;
  }

  toJson() {
    return {
      number: this.number,
      start: this.startIndex,
      end: this.endIndex,
      next: this.nextItemIndex,
    };
  }
}
