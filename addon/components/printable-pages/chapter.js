import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { guidFor } from "@ember/object/internals";
export default class Chapter extends Component {
  elementId = "ember-" + guidFor(this);

  @tracked chapter;

  get pages() {
    return this.chapter?.pages || [];
  }

  get startPage() {
    return this.chapter?.startPage || 0;
  }

  get endPage() {
    return this.chapter?.endPage || 0;
  }

  get pageCount() {
    return 1 + this.endPage - this.startPage;
  }

  @action
  onInsert(element) {
    this.element = element;

    let chapter = this.args.registerChapter(this.elementId, {
      name: this.name,
      isToc: !!this.isToc,
    });

    this.chapter = chapter;
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
