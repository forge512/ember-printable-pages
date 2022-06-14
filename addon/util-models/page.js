import { tracked } from "@glimmer/tracking";
export default class Page {
  @tracked number = 1;
  @tracked endIndex;
  @tracked nextItemIndex;

  constructor(options = {}) {
    let { nextItemIndex, endIndex } = options;
    this.endIndex = endIndex || 0;
    this.nextItemIndex = nextItemIndex || 0;
  }
}
