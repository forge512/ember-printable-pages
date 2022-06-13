import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { guidFor } from "@ember/object/internals";
export default class Chapter extends Component {
  elementId = "ember-" + guidFor(this);

  @tracked chapter;

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
  onInsert(element) {
    this.chapter = this.args.registerChapter(this.elementId, {
      name: this.args.name,
      isToc: !!this.args.isToc,
    });
  }

  @action
  onPageOverflow(pageIndex) {
    this.chapter.removeLastItem(pageIndex, this.args.addPage);
  }

  @action
  renderNextItem(pageIndex, remainingHeight) {
    this.chapter.renderNextItem(pageIndex, remainingHeight);
    this.args.checkIfComplete();
  }

  @action
  renderNextPage(pageIndex) {
    this.chapter.renderNextPage(pageIndex, this.args.addPage);
  }
}
