import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { guidFor } from "@ember/object/internals";
export default class Chapter extends Component {
  elementId = "ember-" + guidFor(this);

  @tracked chapter;

  constructor() {
    super(...arguments)
    this.chapter = this.args.registerChapter(this.elementId, {
      name: this.args.name,
      isToc: !!this.args.isToc,
    });
  }

  get pages() {
    return this.chapter?.pages;
  }

  get startPage() {
    return this.chapter?.startPage;
  }

  get endPage() {
    return this.chapter?.endPage;
  }

  get pageCount() {
    return 1 + this.endPage - this.startPage;
  }

  @action
  onPageOverflow(pageIndex) {
    console.log(`<chapter:${this.elementId}> onPageOverflow`);
    this.chapter.removeLastItem(pageIndex, this.args.addPage);
    this.chapter.renderNextPage(pageIndex, this.args.addPage);
  }

  @action
  renderNextItem(pageIndex, remainingHeight) {
    console.log(`<chapter:${this.elementId}> renderNextItem`);
    this.chapter.renderNextItem(pageIndex, remainingHeight);
    this.args.checkIfComplete();
  }

  @action
  renderNextPage(pageIndex) {
    console.log(`<chapter:${this.elementId}> renderNextPage`);
    this.chapter.renderNextPage(pageIndex, this.args.addPage);
  }
}
